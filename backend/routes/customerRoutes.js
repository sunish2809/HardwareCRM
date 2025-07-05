const express = require("express");
const router = express.Router();
const {
  createBill,
  getCustomer,
  getAllCustomers,
  payDue,
  getAllTaxCustomers,
  getCustomerTaxRecords,
  payTaxDue,
  setBillDates,
  fixBillDates,
} = require("../controllers/customerController");
const auth = require("../middlewares/authMiddleware");

router.post("/bill", auth, createBill);
router.get("/tax", auth, getAllTaxCustomers);
router.get("/tax/:customerId", auth, getCustomerTaxRecords);
router.put("/tax/pay/:customerId", auth, payTaxDue);
router.get("/:phone", auth, getCustomer);
router.get("/", auth, getAllCustomers);
router.put("/pay-due/:phone", auth, payDue);
router.put("/set-bill-dates/:phone", auth, setBillDates);
router.put("/fix-bill-dates/:phone", auth, fixBillDates);

module.exports = router;
