import { driver } from "../config/db.js";

export async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    console.log('Debug: userId from token:', userId);

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    const session = driver.session();
    try {
      // Content query
      const contentResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:LIKED]->(m1:Movie)-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(m2:Movie)
        WHERE NOT (u)-[:LIKED]->(m2)
        WITH m2, COUNT(t) AS score
        RETURN m2.id, m2.title, score AS contentScore
        ORDER BY score DESC
        LIMIT 20
        `,
        { userId: userId.toString() }
      );

      // Collaborative query
      const collabResult = await session.run(
        `
        MATCH (u:User {id: $userId})-[:LIKED]->(m1)<-[:LIKED]-(other:User)-[:LIKED]->(m2:Movie)
        WHERE NOT (u)-[:LIKED]->(m2) AND other <> u
        WITH m2, COUNT(DISTINCT other) AS score
        RETURN m2.id, m2.title, score AS collabScore
        ORDER BY score DESC
        LIMIT 20
        `,
        { userId: userId.toString() }
      );

      // Merge в Map
      const contentMap = new Map(contentResult.records.map(r => {
        const id = r.get("m2.id");
        return [id, { title: r.get("m2.title"), contentScore: r.get("contentScore").low || 0 }];
      }));

      const collabMap = new Map(collabResult.records.map(r => {
        const id = r.get("m2.id");
        return [id, { title: r.get("m2.title"), collabScore: r.get("collabScore").low || 0 }];
      }));

      const allMovies = new Set([...contentMap.keys(), ...collabMap.keys()]);
      const recommendations = Array.from(allMovies).map(id => {
        const content = contentMap.get(id) || { contentScore: 0 };
        const collab = collabMap.get(id) || { collabScore: 0 };
        const hybridScore = (content.contentScore * 0.6) + (collab.collabScore * 0.4);
        return {
          title: content.title || collab.title,
          id,
          contentScore: content.contentScore,
          collabScore: collab.collabScore,
          relevanceScore: Math.round(hybridScore * 10) / 10
        };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);

      res.json(recommendations);
    } finally {
      await session.close();
    }
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: err.message });
  }
}