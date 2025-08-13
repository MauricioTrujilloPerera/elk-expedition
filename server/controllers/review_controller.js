import Review from "../models/review.js";

// GET all reviews by product
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .populate("product", "name hunt_animalType");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

// POST a new review
export const addReview = async (req, res) => {
  try {
    const { user, product, rating, comment } = req.body;

    const newReview = new Review({
      user,
      product,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error });
  }
};

// DELETE a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};
