import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const Tax = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const perPage = 10;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers/tax");
      let filteredCustomers = res.data;

      // Client-side search
      if (search) {
        filteredCustomers = filteredCustomers.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search)
        );
      }

      // Client-side pagination
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

      setCustomers(paginatedCustomers);
      setTotalPages(Math.ceil(filteredCustomers.length / perPage));
    } catch (err) {
      console.error("Failed to fetch tax customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Customer Tax Status</h2>

      <input
        type="text"
        placeholder="Search by name or phone..."
        className="w-full border px-3 py-2 mb-4"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="bg-white rounded shadow overflow-hidden min-h-[200px]">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-center py-4">
            No customers with tax records found.
          </p>
        ) : (
          customers.map((c) => (
            <Link
              key={c._id}
              to={`/tax/${c._id}`}
              className="px-4 py-2 border-b hover:bg-gray-100 flex justify-between"
            >
              <span>{c.name}</span>
              <span
                className={
                  c.status === "Due" ? "text-red-600" : "text-green-600"
                }
              >
                {c.status}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Tax;
