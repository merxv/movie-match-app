import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  type: { type: String, enum: ['like', 'unlike'], required: true }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Interaction", interactionSchema);