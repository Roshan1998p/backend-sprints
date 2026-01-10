// const { Product } = require("../models");
// exports.createProduct = async (req, res) => {
//   console.log("createProduct");

//   try {
//     const product = await Product.create({
//       name: req.body.product_name,
//       price: req.body.price,
//       description: req.body.description,
//       productId: req.body.productId,
//     });
//     res.status(201).json({
//       message: "Product created successfully",
//       data: product,
//     });
//   } catch (error) {
//     res.status(400).json({
//       error: error.message,
//     });
//   }
// };
const pool = require("../db");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      image_url,
      sku,
    } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: "Product name and price are required",
      });
    }

    // Generate SKU if not provided
    const productSKU =
      sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert query with parameterized values
    const query = `
      INSERT INTO products (
        name, description, price, category, 
        stock_quantity, image_url, sku
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      name,
      description || null,
      parseFloat(price),
      category || null,
      parseInt(stock_quantity) || 0,
      image_url || null,
      productSKU,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating product:", error.message);

    // Handle specific errors
    if (error.code === "23505") {
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: "Product SKU already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create product",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Support filtering by category
    const category = req.query.category;

    let query = "SELECT * FROM products";
    let values = [];
    let conditions = [];

    if (category) {
      conditions.push(`category = $${conditions.length + 1}`);
      values.push(category);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Add sorting and pagination
    query += " ORDER BY created_at DESC";
    query += ` LIMIT $${conditions.length + 1} OFFSET $${
      conditions.length + 2
    }`;

    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM products";
    if (category) {
      countQuery += " WHERE category = $1";
    }
    const countResult = await pool.query(
      category ? countQuery : countQuery,
      category ? [category] : []
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = "SELECT * FROM products WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if product exists
    const checkQuery = "SELECT * FROM products WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "stock_quantity",
      "image_url",
      "sku",
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update",
      });
    }

    // Add updated_at timestamp
    fields.push(`updated_at = NOW()`);

    // Add id to values
    values.push(id);

    const query = `
      UPDATE products 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "Product SKU already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update product",
    });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM products WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
};

// Search Products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const query = `
      SELECT * FROM products 
      WHERE name ILIKE $1 
      OR description ILIKE $1 
      OR category ILIKE $1
      ORDER BY name
      LIMIT 20
    `;

    const result = await pool.query(query, [`%${q}%`]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error searching products:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to search products",
    });
  }
};
