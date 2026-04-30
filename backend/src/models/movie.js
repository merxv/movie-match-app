import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number }, 
  description: { type: String },
  genre: [{ type: String }], 
  tags: [{ type: String }],
  bannerUrl: { type: String }
});

export default mongoose.model("Movie", movieSchema);