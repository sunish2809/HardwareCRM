
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const CustomerTaxDetails = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get(`/customers/tax/${customerId}`).then(res => {
      setCustomer(res.data.customer);
      setTaxes(res.data.taxes);
      setLoading(false);
    });
  }, [customerId]);

  const totalDue = taxes.reduce((sum, t) => sum + t.dueAmount, 0);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put(`/customers/tax/pay/${customerId}`, { amount: Number(payAmount) });
      setSuccess(res.data.message);
      const updated = await api.get(`/customers/tax/${customerId}`);
      setTaxes(updated.data.taxes);
      setPayAmount("");
    } catch (err) {
      setError(err.response?.data?.error || "Payment failed");
    }
    setPaying(false);
  };

  if (loading) return <div className="p-4 text-center py-4">Loading...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Fixed Header (does not scroll) */}
      <div className="mb-4 bg-white sticky top-0 z-10 py-2">
        <h2 className="text-2xl font-bold">Tax Details for {customer.name}</h2>
        <div className="text-gray-600">Phone: {customer.phone}</div>
      </div>

      {/* Scrollable section inside component */}
      <div className="overflow-y-auto max-h-[calc(100vh-150px)] space-y-6 pr-2">

        {/* Tax Records */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold">Tax Records</h3>
          </div>
          {taxes.length === 0 ? (
            <p className="text-center py-4">No tax records found.</p>
          ) : (
            <div className="divide-y">
              {taxes.map(t => (
                <div key={t._id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                    <div className="mb-2 sm:mb-0">
                      <div className="font-semibold">
                        {t.date ? new Date(t.date).toLocaleDateString() : "No date"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Bill Total: ₹{t.bill?.totalAmount || "N/A"}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Tax: </span>
                        <span className="font-semibold">₹{t.taxAmount}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Paid: </span>
                        <span className="font-semibold text-green-600">₹{t.paidAmount}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Due: </span>
                        <span className={`font-semibold ${t.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{t.dueAmount}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          t.status === "due" ? "bg-red-100 text-red-800" : 
                          t.status === "partial" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-green-100 text-green-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {t.bill?.items?.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-semibold mb-2">Items:</div>
                      <div className="space-y-1">
                        {t.bill.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            {item.productName} x {item.boxes} boxes
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-white p-4 rounded shadow">
          <div className="mb-4">
            <div className="text-lg font-semibold text-red-600">
              Total Tax Due: ₹{totalDue}
            </div>
          </div>

          {totalDue > 0 && (
            <form onSubmit={handlePay} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Tax Dues:
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount to pay"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={paying || !payAmount || parseFloat(payAmount) <= 0}
              >
                {paying ? "Processing..." : "Pay Tax Dues"}
              </button>
            </form>
          )}

          {totalDue === 0 && (
            <div className="p-3 bg-green-100 text-green-700 rounded">
              All tax dues have been paid! ✅
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTaxDetails;
