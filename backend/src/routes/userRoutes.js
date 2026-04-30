import express from "express";
import { registerUser, loginUser, likeMovie, getCurrentUser, unlikeMovie, fetchProfile, deleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser); 
router.post("/like/:movieId", authMiddleware, likeMovie); 
router.delete("/unlike/:movieId", authMiddleware, unlikeMovie); 
router.get("/profile", authMiddleware, fetchProfile); 
router.delete("/:userId", adminMiddleware, deleteUser); 

export default router;