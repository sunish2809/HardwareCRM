import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CustomerDetails = () => {
  const token = localStorage.getItem("token");
  const { phone } = useParams();
  const [customer, setCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${phone}`);
      setCustomer(res.data);
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [phone]);

  const handlePayDue = async () => {
    try {
      await api.put(
        `/customers/pay-due/${phone}`,
        { amount: parseFloat(paymentAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMsg("Payment updated successfully ✅");
      setErrorMsg("");
      setPaymentAmount("");
      fetchCustomer(); // refresh customer data
    } catch (error) {
      console.error("Error updating due:", error);
      setErrorMsg("Failed to update payment ❌");
      setSuccessMsg("");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const { name, phone } = customer.customer;
    const bills = customer.customer.bills;

    doc.setFontSize(16);
    doc.text("Customer Bill Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 14, 30);
    doc.text(`Phone: ${phone}`, 14, 38);

    const rows = [];

    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        rows.push([
          new Date(bill.date).toLocaleDateString(),
          item.productName,
          item.quantityLabel,
          item.boxes,
          item.pricePerBox,
          bill.totalAmount,
          bill.paidAmount,
          bill.dueAmount,
        ]);
      });
    });

    // Register autoTable to doc
    autoTable(doc, {
      head: [
        [
          "Date",
          "Product",
          "Quantity",
          "Boxes",
          "Price/Box",
          "Total",
          "Paid",
          "Due",
        ],
      ],
      body: rows,
      startY: 45,
    });

    doc.save(`${name}_bill_report.pdf`);
  };

  if (!customer)
    return <p className="text-center mt-8">Loading customer details...</p>;

  const { name, bills } = customer.customer;
  const latest = customer.latestBill;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2 text-center">Customer: {name}</h2>
      <p className="text-center mb-4 text-gray-600">Phone: {phone}</p>

      {/* Latest Bill Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Latest Bill</h3>
        {latest && (
          <div>
            <ul className="list-disc ml-5 mb-2">
              {latest.items.map((item, i) => (
                <li key={i}>
                  {item.productName} - {item.quantityLabel} - {item.boxes}{" "}
                  box(es) x ₹{item.pricePerBox}
                </li>
              ))}
            </ul>
            <p>Total: ₹{latest.totalAmount}</p>
            <p>Paid: ₹{latest.paidAmount}</p>
            <p className="text-red-600">Due: ₹{latest.dueAmount}</p>
            <p className="text-sm text-gray-500">
              Date: {new Date(latest.date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleDownloadPDF}
        className="mt-3 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
      >
        Download PDF
      </button>

      {/* Pay Due Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2 text-lg">Pay Remaining Due</h3>

        {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}
        {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}

        <input
          type="number"
          placeholder="Amount to pay"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          className="w-full border px-3 py-2 mb-3"
        />

        <button
          onClick={handlePayDue}
          disabled={!paymentAmount}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          Pay Due
        </button>
      </div>

      {/* All Bills Section */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">All Bills</h3>
        {bills
          .slice()
          .reverse()
          .map((bill, idx) => (
            <div key={idx} className="border-t py-2">
              <p className="text-sm text-gray-600">
                {new Date(bill.date).toLocaleDateString()}
              </p>
              <ul className="list-disc ml-5">
                {bill.items.map((item, i) => (
                  <li key={i}>
                    {item.productName} - {item.quantityLabel} - {item.boxes}{" "}
                    box(es) x ₹{item.pricePerBox}
                  </li>
                ))}
              </ul>
              <p>
                Total: ₹{bill.totalAmount} | Paid: ₹{bill.paidAmount} |{" "}
                <span className="text-red-600">Due: ₹{bill.dueAmount}</span>
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CustomerDetails;
