import { useEffect, useState } from "react";
import api from "../utils/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Available Products</h2>

      {loading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : (
        <div className="h-[500px] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 rounded-md shadow-md"
              >
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <ul className="space-y-1 text-sm">
                  {product.quantities.map((q, i) => (
                    <li key={i}>
                      {q.quantityLabel} —{" "}
                      <span className="text-green-600">{q.stock} in stock</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
