// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: 'no-image.jpg', // A placeholder image
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);