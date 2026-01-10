const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// Product Routes
router.post("/products", productController.createProduct); // Create product
router.get("/products", productController.getAllProducts); // Get all products
router.get("/products/search", productController.searchProducts); // Search products
router.get("/products/:id", productController.getProductById); // Get single product
router.put("/products/:id", productController.updateProduct); // Update product
router.delete("/products/:id", productController.deleteProduct); // Delete product

module.exports = router;
