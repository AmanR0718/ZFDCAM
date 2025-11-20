// src/pages/CreateOperator.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { operatorService } from "@/services/operator.service";

export default function CreateOperator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "OPERATOR",
    assigned_district: "",
    assigned_province: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        assigned_district: formData.assigned_district || undefined,
        assigned_province: formData.assigned_province || undefined,
      };

      await operatorService.create(payload);
      alert("Operator created successfully!");
      navigate("/operators/manage");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create operator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Operator</h3>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
            <input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
            <input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password *</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password *</label>
            <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
              <option value="OPERATOR">Field Operator</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Province</label>
            <input type="text" value={formData.assigned_province} onChange={(e) => setFormData({ ...formData, assigned_province: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned District</label>
            <input type="text" value={formData.assigned_district} onChange={(e) => setFormData({ ...formData, assigned_district: e.target.value })} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => navigate('/operators/manage')} className="text-gray-500 font-bold hover:text-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 disabled:bg-gray-400">
                {loading ? 'Creating...' : 'Create Operator'}
            </button>
        </div>
      </form>
    </div>
  );
}