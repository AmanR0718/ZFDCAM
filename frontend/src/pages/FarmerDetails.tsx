// src/pages/FarmerDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { farmerService } from "@/services/farmer.service";

// Interfaces
interface Farmer {
  farmer_id: string;
  personal_info?: {
    first_name?: string;
    last_name?: string;
    phone_primary?: string;
    email?: string;
    date_of_birth?: string;
    gender?: string;
    nrc?: string;
  };
  address?: {
    province_name?: string;
    district_name?: string;
    village?: string;
    chiefdom_name?: string;
  };
  farm_info?: any;
  photo_path?: string;
  registration_status?: string;
  identification_documents?: Array<{
    doc_type: string;
    uploaded_at: string;
    file_path: string;
  }>;
}

// Helper Component
function InfoField({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value || "N/A"}</p>
    </div>
  );
}

export default function FarmerDetails() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (farmerId) {
      loadFarmerData();
    }
  }, [farmerId]);

  const loadFarmerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await farmerService.getFarmer(farmerId!);
      setFarmer(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load farmer details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading farmer details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!farmer) return <div className="p-8 text-center">Farmer not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {farmer.personal_info?.first_name} {farmer.personal_info?.last_name}
          </h1>
          <p className="text-sm text-gray-500">ID: {farmer.farmer_id}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/farmers/edit/${farmerId}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition hover:bg-blue-700">
            <i className="fa-solid fa-pen mr-2"></i> Edit Farmer
          </button>
          <button onClick={() => farmerService.generateIDCard(farmerId!)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition hover:bg-purple-700">
            <i className="fa-solid fa-id-card mr-2"></i> Generate ID
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Farmer Photo</h3>
            <img src={farmer.photo_path || '/placeholder.jpg'} alt="Farmer" className="w-full rounded-lg aspect-square object-cover" />
          </div>
          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h3 className="font-bold text-gray-800 mb-4">Farmer QR Code</h3>
            <img src={farmerService.getQRCode(farmerId!)} alt="QR Code" className="w-40 h-40 mx-auto" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="First Name" value={farmer.personal_info?.first_name} />
              <InfoField label="Last Name" value={farmer.personal_info?.last_name} />
              <InfoField label="Primary Phone" value={farmer.personal_info?.phone_primary} />
              <InfoField label="Email" value={farmer.personal_info?.email} />
              <InfoField label="Date of Birth" value={farmer.personal_info?.date_of_birth} />
              <InfoField label="Gender" value={farmer.personal_info?.gender} />
              <InfoField label="NRC Number" value={farmer.personal_info?.nrc} />
              <InfoField label="Registration Status" value={farmer.registration_status} />
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Address Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Province" value={farmer.address?.province_name} />
              <InfoField label="District" value={farmer.address?.district_name} />
              <InfoField label="Chiefdom/Camp" value={farmer.address?.chiefdom_name} />
              <InfoField label="Village" value={farmer.address?.village} />
            </div>
          </div>
          
          {/* Farm Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Farm Information</h3>
            <div className="grid grid-cols-2 gap-4">
                <InfoField label="Farm Size (Ha)" value={farmer.farm_info?.size_hectares} />
                <InfoField label="Land Tenure" value={farmer.farm_info?.land_tenure} />
                <InfoField label="Main Crops" value={farmer.farm_info?.crops?.join(', ')} />
                <InfoField label="Household Size" value={farmer.farm_info?.household_size} />
                <InfoField label="Primary Income" value={farmer.farm_info?.primary_income} />
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Identification Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['nrc', 'land_title', 'license', 'certificate'].map(docType => {
            const doc = farmer.identification_documents?.find(d => d.doc_type === docType);
            return (
              <div key={docType} className="border rounded-lg p-4">
                <h4 className="font-semibold capitalize mb-2">{docType.replace('_', ' ')}</h4>
                {doc ? (
                  <div>
                    <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View Document</a>
                    <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not uploaded</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
