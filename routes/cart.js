// routes/cart.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// @route    GET /api/cart
// @desc     Get the user's cart
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found for this user' });
        }
        res.json(cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST /api/cart
// @desc     Add a product to the cart
// @access   Private
router.post('/', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (cart) {
            // Cart exists, check if product is already in the cart
            let itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            cart = await cart.save();
            res.json(cart);
        } else {
            // No cart exists, create a new one
            const newCart = new Cart({
                user: req.user.id,
                items: [{ product: productId, quantity }]
            });
            const savedCart = await newCart.save();
            res.json(savedCart);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE /api/cart/:itemId
// @desc     Remove an item from the cart
// @access   Private
router.delete('/:itemId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        res.json({ msg: 'Item removed from cart' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 

// @route    PUT /api/cart
// @desc     Update quantity of an item in the cart
// @access   Private
router.put('/', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        // Find the index of the item to update
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // If item exists, update its quantity
            cart.items[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ msg: 'Product not found in cart' });
        }

        cart = await cart.save();
        res.json(cart);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route    POST /api/cart/checkout
// @desc     Checkout and create an order
// @access   Private
router.post('/checkout', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // Create a new order
    const newOrder = new Order({
      user: req.user.id,
      items: cart.items,
      totalAmount: totalAmount,
    });

    await newOrder.save();

    // Clear the user's cart after checkout
    cart.items = [];
    await cart.save();

    res.status(201).json({ msg: 'Checkout successful', orderId: newOrder._id });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;