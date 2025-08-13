import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  phone: { type: String, required: false },
  hunt_animalType: { type: String, required: true },
  hunt_location: { type: String, required: true },
  hunt_date: { type: Date, required: true },
  hunt_price: { type: Number, required: true },
  hunt_displayImages: { type: String, required: false },
  hunt_duration: { type: Number, required: false },
  hunt_tags: [{ type: String }], // different because it will be an array of values!
  maxGroupSize: { type: Number, required: false },
  hunt_packageType: [{ type: String, required: false }],
  description: { type: String, required: false },
  userId: { type: String, required: true },
});

const Product = mongoose.model("products", productSchema);

export default Product;