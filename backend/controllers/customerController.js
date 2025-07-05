const Customer = require("../models/Customer");
const Tax = require("../models/Tax");

exports.createBill = async (req, res) => {
  const { name, phone, items, totalAmount, paidAmount, tax } = req.body;

  const billItems = items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantityLabel: item.quantityLabel,
    boxes: item.boxes,
    pricePerBox: item.pricePerBox,
  }));

  const dueAmount = totalAmount - paidAmount;
  let customer = await Customer.findOne({ phone });

  const bill = {
    date: new Date(),
    items: billItems,
    totalAmount,
    paidAmount,
    dueAmount,
    tax: parseFloat(tax || 0), // ✅ include tax
  };

  let billIndex;
  if (!customer) {
    customer = new Customer({ name, phone, bills: [bill] });
    billIndex = 0;
  } else {
    customer.name = name;
    customer.bills.push(bill);
    billIndex = customer.bills.length - 1;
  }

  await customer.save();

  // Create tax record for this bill
  if (bill.tax > 0) {
    await Tax.create({
      customer: customer._id,
      billIndex,
      date: customer.bills[billIndex].date || new Date(),
      taxAmount: bill.tax,
      dueAmount: bill.tax,
      paidAmount: 0,
      status: "due",
    });
  }

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

// Pay due amounts for a customer (oldest bills first)
exports.payDue = async (req, res) => {
  const { phone } = req.params;
  let { amount } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ error: "Invalid payment amount" });

  const customer = await Customer.findOne({ phone });
  if (!customer) return res.status(404).json({ error: "Customer not found" });


  // Use the same approach as tax system: filter bills with dues and sort by date
  const billsWithDues = customer.bills
    .map((bill, index) => ({ 
      ...bill.toObject(), 
      billIndex: index // This is the original index in customer.bills array
    }))
    .filter(bill => bill.dueAmount > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (billsWithDues.length === 0) {
    return res.status(400).json({ error: "No bills with outstanding dues" });
  }


  let remaining = amount;
  const paymentDetails = [];
  
  // Apply payment to oldest bills first
  for (const billData of billsWithDues) {
    if (remaining <= 0) break;
    
    const pay = Math.min(billData.dueAmount, remaining);
    
    // Update the bill in the original customer.bills array using the original billIndex
    const originalBillIndex = billData.billIndex;
    customer.bills[originalBillIndex].paidAmount += pay;
    customer.bills[originalBillIndex].dueAmount -= pay;
    
    paymentDetails.push({
      billDate: new Date(billData.date).toISOString(),
      originalIndex: originalBillIndex,
      paid: pay,
      remainingDue: customer.bills[originalBillIndex].dueAmount
    });
    
    
    remaining -= pay;
  }

  await customer.save();


  res.json({ 
    message: "Payment recorded", 
    customer,
    paid: amount - remaining,
    remaining,
    paymentDetails
  });
};

// Get all customers with tax status (due/paid)
exports.getAllTaxCustomers = async (req, res) => {
  const Tax = require("../models/Tax");
  const Customer = require("../models/Customer");
  const taxAgg = await Tax.aggregate([
    {
      $group: {
        _id: "$customer",
        totalDue: { $sum: "$dueAmount" },
        totalTax: { $sum: "$taxAmount" },
      },
    },
  ]);
  const customers = await Customer.find({ _id: { $in: taxAgg.map(t => t._id) } });
  const result = customers.map(c => {
    const tax = taxAgg.find(t => t._id.toString() === c._id.toString());
    return {
      _id: c._id,
      name: c.name,
      phone: c.phone,
      totalDue: tax?.totalDue || 0,
      totalTax: tax?.totalTax || 0,
      status: (tax?.totalDue || 0) > 0 ? "Due" : "Paid",
    };
  });
  res.json(result);
};

// Get all tax records for a customer
exports.getCustomerTaxRecords = async (req, res) => {
  const { customerId } = req.params;
  const Tax = require("../models/Tax");
  const Customer = require("../models/Customer");
  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  const taxes = await Tax.find({ customer: customerId }).sort({ date: 1 });
  // Attach bill info
  const records = taxes.map(tax => {
    const bill = customer.bills[tax.billIndex] || {};
    return {
      ...tax.toObject(),
      bill,
    };
  });
  res.json({ customer, taxes: records });
};

// Pay tax dues for a customer (oldest first)
exports.payTaxDue = async (req, res) => {
  const { customerId } = req.params;
  let { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid payment amount" });
  const Tax = require("../models/Tax");
  const taxes = await Tax.find({ customer: customerId, dueAmount: { $gt: 0 } }).sort({ date: 1 });
  let remaining = amount;
  for (const tax of taxes) {
    if (remaining <= 0) break;
    const pay = Math.min(tax.dueAmount, remaining);
    tax.paidAmount += pay;
    tax.dueAmount -= pay;
    if (tax.dueAmount === 0) tax.status = "paid";
    else tax.status = "partial";
    await tax.save();
    remaining -= pay;
  }
  res.json({ message: "Tax payment processed", paid: amount - remaining, remaining });
};

// Test function to set bill dates manually (for testing payment logic)
exports.setBillDates = async (req, res) => {
  const { phone } = req.params;
  const { dates } = req.body; // Array of dates in ISO string format

  const customer = await Customer.findOne({ phone });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  if (dates && dates.length === customer.bills.length) {
    customer.bills.forEach((bill, index) => {
      bill.date = new Date(dates[index]);
    });
    await customer.save();
    res.json({ message: "Bill dates updated", customer });
  } else {
    res.status(400).json({ error: "Invalid dates array" });
  }
};

// Function to fix bill dates (set them chronologically based on creation order)
exports.fixBillDates = async (req, res) => {
  const { phone } = req.params;

  const customer = await Customer.findOne({ phone });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  // Set dates chronologically (oldest first)
  const baseDate = new Date('2024-01-01'); // Start from Jan 1st
  customer.bills.forEach((bill, index) => {
    bill.date = new Date(baseDate.getTime() + (index * 24 * 60 * 60 * 1000)); // Add 1 day per bill
  });
  
  await customer.save();
  

  
  res.json({ message: "Bill dates fixed", customer });
};
