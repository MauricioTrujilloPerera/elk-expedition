import Product from "../models/product.js";

// Create a new hunt
export const createHunt = async (req, res) => {
  try {
    const {
      phone,
      hunt_animalType,
      hunt_location,
      hunt_date,
      hunt_price,
      hunt_displayImages,
      hunt_duration,
      hunt_tags,
      maxGroupSize,
      hunt_packageType,
      description,
      userId
    } = req.body;

    // Validate required fields
    if (!hunt_animalType || !hunt_location || !hunt_date || !hunt_price) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Parse and validate types
    let parsedMaxGroupSize = undefined;
    if (maxGroupSize !== undefined && maxGroupSize !== null && maxGroupSize !== "") {
      parsedMaxGroupSize = Number(maxGroupSize);
      if (isNaN(parsedMaxGroupSize) || parsedMaxGroupSize < 1) {
        return res.status(400).json({ message: "maxGroupSize must be a positive number." });
      }
    }
    let parsedPhone = phone || undefined;
    let parsedHuntPrice = Number(hunt_price);
    if (isNaN(parsedHuntPrice)) {
      return res.status(400).json({ message: "hunt_price must be a number." });
    }
    let parsedHuntDuration = hunt_duration !== undefined && hunt_duration !== null && hunt_duration !== "" ? Number(hunt_duration) : undefined;
    if (hunt_duration !== undefined && hunt_duration !== null && hunt_duration !== "" && isNaN(parsedHuntDuration)) {
      return res.status(400).json({ message: "hunt_duration must be a number." });
    }
    let parsedHuntDate = new Date(hunt_date);
    if (isNaN(parsedHuntDate.getTime())) {
      return res.status(400).json({ message: "hunt_date must be a valid date." });
    }

    const newHunt = new Product({
      phone: parsedPhone,
      hunt_animalType,
      hunt_location,
      hunt_date: parsedHuntDate,
      hunt_price: parsedHuntPrice,
      hunt_displayImages,
      hunt_duration: parsedHuntDuration,
      hunt_tags: hunt_tags ? (Array.isArray(hunt_tags) ? hunt_tags : String(hunt_tags).split(',').map(t => t.trim()).filter(t => t.length > 0)) : [],
      maxGroupSize: parsedMaxGroupSize,
      hunt_packageType: hunt_packageType ? (Array.isArray(hunt_packageType) ? hunt_packageType : [hunt_packageType]) : [],
      description,
      userId
    });
    const saved = await newHunt.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating hunt:", err);
    res.status(500).json({ message: "Error creating hunt", error: err.message });
  }
};

// Get all hunts
export const getAllHunts = async (req, res) => {
  try {
    const hunts = await Product.find();
    res.status(200).json(hunts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching hunts", error: err.message });
  }
};

// Get hunts by user
export const getHuntsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const hunts = await Product.find({ userId });
    res.status(200).json(hunts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user's hunts", error: err.message });
  }
};

// Delete a hunt by ID
export const deleteHunt = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Hunt not found" });
    }
    res.status(200).json({ message: "Hunt deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting hunt", error: err.message });
  }
}; 