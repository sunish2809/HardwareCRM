import { useState } from "react";
import api from "../utils/api";

const ManageProducts = () => {
  const token = localStorage.getItem("token");
  const [productName, setProductName] = useState("");
  const [quantities, setQuantities] = useState([
    { quantityLabel: "", stock: "" },
  ]);
  const [message, setMessage] = useState("");

  const handleAddQuantity = () => {
    setQuantities([...quantities, { quantityLabel: "", stock: "" }]);
  };

  const handleQuantityChange = (index, field, value) => {
    const newQuantities = [...quantities];
    newQuantities[index][field] = value;
    setQuantities(newQuantities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: productName,
      quantities: quantities.map((q) => ({
        quantityLabel: q.quantityLabel,
        stock: parseInt(q.stock),
      })),
    };

    try {
      await api.post("/products", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Product added successfully");
      setProductName("");
      setQuantities([{ quantityLabel: "", stock: "" }]);
    } catch (error) {
      console.error(error);
      setMessage("Failed to add product");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Product</h2>

      {message && (
        <div className="text-center text-sm mb-4 text-blue-600">{message}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 shadow rounded space-y-4"
      >
        <input
          type="text"
          placeholder="Product Name"
          className="w-full border px-3 py-2 rounded"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />

        <div>
          <label className="block font-medium mb-2">Quantities:</label>
          {quantities.map((q, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. 1L, 250ml"
                className="flex-1 border px-2 py-1 rounded"
                value={q.quantityLabel}
                onChange={(e) =>
                  handleQuantityChange(index, "quantityLabel", e.target.value)
                }
                required
              />
              <input
                type="number"
                placeholder="Stock"
                className="w-24 border px-2 py-1 rounded"
                value={q.stock}
                onChange={(e) =>
                  handleQuantityChange(index, "stock", e.target.value)
                }
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuantity}
            className="mt-2 text-blue-600 text-sm underline"
          >
            + Add More Quantity
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Save Product
        </button>
      </form>
    </div>
  );
};

export default ManageProducts;
