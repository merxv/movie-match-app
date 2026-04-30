import mongoose from "mongoose";
import neo4j from "neo4j-driver";

let driver = null; // Lazy init

export { driver }; // Экспорт после присваивания в connectNeo4j

export async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  }
}

export async function connectNeo4j() {
  try {
    if (!driver) {
      if (!process.env.NEO4J_URI) {
        throw new Error("NEO4J_URI not set in .env");
      }
      driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
      );
    }
    // Тестовый запрос
    const session = driver.session();
    try {
      await session.run("RETURN 1");
    } finally {
      await session.close();
    }
    console.log("✅ Neo4j connected");
  } catch (err) {
    console.error("❌ Neo4j error:", err);
    process.exit(1);
  }
}

export async function closeNeo4j() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}