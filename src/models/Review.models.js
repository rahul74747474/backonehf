import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  managerRating: {
    type: Number,
    min: 0,
    max: 15,
    default: 0,
  },

  hrRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },

  managerComment: {
    type: String,
    default: "",
    trim: true,
  },

  hrComment: {
    type: String,
    default: "",
    trim: true,
  },

  date: {
    type: String, // YYYY-MM-DD
    default: () => new Date().toISOString().split("T")[0],
  },
});

export const Review = mongoose.model("Review", ReviewSchema);
