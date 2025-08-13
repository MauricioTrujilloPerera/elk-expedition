import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assumes your user model is named 'User'
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // assumes your product model is named 'Product'
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // Typical 5-star system
  },
  comment: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;