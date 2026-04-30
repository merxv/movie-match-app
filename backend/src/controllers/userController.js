import User from "../models/user.js";
import Movie from "../models/movie.js";
import bcrypt from "bcryptjs";
import { driver } from "../config/db.js";
import Interaction from "../models/interaction.js";
import jwt from "jsonwebtoken";

export async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role: 'user' });
    
    const session = driver.session();
    try {
      await session.run(
        "CREATE (:User {id: $userId, username: $username})",
        { userId: user._id.toString(), username }
      );
    } finally {
      await session.close();
    }
    
    res.status(201).json({ id: user._id, username, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function likeMovie(req, res) {
  try {
    const userId = req.user.id; 
    const { movieId } = req.params; 

    const user = await User.findById(userId); 
    const movie = await Movie.findById(movieId);
    if (!user || !movie) {
      return res.status(404).json({ message: "User or movie not found" });
    }

    if (user.likedMovies.includes(movieId)) {
      return res.status(400).json({ message: "Already liked" });
    }
    // Логирование в Mongo
    await Interaction.create({ userId, movieId, type: 'like' });

    user.likedMovies.push(movieId);
    await user.save();

    const session = driver.session();
    try {
      await session.run(
        `
        MATCH (u:User {id: $userId})
        MATCH (m:Movie {id: $movieId})
        MERGE (u)-[:LIKED]->(m)
        WITH m
        UNWIND $tags AS tag
          MERGE (t:Tag {name: tag})
          MERGE (m)-[:HAS_TAG]->(t)
        `,
        { 
          userId: userId.toString(), 
          movieId: movieId.toString(),
          tags: movie.tags || []
        }
      );
    } finally {
      await session.close();
    }

    res.json({ message: "Movie liked!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function unlikeMovie(req, res) {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    // Удаляем из массива
    user.likedMovies = user.likedMovies.filter(id => id.toString() !== movieId);
    await user.save();

    // Логирование в Mongo
    await Interaction.create({ userId, movieId, type: 'unlike' });

    // Neo4j: Удаляем связь
    const session = driver.session();
    try {
      await session.run(
        `
        MATCH (u:User {id: $userId})-[r:LIKED]->(m:Movie {id: $movieId})
        DELETE r
        `,
        { userId: userId.toString(), movieId: movieId.toString() }
      );
    } finally {
      await session.close();
    }

    res.json({ message: "Movie unliked!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



export async function fetchProfile(req, res) {
  try {
    const userId = req.user.id;

    // User + likedMovies
    const user = await User.findById(userId)
      .populate({
        path: 'likedMovies',
        select: '_id title year genre tags description bannerUrl',
        model: 'Movie'
      })
      .lean()
      .select('-password');

    if (!user) return res.status(404).json({ error: "User not found" });

    // Время лайков
    const interactions = await Interaction.find({ userId, type: 'like' })
      .sort({ createdAt: -1 })
      .select('movieId createdAt');

    const likeTimestamps = {};
    interactions.forEach(inter => {
      const movieStr = inter.movieId.toString();
      if (!likeTimestamps[movieStr]) {
        likeTimestamps[movieStr] = inter.createdAt.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
      }
    });

    // Map с проверкой _id
    const likedWithDetails = user.likedMovies.map(movie => {
      const movieStr = movie._id.toString();
      return {
        _id: movie._id, 
        title: movie.title || 'Unknown Title',
        year: movie.year || null,
        genre: movie.genre || [],
        description: movie.description || '',
        bannerUrl: movie.bannerUrl,
        likeTimestamp: likeTimestamps[movieStr] || 'Unknown date'
      };
    });

    user.likedMovies = likedWithDetails;

    console.log('Profile likedMovies after map:', user.likedMovies); 

    res.json(user);
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: err.message });
  }
}


export async function deleteUser(req, res) {
  try {
    const { userId } = req.params; // ID для удаления
    const currentUserId = req.user.id; // ID админа из токена

    // Проверяем, что админ не удаляет себя
    if (userId === currentUserId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Удаляем interactions в Mongo
    await Interaction.deleteMany({ userId });

    // 2. Удаляем связи и узел в Neo4j
    const session = driver.session();
    try {
      // Удаляем связи LIKED
      await session.run(
        `
        MATCH (u:User {id: $userId})-[r:LIKED]->(m:Movie)
        DELETE r
        `,
        { userId: userId.toString() }
      );
      // Удаляем узел User (DETACH для очистки остатков)
      await session.run(
        `
        MATCH (u:User {id: $userId})
        DETACH DELETE u
        `,
        { userId: userId.toString() }
      );
    } finally {
      await session.close();
    }

    // 3. Удаляем документ User в Mongo
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully", deletedUserId: userId });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
}