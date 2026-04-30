import express from "express";
import { getAllMovies, createMovie, deleteMovie, updateMovie } from "../controllers/movieController.js";
import { adminMiddleware } from "../middleware/admin.middleware.js"; 
const router = express.Router();

router.get("/", getAllMovies);
router.post("/", adminMiddleware, createMovie); 
router.delete("/:id", adminMiddleware, deleteMovie); 
router.put("/:id", adminMiddleware, updateMovie); 

export default router;