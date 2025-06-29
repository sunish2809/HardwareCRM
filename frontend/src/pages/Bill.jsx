import { useEffect, useState } from "react";
import api from "../utils/api";

const Bill = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    paidAmount: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [tax, setTax] = useState();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const addItem = () =>
    setItems([
      ...items,
      { productId: "", quantityLabel: "", boxes: "", pricePerBox: "" },
    ]);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const getStock = (productId, quantityLabel) => {
    const product = products.find((p) => p._id === productId);
    return (
      product?.quantities.find((q) => q.quantityLabel === quantityLabel)
        ?.stock || 0
    );
  };

  const isOverSelling = items.some((item) => {
    const stock = getStock(item.productId, item.quantityLabel);
    return parseInt(item.boxes || 0) > stock;
  });

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.pricePerBox || 0) * parseInt(item.boxes || 0);
  }, 0);
  const total = subtotal - parseFloat(tax || 0);

  const handleSubmitBill = async () => {
    const hasStockIssue = items.some((item) => {
      const available = getStock(item.productId, item.quantityLabel);
      return parseInt(item.boxes || 0) > available;
    });

    if (hasStockIssue) {
      setErrorMsg("You are trying to sell more than available stock.");
      return;
    }

    try {
      const payload = {
        name: customer.name,
        phone: customer.phone,
        totalAmount: total,
        paidAmount: customer.paidAmount,
        items: items.map((item) => {
          const product = products.find((p) => p._id === item.productId);
          return {
            ...item,
            productName: product?.name || "",
          };
        }),
      };

      await api.post("/customers/bill", payload);

      await api.put("/products/update-stock", {
        updates: items.map((item) => ({
          productId: item.productId,
          quantityLabel: item.quantityLabel,
          boxesSold: Number(item.boxes),
        })),
      });

      setSuccessMsg("Bill created and stock updated ✅");
      setErrorMsg("");
      setCustomer({ name: "", phone: "", paidAmount: "" });
      setItems([]);
    } catch (err) {
      console.error("Failed to create bill or update stock:", err);
      setErrorMsg("Failed to create bill ❌");
      setSuccessMsg("");
    }
  };

  return (
    <div className="p-4 md:ml-64">
      <h2 className="text-xl font-bold mb-4">Create Bill</h2>
      {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}
      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}

      {items.map((item, index) => {
        const product = products.find((p) => p._id === item.productId);
        const quantities = product?.quantities || [];
        const availableStock = getStock(item.productId, item.quantityLabel);
        const selectedBoxes = parseInt(item.boxes || 0);
        const isStockExceeded = selectedBoxes > availableStock;

        return (
          <div
            key={index}
            className="bg-white p-4 rounded shadow mb-4 space-y-2"
          >
            <select
              value={item.productId}
              onChange={(e) => handleChange(index, "productId", e.target.value)}
              className="w-full border px-3 py-2"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {quantities.length > 0 && (
              <select
                value={item.quantityLabel}
                onChange={(e) =>
                  handleChange(index, "quantityLabel", e.target.value)
                }
                className="w-full border px-3 py-2"
              >
                <option value="">Select Quantity</option>
                {quantities.map((q) => (
                  <option key={q.quantityLabel} value={q.quantityLabel}>
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
            {isStockExceeded && (
              <p className="text-red-500 text-sm">
                Only {availableStock} in stock
              </p>
            )}

            <input
              type="number"
              placeholder="Price per Box"
              value={item.pricePerBox}
              className="w-full border px-3 py-2"
              onChange={(e) =>
                handleChange(index, "pricePerBox", e.target.value)
              }
            />
          </div>
        );
      })}

      <button
        onClick={addItem}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Add Product
      </button>

      {/* Customer Details */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
        <input
          type="text"
          placeholder="Name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          className="w-full border px-3 py-2 mb-2"
        />
        <input
          type="text"
          placeholder="Phone"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          className="w-full border px-3 py-2 mb-2"
        />
        <input
          type="number"
          placeholder="Tax (₹)"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          className="w-full border px-3 py-2 mb-4"
        />
        <input
          type="number"
          placeholder="Amount Paid"
          value={customer.paidAmount}
          onChange={(e) =>
            setCustomer({ ...customer, paidAmount: e.target.value })
          }
          className="w-full border px-3 py-2"
        />
        <p className="mt-4 font-semibold">Total: ₹{total}</p>
        <p>Due: ₹{total - (parseFloat(customer.paidAmount) || 0)}</p>
      </div>

      <button
        onClick={handleSubmitBill}
        disabled={
          items.length === 0 ||
          !customer.name ||
          !customer.phone ||
          isOverSelling
        }
        className="bg-green-600 text-white px-4 py-2 rounded mt-6 disabled:opacity-60"
      >
        Create Bill
      </button>
    </div>
  );
};

export default Bill;
