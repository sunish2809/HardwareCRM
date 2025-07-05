const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  billIndex: { type: Number, required: true }, // index of the bill in the customer's bills array
  date: { type: Date, required: true },
  taxAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["due", "partial", "paid"], default: "due" },
});

module.exports = mongoose.model("Tax", taxSchema); 