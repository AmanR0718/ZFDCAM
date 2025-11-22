// src/pages/OperatorDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { farmerService } from "@/services/farmer.service";

interface Farmer {
  _id: string;
  farmer_id: string;
  first_name: string;
  last_name: string;
  createdAt: string;
}

export default function OperatorDashboard() {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
      myFarmers: 0,
      pendingVerifications: 0,
      upcomingVisits: 0,
      fispApplications: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await farmerService.getFarmers({ limit: 5 });
      const farmersList = data.results || [];
      setFarmers(farmersList);
      // Placeholder stats
      setStats({
          myFarmers: farmersList.length,
          pendingVerifications: farmersList.filter(f => f.registration_status !== 'verified').length,
          upcomingVisits: 5, // placeholder
          fispApplications: 12, // placeholder
      });
    } catch (error) {
      console.error("Failed to load farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600 hover:shadow-md transition">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">My Registered Farmers</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.myFarmers}</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-green-600"><i className="fa-solid fa-users text-xl"></i></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pending Verifications</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingVerifications}</h3>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-orange-600"><i className="fa-solid fa-file-signature text-xl"></i></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 hover:shadow-md transition">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Upcoming Visits</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.upcomingVisits}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><i className="fa-solid fa-person-walking-luggage text-xl"></i></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600 hover:shadow-md transition">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">FISP Applications</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.fispApplications}</h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><i className="fa-solid fa-file-alt text-xl"></i></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center">
          My Recent Registrations
          <button onClick={() => navigate('/farmers')} className="text-xs text-blue-600 hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            farmers.map(farmer => (
              <div key={farmer._id} className="px-6 py-3 flex items-center hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/farmers/${farmer.farmer_id}`)}>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <p className="text-sm text-gray-600 flex-1">New farmer <strong>{farmer.first_name} {farmer.last_name}</strong> was registered.</p>
                <span className="text-xs text-gray-400">{new Date(farmer.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
