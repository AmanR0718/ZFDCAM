// src/pages/OperatorManagement.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { operatorService } from "@/services/operator.service";

interface Operator {
  _id: string;
  operator_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  assigned_district?: string;
  assigned_province?: string;
}

export default function OperatorManagement() {
  const navigate = useNavigate();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    setLoading(true);
    try {
      const data = await operatorService.getOperators(100, 0);
      const operatorList = data.results || data.operators || data || [];
      setOperators(operatorList);
    } catch (err: any) {
      console.error("Failed to load operators:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (operatorId: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this operator?`)) {
      return;
    }

    try {
      if (currentStatus === "active") {
        await operatorService.deactivate(operatorId);
      } else {
        await operatorService.activate(operatorId);
      }
      alert(`✅ Operator ${action}d successfully`);
      loadOperators();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} operator`);
    }
  };
  
  const getStatusBadge = (status: string) => {
      switch (status.toLowerCase()) {
          case 'active':
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
          case 'inactive':
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>;
          default:
              return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
      }
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">System Users (Operators)</h3>
            <button onClick={() => navigate("/operators/create")} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"><i className="fa-solid fa-plus"></i> Add Operator</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">District/Area</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={5} className="text-center p-8">Loading...</td></tr>
                    ) : (
                        operators.map(op => (
                            <tr key={op._id}>
                                <td className="px-6 py-4 font-bold">{op.first_name} {op.last_name}</td>
                                <td className="px-6 py-4">{op.role}</td>
                                <td className="px-6 py-4">{op.assigned_district || 'N/A'}</td>
                                <td className="px-6 py-4">{getStatusBadge(op.status)}</td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                    <button onClick={() => handleToggleStatus(op.operator_id, op.status)} className="text-gray-500 hover:text-gray-700">
                                        <i className="fa-solid fa-gear cursor-pointer"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
