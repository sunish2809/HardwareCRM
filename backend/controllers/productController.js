const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

exports.addProduct = async (req, res) => {
  try {
    const { name, quantities } = req.body;

    if (!name || !quantities || !Array.isArray(quantities)) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = new Product({
      name,
      quantities,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

exports.updateStock = async (req, res) => {
  const { updates } = req.body;

  try {
    for (const update of updates) {
      const { productId, quantityLabel, boxesSold } = update;

      const product = await Product.findById(productId);
      if (!product) continue;

      const quantity = product.quantities.find(
        (q) => q.quantityLabel === quantityLabel
      );
      if (!quantity) continue;

      quantity.stock -= boxesSold;

      // Remove quantity if stock is 0 or less
      if (quantity.stock <= 0) {
        product.quantities = product.quantities.filter(
          (q) => q.quantityLabel !== quantityLabel
        );
      }

      // If all quantities are removed, delete the product
      if (product.quantities.length === 0) {
        await Product.findByIdAndDelete(productId);
        continue; // skip save since product is deleted
      }

      await product.save();
    }

    res.json({ message: "Stock updated and cleaned up successfully" });
  } catch (err) {
    console.error("Error updating stock:", err.message);
    res.status(500).json({ error: "Failed to update stock" });
  }
};
