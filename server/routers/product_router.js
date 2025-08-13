import express from "express";
import { createHunt, getAllHunts, getHuntsByUser, deleteHunt } from "../controllers/product_controller.js";

const router = express.Router();

// Create a new hunt
router.post("/create", createHunt);

// Get all hunts
router.get("/all", getAllHunts);

// Get hunts by user
router.get("/user/:userId", getHuntsByUser);

// Delete a hunt by ID
router.delete("/delete/:id", deleteHunt);

export default router;