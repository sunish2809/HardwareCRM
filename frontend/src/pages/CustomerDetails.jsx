import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const CustomerDetails = () => {
  const { phone } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/customers/${phone}`);
        setCustomer(res.data);
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };
    fetchCustomer();
  }, [phone]);

  if (!customer)
    return <p className="text-center mt-8">Loading customer details...</p>;

  const { name, bills } = customer.customer;
  const latest = customer.latestBill;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2 text-center">Customer: {name}</h2>
      <p className="text-center mb-4 text-gray-600">Phone: {phone}</p>

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
