// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json()); // To parse JSON data

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);

// Import and use cart routes
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);



// Sample Route
app.get("/", (req, res) => {
  res.send("✅ Samvedics Medicine API is Running");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

  // A simple route to test if the token is being validated
app.get('/api/test-auth', auth, (req, res) => {
    res.json({ msg: 'Token is valid!', userId: req.user.id });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
