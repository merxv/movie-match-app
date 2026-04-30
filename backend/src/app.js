import dotenv from "dotenv"; // Импорт dotenv в топ
dotenv.config(); // Загрузка .env ДО всех других импортов

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectMongo, connectNeo4j, closeNeo4j } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

connectMongo().then(() => connectNeo4j()).then(() => {
  app.use("/api/users", userRoutes);
  app.use("/api/movies", movieRoutes);
  app.use("/api/recommend", recommendRoutes);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 server running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to connect to DBs:", err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await closeNeo4j();
  process.exit(0);
});