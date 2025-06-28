const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../controllers/productController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, getAllProducts);

module.exports = router;
