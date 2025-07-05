import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Home from "../pages/Home";
import Bill from "../pages/Bill";
import ChangePassword from "../pages/ChangePassword";
import CustomerDetails from "../pages/CustomerDetails";
import Sidebar from "../components/Sidebar";
import CustomerList from "../pages/CustomerList";
import ManageProducts from "../pages/ManageProducts";
import UpdateStock from "../pages/UpdateStock";
import Tax from "../pages/Tax";
import CustomerTaxDetails from "../pages/CustomerTaxDetails";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Sidebar>{children}</Sidebar> : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes with flat paths */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill"
          element={
            <ProtectedRoute>
              <Bill />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-products"
          element={
            <ProtectedRoute>
              <ManageProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/:phone"
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/:phone"
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update-stock"
          element={
            <ProtectedRoute>
              <UpdateStock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tax"
          element={
            <ProtectedRoute>
              <Tax />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tax/:customerId"
          element={
            <ProtectedRoute>
              <CustomerTaxDetails />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
