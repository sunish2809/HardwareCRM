const express = require('express');
const router = express.Router();
const { createBill, getCustomer } = require('../controllers/customerController');
const auth = require('../middlewares/authMiddleware');

router.post('/bill', auth, createBill);
router.get('/:phone', auth, getCustomer);

module.exports = router;
