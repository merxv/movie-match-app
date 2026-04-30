import Movie from "../models/movie.js";
import { driver } from "../config/db.js";
import axios from 'axios';

export async function getAllMovies(req, res) {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const fetchTMDBPoster = async (title) => {
  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn('TMDB_ACCESS_TOKEN not set — no poster');
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = response.data;
    console.log('TMDB response:', data.results?.length || 0);

    const movie = data.results?.[0];
    if (movie && movie.poster_path) {
      return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }

    return null;
  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    return null;
  }
};

export async function createMovie(req, res) {
  try {
    const { title, genre, tags, year, description } = req.body;
    const movie = await Movie.create({ 
      title, 
      year: year || null,
      description: description || '',
      genre: genre || [], 
      tags: tags || [] 
    });
    const bannerUrl = await fetchTMDBPoster(title);
    if (bannerUrl) {
      movie.bannerUrl = bannerUrl;
      await movie.save(); 
    }
    console.log('Created movie with bannerUrl:', bannerUrl); 
    
    
    const session = driver.session();
    try {
      await session.run(
        `
        CREATE (m:Movie {id: $movieId, title: $title, year: $year})
        WITH m
        UNWIND $tags AS t
          MERGE (tg:Tag {name: t})
          MERGE (m)-[:HAS_TAG]->(tg)
        RETURN m
        `,
        { 
          movieId: movie._id.toString(),
          title,
          year: year || null,
          tags: tags || []
        }
      );
    } finally {
      await session.close();
    }
    
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


export async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const session = driver.session();
    try {
      await session.run(
        `
        MATCH (m:Movie {id: $movieId})
        DETACH DELETE m
        `,
        { movieId: id }
      );
    } finally {
      await session.close();
    }

    res.json({ message: "Movie deleted successfully", deletedId: id });
  } catch (err) {
    console.error('Delete movie error:', err);
    res.status(500).json({ error: err.message });
  }
}


export async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body; 

    // Mongo: Обновляем документ
    const movie = await Movie.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const posterUrl = await fetchTMDBPoster(movie.title);
      if (posterUrl) {
        movie.bannerUrl = posterUrl;
        await movie.save();
        console.log(`Poster added for movie ${movie.title}: ${posterUrl}`);
      } else {
        console.log(`No poster found for ${movie.title}`);
      }

    // Neo4j: Обновляем узел + теги (фикс: WITH после DELETE)
    const session = driver.session();
    try {
      await session.run(
        `
        MATCH (m:Movie {id: $movieId})
        SET m.title = $title, m.year = $year
        WITH m
        MATCH (m)-[old:HAS_TAG]->(oldTg:Tag)
        DELETE old
        WITH m 
        UNWIND $tags AS t
          MERGE (tg:Tag {name: t})
          MERGE (m)-[:HAS_TAG]->(tg)
        RETURN m
        `,
        { 
          movieId: id,
          title: updateData.title !== undefined ? updateData.title : movie.title,
          year: updateData.year !== undefined ? updateData.year : movie.year,
          description: updateData.description !== undefined ? updateData.description : movie.description,
          tags: updateData.tags !== undefined ? updateData.tags : movie.tags
        }
      );
    } finally {
      await session.close();
    }

    res.json({ message: "Movie updated successfully", movie });
  } catch (err) {
    console.error('Update movie error:', err);
    res.status(400).json({ error: err.message });
  }
}