import { useState } from "react";
import { Link } from "react-router-dom";

// Mock customer data
const mockCustomers = Array.from({ length: 27 }).map((_, i) => ({
  name: `Customer ${i + 1}`,
  phone: `99900000${i}`,
  status: i % 3 === 0 ? "Due" : "Paid",
}));

const CustomerList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentCustomers = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Customer List</h2>

      <input
        type="text"
        placeholder="Search by name..."
        className="w-full border px-3 py-2 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded shadow overflow-hidden">
        {currentCustomers.map((cust) => (
          <Link
            key={cust.phone}
            to={`/customer/${cust.phone}`}
            className="px-4 py-2 border-b hover:bg-gray-100 flex justify-between"
          >
            <span>{cust.name}</span>
            <span
              className={
                cust.status === "Due" ? "text-red-600" : "text-green-600"
              }
            >
              {cust.status}
            </span>
          </Link>
        ))}
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

export default CustomerList;
