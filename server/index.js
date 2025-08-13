import express from "express";
import mongoose from "mongoose"; //connect to database
import dotenv from "dotenv"; // this links the .env file we have in this dir
import cors from "cors";
// import product_router from "./routers/product_router.js"
import LoginAuth from "./LoginAuth.js";
import product_router from "./routers/product_router.js";
// import user_router from "./routers/product_router.js"
// import review_router from "./routers/product_router.js"

dotenv.config(); // adds our env config to the server config for use

const app = express();
const PORT = process.env.PORT || 8000;

/* MongoDB Setup - - - - - - - - - - - - - - - - - - - - - - - */
mongoose.connect(process.env.MONGODB_CONNECTION);
const database = mongoose.connection;

database.once("open", () => { // opens the mongodb database server
  console.log("Connected to MongoDB");
});

database.on("error", (err) => { // turns the mongodb connection ON
  console.log("DB Error");
});
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.json({message: "Welcome to our server"});
});

app.use("/auth", LoginAuth);
app.use("/products", product_router);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

app.use("", (req, res) => {
  res.status(404).send("Page not found");
});