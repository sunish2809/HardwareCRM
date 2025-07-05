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
  const [paying, setPaying] = useState(false);
  const [fixingDates, setFixingDates] = useState(false);

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
    setPaying(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await api.put(
        `/customers/pay-due/${phone}`,
        { amount: parseFloat(paymentAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMsg(`Payment of ₹${res.data.paid} processed successfully ✅`);
      if (res.data.remaining > 0) {
        setSuccessMsg((prev) => prev + ` (₹${res.data.remaining} remaining)`);
      }
      if (res.data.paymentDetails?.length) {
        const details = res.data.paymentDetails
          .map(
            (d) =>
              `${new Date(d.billDate).toLocaleDateString()}: ₹${d.paid} (₹${
                d.remainingDue
              } remaining)`
          )
          .join(", ");
        setSuccessMsg((prev) => prev + `\nApplied to: ${details}`);
      }
      setErrorMsg("");
      setPaymentAmount("");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedCustomer = await api.get(`/customers/${phone}`);
      setCustomer(updatedCustomer.data);
    } catch (error) {
      console.error("Error updating due:", error);
      setErrorMsg(error.response?.data?.error || "Failed to update payment ❌");
      setSuccessMsg("");
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const { name, phone } = customer.customer;
    const latest = customer.latestBill;
    doc.setFontSize(16);
    doc.text("Customer Bill Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 14, 30);
    doc.text(`Phone: ${phone}`, 14, 38);

    const rows = [];

    if (latest) {
      const date = new Date(latest.date).toLocaleDateString();
      const tax = latest.tax || 0;
      const totalAfterTax = latest.totalAmount || 0;
      const totalBeforeTax = tax + totalAfterTax;

      latest.items.forEach((item) => {
        rows.push([
          date,
          item.productName,
          item.quantityLabel,
          item.boxes,
          item.pricePerBox,
          "",
          "",
          "",
          "",
          "",
        ]);
      });

      rows.push([
        "",
        "",
        "",
        "",
        "Subtotal →",
        totalBeforeTax,
        tax,
        totalAfterTax,
        latest.paidAmount || 0,
        latest.dueAmount || 0,
      ]);
    }

    autoTable(doc, {
      head: [
        [
          "Date",
          "Product",
          "Quantity",
          "Boxes",
          "Price/Box",
          "Total Before Tax",
          "Tax",
          "Total After Tax",
          "Paid",
          "Due",
        ],
      ],
      body: rows,
      startY: 45,
    });

    doc.save(`${name}_latest_bill.pdf`);
  };

  if (!customer)
    return <p className="text-center mt-8">Loading customer details...</p>;

  const { name, bills } = customer.customer;
  const latest = customer.latestBill;
  const sortedBills = [...bills].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const totalDue = bills.reduce((sum, bill) => sum + (bill.dueAmount || 0), 0);

  return (
    <div className="p-4 max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header - Fixed */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-center">Customer: {name}</h2>
        <p className="text-center text-gray-600">Phone: {phone}</p>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1 pr-2 space-y-6">
        {/* Latest Bill Section */}
        <div className="bg-white p-4 rounded shadow">
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
              <p>
                Total Before Tax: ₹
                {(latest.tax || 0) + (latest.totalAmount || 0)}
              </p>
              <p>Tax: ₹{latest.tax || 0}</p>
              <p>Total After Tax: ₹{latest.totalAmount}</p>
              <p>Paid: ₹{latest.paidAmount}</p>
              <p className="text-red-600">Due: ₹{latest.dueAmount}</p>
              <p className="text-sm text-gray-500">
                Date: {new Date(latest.date).toLocaleDateString()}
              </p>
            </div>
          )}
          <button
            onClick={handleDownloadPDF}
            className="mt-3 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Download PDF
          </button>
        </div>

        {/* Pay Due Section */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-lg">Pay Remaining Due</h3>
          <div className="text-lg font-semibold text-red-600 mb-4">
            Total Due: ₹{totalDue}
          </div>

          {successMsg && (
            <div className="mb-3 p-3 bg-green-100 text-green-700 rounded whitespace-pre-line">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-3 p-3 bg-red-100 text-red-700 rounded">
              {errorMsg}
            </div>
          )}

          {totalDue > 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePayDue();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to pay:
                </label>
                <input
                  type="number"
                  max={totalDue}
                  placeholder="Enter amount to pay"
                  value={paymentAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      setPaymentAmount(val);
                    }
                  }}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  paying || !paymentAmount || parseFloat(paymentAmount) <= 0
                }
              >
                {paying ? "Processing..." : "Pay Due"}
              </button>
            </form>
          ) : (
            <div className="p-3 bg-green-100 text-green-700 rounded">
              All dues have been paid! ✅
            </div>
          )}
        </div>

        {/* All Bills Section */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">All Bills (Oldest First)</h3>
          {sortedBills.map((bill, idx) => (
            <div key={idx} className="border-t py-3">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  {new Date(bill.date).toLocaleDateString()}
                </p>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    bill.dueAmount > 0
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {bill.dueAmount > 0 ? "Due" : "Paid"}
                </span>
              </div>
              <ul className="list-disc ml-5 mb-2">
                {bill.items.map((item, i) => (
                  <li key={i} className="text-sm">
                    {item.productName} - {item.quantityLabel} - {item.boxes}{" "}
                    box(es) x ₹{item.pricePerBox}
                  </li>
                ))}
              </ul>
              <div className="text-sm space-y-1">
                <p>Tax: ₹{bill.tax || 0}</p>
                <p>Total: ₹{bill.totalAmount}</p>
                <p>Paid: ₹{bill.paidAmount}</p>
                <p
                  className={`font-semibold ${
                    bill.dueAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Due: ₹{bill.dueAmount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
