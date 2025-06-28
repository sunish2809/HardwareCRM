import { useState } from "react";
import { mockProducts } from "../mock/products";

const Bill = () => {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    paidAmount: "",
  });

  const addItem = () => {
    setItems([
      ...items,
      { productId: "", quantityLabel: "", boxes: "", pricePerBox: "" },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmitBill = async () => {
    try {
      const res = await api.post("/customers", {
        name: customerName,
        phone: customerPhone,
        items: selectedItems,
        totalAmount,
        paidAmount,
      });
      alert("Bill created successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to create bill");
    }
  };

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.pricePerBox || 0);
    const boxes = parseInt(item.boxes || 0);
    return sum + price * boxes;
  }, 0);

  return (
    <div className="p-4 md:ml-64">
      <h2 className="text-xl font-bold mb-4">Create Bill</h2>

      {items.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded shadow mb-4 space-y-2">
          <select
            className="w-full border px-3 py-2"
            value={item.productId}
            onChange={(e) => handleChange(index, "productId", e.target.value)}
          >
            <option value="">Select Product</option>
            {mockProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {item.productId && (
            <select
              className="w-full border px-3 py-2"
              value={item.quantityLabel}
              onChange={(e) =>
                handleChange(index, "quantityLabel", e.target.value)
              }
            >
              <option value="">Select Quantity</option>
              {mockProducts
                .find((p) => p.id === parseInt(item.productId))
                ?.quantities.map((q, i) => (
                  <option key={i} value={q.quantityLabel}>
                    {q.quantityLabel} ({q.stock} in stock)
                  </option>
                ))}
            </select>
          )}

          <input
            type="number"
            placeholder="Boxes"
            value={item.boxes}
            className="w-full border px-3 py-2"
            onChange={(e) => handleChange(index, "boxes", e.target.value)}
          />
          <input
            type="number"
            placeholder="Price per Box"
            value={item.pricePerBox}
            className="w-full border px-3 py-2"
            onChange={(e) => handleChange(index, "pricePerBox", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={addItem}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Add Product
      </button>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
        <input
          type="text"
          placeholder="Name"
          className="w-full border px-3 py-2 mb-2"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          className="w-full border px-3 py-2 mb-2"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount Paid"
          className="w-full border px-3 py-2"
          value={customer.paidAmount}
          onChange={(e) =>
            setCustomer({ ...customer, paidAmount: e.target.value })
          }
        />
        <p className="mt-4 font-semibold">Total: ₹{total}</p>
        <p>Due: ₹{total - parseFloat(customer.paidAmount || 0)}</p>
      </div>

      <button
        onClick={handleSubmitBill}
        className="bg-green-600 text-white px-4 py-2 rounded mt-6"
      >
        Create Bill
      </button>
    </div>
  );
};

export default Bill;
