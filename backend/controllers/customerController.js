const Customer = require('../models/Customer');

exports.createBill = async (req, res) => {
  const { name, phone, items, totalAmount, paidAmount } = req.body;
  const dueAmount = totalAmount - paidAmount;

  let customer = await Customer.findOne({ phone });

  const bill = { items, totalAmount, paidAmount, dueAmount };

  if (!customer) {
    customer = new Customer({ name, phone, bills: [bill] });
  } else {
    customer.name = name;
    customer.bills.push(bill);
  }

  await customer.save();
  res.json({ message: 'Bill recorded', customer });
};

exports.getCustomer = async (req, res) => {
  const { phone } = req.params;
  const customer = await Customer.findOne({ phone });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const latestBill = customer.bills[customer.bills.length - 1];
  res.json({ customer, latestBill });
};
