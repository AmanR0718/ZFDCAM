// src/pages/FarmersList.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { farmerService } from "@/services/farmer.service";

interface Farmer {
  _id: string;
  farmer_id: string;
  personal_info?: {
    first_name?: string;
    last_name?: string;
    phone_primary?: string;
  };
  address?: {
    village?: string;
    district_name?: string;
  };
  farm_info?: {
      size_hectares?: number;
      tenure?: string;
      crops?: string[];
  };
  registration_status?: string;
}

export default function FarmersList() {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const farmersPerPage = 10;

  const fetchFarmers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await farmerService.getFarmers(100, 0);
      
      let farmerList = [];
      if (data.results && Array.isArray(data.results)) {
        farmerList = data.results;
      } else if (data.farmers && Array.isArray(data.farmers)) {
        farmerList = data.farmers;
      } else if (Array.isArray(data)) {
        farmerList = data;
      }
      
      const mappedFarmers = farmerList.map((f: any) => ({
        _id: f._id || f.id,
        farmer_id: f.farmer_id,
        personal_info: f.personal_info || {
          first_name: f.first_name,
          last_name: f.last_name,
          phone_primary: f.phone_primary,
        },
        address: f.address || { village: 'N/A', district_name: 'N/A'},
        farm_info: f.farm_info || { size_hectares: 2.5, tenure: 'Customary', crops: ['Maize', 'Soya']},
        registration_status: f.registration_status || 'pending',
      }));
      
      setFarmers(mappedFarmers);
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error("Fetch error:", err);
      }
      setError(err.response?.data?.detail || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      const searchTermLower = searchTerm.toLowerCase();
      const fullName = `${farmer.personal_info?.first_name || ''} ${farmer.personal_info?.last_name || ''}`.toLowerCase();
      return fullName.includes(searchTermLower) || farmer.farmer_id.toLowerCase().includes(searchTermLower);
    });
  }, [farmers, searchTerm]);

  // Pagination logic
  const indexOfLastFarmer = currentPage * farmersPerPage;
  const indexOfFirstFarmer = indexOfLastFarmer - farmersPerPage;
  const currentFarmers = filteredFarmers.slice(indexOfFirstFarmer, indexOfLastFarmer);
  const totalPages = Math.ceil(filteredFarmers.length / farmersPerPage);

  const getStatusBadge = (status: string) => {
      switch (status.toLowerCase()) {
          case 'verified':
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Verified</span>;
          case 'pending':
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
          case 'rejected':
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
          default:
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
      }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center bg-gray-50">
            <div className="flex gap-2 items-center">
                <input 
                  type="text"
                  placeholder="Search by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500"
                />
                <select className="text-sm border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500"><option>All Provinces</option><option>Lusaka</option><option>Eastern</option></select>
                <select className="text-sm border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500"><option>Status: All</option><option>Verified</option><option>Pending</option></select>
            </div>
            <button onClick={() => navigate('/farmers/create')} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition flex items-center">
                + Add Farmer
            </button>
        </div>
        
        {/* Table */}
        {loading ? (
            <div className="p-8 text-center">Loading...</div>
        ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Farmer Info</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Farm Size</th>
                            <th className="px-6 py-3">Crops</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentFarmers.map((farmer) => (
                            <tr key={farmer._id} className="hover:bg-green-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                                            {farmer.personal_info?.first_name?.[0] || ''}{farmer.personal_info?.last_name?.[0] || ''}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{farmer.personal_info?.first_name} {farmer.personal_info?.last_name}</div>
                                            <div className="text-xs">ID: {farmer.farmer_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{farmer.address?.district_name}, {farmer.address?.village}</td>
                                <td className="px-6 py-4">{farmer.farm_info?.size_hectares} Ha <span className="text-xs text-gray-400 block">{farmer.farm_info?.tenure}</span></td>
                                <td className="px-6 py-4">{farmer.farm_info?.crops?.join(', ')}</td>
                                <td className="px-6 py-4">{getStatusBadge(farmer.registration_status || 'unknown')}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => navigate(`/farmers/${farmer.farmer_id}`)} className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                                    <button onClick={() => navigate(`/farmers/edit/${farmer.farmer_id}`)} className="text-gray-500 hover:text-gray-700">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <span>Showing {indexOfFirstFarmer + 1}-{Math.min(indexOfLastFarmer, filteredFarmers.length)} of {filteredFarmers.length}</span>
            <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-100 disabled:opacity-50">Prev</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-100 disabled:opacity-50">Next</button>
            </div>
        </div>
    </div>
  );
}
