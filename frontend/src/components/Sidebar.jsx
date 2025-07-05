import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { path: "/home", label: "Home" },
    { path: "/bill", label: "Bill" },
    { path: "/customers", label: "Customers" },
    { path: "/tax", label: "Tax" },
    { path: "/change-password", label: "Change Password" },
    { path: "/manage-products", label: "Manage Products" },
    { path: "/update-stock", label: "Update Stock" },
  ];

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <aside
        className={`bg-blue-900 text-white w-64 p-4 space-y-4 fixed top-0 left-0 h-full z-50 transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:flex md:flex-col`}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-xl font-semibold">Navigation</h2>
          <button onClick={() => setOpen(false)}>
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setOpen(false)}
            className={`block px-2 py-2 rounded hover:bg-blue-800 ${
              location.pathname === path ? "bg-blue-700 font-semibold" : ""
            }`}
          >
            {label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="mt-6 px-2 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-left"
        >
          Logout
        </button>
      </aside>

      {/* Mobile Hamburger Icon */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 left-4 z-40 text-blue-900 md:hidden"
      >
        <FiMenu size={26} />
      </button>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 overflow-y-auto w-full bg-gray-50 pt-12 md:pt-0 px-4 pb-8">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
