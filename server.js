

const express = require('express');
const cors = require('cors');  // Added CORS
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());              // Enable CORS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let products = [
  { id: 1, name: "Organic Honey Jar", description: "Pure local organic honey.", price: 10.99, image_url: "https://via.placeholder.com/150", category: "Food" },
  { id: 2, name: "Handmade Soap", description: "Natural ingredients soap.", price: 5.99, image_url: "https://via.placeholder.com/150", category: "Personal Care" },
  { id: 3, name: "Herbal Tea", description: "Refreshing and healthy.", price: 7.49, image_url: "https://via.placeholder.com/150", category: "Food" },
  { id: 4, name: "Scented Candle", description: "Relaxing aroma.", price: 12.00, image_url: "https://via.placeholder.com/150", category: "Home Decor" }
];

let cart = [];

// Get products with optional category and sorting
app.get('/products', (req, res) => {
  let result = [...products];
  if (req.query.category) {
    const categoryFilter = req.query.category.toLowerCase();
    result = result.filter(p => p.category.toLowerCase() === categoryFilter);
  }
  if (req.query.sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (req.query.sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  }
  res.json(result);
});

// Add or update product quantity in cart
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (quantity <= 0) return res.status(400).json({ message: "Quantity must be positive" });

  let cartItem = cart.find(item => item.product.id === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  res.json(cart);
});

// Update quantity for a cart item
app.put('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;
  if (quantity < 0) return res.status(400).json({ message: "Quantity cannot be negative" });

  const cartItem = cart.find(item => item.product.id === productId);
  if (!cartItem) return res.status(404).json({ message: "Item not found in cart" });

  if (quantity === 0) {
    cart = cart.filter(item => item.product.id !== productId);
  } else {
    cartItem.quantity = quantity;
  }
  res.json(cart);
});

// Remove product from cart
app.delete('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const cartLengthBefore = cart.length;
  cart = cart.filter(item => item.product.id !== productId);
  if (cart.length === cartLengthBefore) {
    return res.status(404).json({ message: "Item not found in cart" });
  }
  res.json(cart);
});

// Get current cart
app.get('/cart', (req, res) => {
  res.json(cart);
});

// Calculate bill total
app.get('/cart/bill', (req, res) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  res.json({ total: total.toFixed(2) });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
