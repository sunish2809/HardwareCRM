import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = login({ username, password });
    if (isValid) {
      navigate("/home");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] sm:w-96">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
          Sadhna Sales
        </h1>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">
          Login
        </h2>
        {error && (
          <div className="text-red-500 text-sm mb-3 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
