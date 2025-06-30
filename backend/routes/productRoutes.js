const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  addProduct,
  updateStock,
  updateStockManually,
} = require("../controllers/productController");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth, getAllProducts);

router.post("/", auth, addProduct);

router.put("/update-stock", auth, updateStock);

router.put("/:id/update-stock", auth, updateStockManually);

module.exports = router;
