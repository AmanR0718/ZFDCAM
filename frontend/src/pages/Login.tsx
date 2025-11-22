// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

export default function Login() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("admin");

  const navigate = useNavigate();

  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        navigate(`/admin-dashboard`);
      } else if (user?.role === 'operator') {
        navigate(`/operator-dashboard`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div
      id="login-screen"
      className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-green-900/80 backdrop-blur-sm"></div>
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-96 fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">ZIAMIS Pro</h1>
          <p className="text-gray-500 text-sm">Ministry of Agriculture</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-role" className="text-xs font-bold text-gray-600 uppercase">
              Role Select
            </label>
            <select
              id="login-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="admin">Super Admin (Headquarters)</option>
              <option value="operator">Field Extension Officer (Camp)</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-xs font-bold text-gray-600 uppercase">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
              required
              aria-label="Email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-xs font-bold text-gray-600 uppercase">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
              required
              aria-label="Password"
            />
          </div>

          {error && (
            <div
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:bg-gray-400 flex items-center justify-center"
          >
            {isLoading ? "Logging in..." : "Secure Login"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">&copy; 2025 Govt of Zambia</p>
        </div>
      </div>
    </div>
  );
}
