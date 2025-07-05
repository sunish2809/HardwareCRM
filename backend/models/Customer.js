const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  items: [
    {
      productName: String,
      quantityLabel: String,
      boxes: Number,
      pricePerBox: Number,
    },
  ],
  totalAmount: Number,
  paidAmount: Number,
  dueAmount: Number,
  tax: Number,
});

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  bills: [billSchema],
});

customerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Customer", customerSchema);
