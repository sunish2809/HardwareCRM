const mongoose = require('mongoose');

const quantitySchema = new mongoose.Schema({
  quantityLabel: String,
  stock: Number
});

const productSchema = new mongoose.Schema({
  name: String,
  quantities: [quantitySchema]
});

module.exports = mongoose.model('Product', productSchema);

