import { useEffect, useState } from "react";
import api from "../utils/api";

const UpdateStock = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantities, setQuantities] = useState([]);
  const [newQuantityLabel, setNewQuantityLabel] = useState("");
  const [newStock, setNewStock] = useState("");

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

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    const product = products.find((p) => p._id === id);
    setQuantities(product?.quantities || []);
  };

  const handleQuantityChange = (index, field, value) => {
    const updated = [...quantities];
    updated[index][field] = value;
    setQuantities(updated);
  };

  const handleAddQuantity = () => {
    if (!newQuantityLabel.trim() || !newStock) return;
    setQuantities([
      ...quantities,
      { quantityLabel: newQuantityLabel.trim(), stock: parseInt(newStock) },
    ]);
    setNewQuantityLabel("");
    setNewStock("");
  };

  const handleUpdateStock = async () => {
    try {
      await api.put(`/products/${selectedProductId}/update-stock`, {
        quantities,
      });
      alert("Stock updated successfully!");
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock.");
    }
  };

  return (
    <div className="p-4 md:ml-64 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Update Product Stock</h2>

      <select
        value={selectedProductId}
        onChange={(e) => handleSelectProduct(e.target.value)}
        className="w-full border px-3 py-2 mb-4 rounded"
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </select>

      {quantities.map((q, index) => (
        <div
          key={index}
          className="flex gap-2 items-center mb-3 flex-wrap sm:flex-nowrap"
        >
          <input
            type="text"
            value={q.quantityLabel}
            onChange={(e) =>
              handleQuantityChange(index, "quantityLabel", e.target.value)
            }
            placeholder="Quantity Label"
            className="flex-1 border px-3 py-2 rounded"
          />
          <input
            type="number"
            value={q.stock}
            onChange={(e) =>
              handleQuantityChange(index, "stock", e.target.value)
            }
            placeholder="Stock"
            className="w-32 border px-3 py-2 rounded"
          />
        </div>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          value={newQuantityLabel}
          onChange={(e) => setNewQuantityLabel(e.target.value)}
          placeholder="New Quantity Label"
          className="border px-3 py-2 rounded w-full"
        />
        <input
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Stock"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleAddQuantity}
          className="bg-green-600 text-white px-3 py-2 rounded w-full sm:w-auto"
        >
          Add
        </button>
      </div>

      <button
        onClick={handleUpdateStock}
        disabled={!selectedProductId}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        Update Stock
      </button>
    </div>
  );
};

export default UpdateStock;
