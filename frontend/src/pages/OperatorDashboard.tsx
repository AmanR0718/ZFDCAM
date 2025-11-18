// src/pages/OperatorDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { farmerService } from "@/services/farmer.service";

interface Farmer {
  _id: string;
  farmer_id: string;
  first_name: string;
  last_name: string;
  primary_phone?: string;
  phone?: string;
  email?: string;
}

export default function OperatorDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const data = await farmerService.getFarmers({ limit: 10 });
      setFarmers(data.results || []);
    } catch (error) {
      console.error("Failed to load farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">👨‍🌾 Operator Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email} (Operator)
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/farmers/create")}
              className="p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
              aria-label="Register New Farmer"
            >
              <div className="text-4xl mb-2">➕</div>
              <h3 className="font-bold text-lg">Register New Farmer</h3>
              <p className="text-sm text-gray-600 mt-1">
                Start 4-step registration process
              </p>
            </button>

            <button
              onClick={() => navigate("/farmers")}
              className="p-6 border-2 border-green-600 rounded-lg hover:bg-green-50 transition"
              aria-label="My Farmers"
            >
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-bold text-lg">My Farmers</h3>
              <p className="text-sm text-gray-600 mt-1">
                View and manage registered farmers
              </p>
            </button>
          </div>
        </div>

        {/* Farmers List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              My Registered Farmers ({farmers.length})
            </h2>
            <button
              onClick={loadFarmers}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Refresh Farmers List"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading farmers...</div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-lg mb-2">No farmers registered yet</p>
              <p className="text-sm mb-4">Start by registering your first farmer</p>
              <button
                onClick={() => navigate("/farmers/create")}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Register First Farmer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {farmers.map((farmer) => (
                <div
                  key={farmer._id}
                  className="border rounded p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">
                        {farmer.first_name} {farmer.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📱 {farmer.primary_phone || farmer.phone} | 🆔{" "}
                        {farmer.farmer_id}
                      </p>
                      {farmer.email && (
                        <p className="text-sm text-gray-600">📧 {farmer.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/farmers/${farmer.farmer_id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        aria-label={`View details of ${farmer.first_name}`}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/farmers/${farmer.farmer_id}/edit`)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        aria-label={`Edit ${farmer.first_name}`}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
