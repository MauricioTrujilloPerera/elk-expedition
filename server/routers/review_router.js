import express from "express";
import {
  getReviewsByProduct,
  addReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// GET all reviews for a product
router.get("/product/:productId", getReviewsByProduct);

// POST a new review
// PLEASE, ADD TOKEN VERIFICATION - HARMAN WILL LOOK
router.post("/", addReview);

// DELETE a review by ID
router.delete("/:id", deleteReview);

export default router;
