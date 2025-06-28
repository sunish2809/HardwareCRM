const express = require("express");
const router = express.Router();
const {
  createBill,
  getCustomer,
  getAllCustomers,
} = require("../controllers/customerController");
const auth = require("../middlewares/authMiddleware");

router.post("/bill", auth, createBill);
router.get("/:phone", auth, getCustomer);
router.get("/", auth, getAllCustomers);

module.exports = router;
