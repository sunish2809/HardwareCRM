const Customer = require("../models/Customer");

exports.createBill = async (req, res) => {
  const { name, phone, items, totalAmount, paidAmount } = req.body;

  const billItems = items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantityLabel: item.quantityLabel,
    boxes: item.boxes,
    pricePerBox: item.pricePerBox,
  }));

  const dueAmount = totalAmount - paidAmount;
  let customer = await Customer.findOne({ phone });

  const bill = { items: billItems, totalAmount, paidAmount, dueAmount };

  if (!customer) {
    customer = new Customer({ name, phone, bills: [bill] });
  } else {
    customer.name = name;
    customer.bills.push(bill);
  }

  await customer.save();
  res.json({ message: "Bill recorded", customer });
};

exports.getCustomer = async (req, res) => {
  const { phone } = req.params;
  const customer = await Customer.findOne({ phone });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const latestBill = customer.bills[customer.bills.length - 1];
  res.json({ customer, latestBill });
};

exports.getAllCustomers = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {
    $or: [
      { name: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
    ],
  };

  const customers = await Customer.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Customer.countDocuments(query);

  const customersWithStatus = customers.map((c) => {
    const latest = c.bills[c.bills.length - 1];
    const status = latest?.dueAmount > 0 ? "Due" : "Paid";
    return {
      name: c.name,
      phone: c.phone,
      status,
    };
  });

  res.json({
    data: customersWithStatus,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
};

// controller
exports.payDue = async (req, res) => {
  const { phone } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ error: "Invalid payment amount" });

  const customer = await Customer.findOne({ phone });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const latestBill = customer.bills[customer.bills.length - 1];
  if (!latestBill) return res.status(400).json({ error: "No bills found" });

  latestBill.paidAmount += amount;
  latestBill.dueAmount -= amount;

  await customer.save();

  res.json({ message: "Payment recorded", customer });
};
