// frontend/src/pages/Dashboard.tsx (Farmer Dashboard)
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import farmerService from '@/services/farmer.service'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [farmerData, setFarmerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    loadFarmerData()
  }, [])

  useEffect(() => {
    if (farmerData?.farmer_id) {
      farmerService.getQRCode(farmerData.farmer_id).then(setQrCodeUrl)
    }
  }, [farmerData?.farmer_id])

  const loadFarmerData = async () => {
    try {
      // Get farmer_id from user object
      // Adjust this based on your user structure
      const farmerId = user?.farmer_id || user?.id || user?.email
      
      if (farmerId) {
        const data = await farmerService.getFarmer(farmerId)
        setFarmerData(data)
      }
    } catch (error) {
      console.error('Failed to load farmer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadIDCard = async () => {
    try {
      const farmerId = farmerData?.farmer_id
      if (!farmerId) {
        alert('Farmer ID not available')
        return
      }
      
      await farmerService.downloadIDCard(farmerId)
      alert('✅ ID Card downloaded!')
    } catch (error: any) {
      console.error('Download failed:', error)
      alert(error.response?.data?.detail || 'ID card not available yet. Please contact your operator.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Welcome, {farmerData?.personal_info?.first_name || 'Farmer'}! 🌾
            </h1>
            <p className="text-green-100 text-lg mt-1">
              Farmer ID: <span className="font-semibold">{farmerData?.farmer_id}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadIDCard}
              className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 shadow-lg transition font-semibold"
            >
              📄 Download ID Card
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 shadow-lg transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Photo Section */}
            <div className="text-center">
              <div className="w-56 h-56 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full overflow-hidden shadow-xl">
                {farmerData?.photo_path ? (
                  <img 
                    src={farmerData.photo_path} 
                    alt="Farmer" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    👨‍🌾
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {farmerData?.personal_info?.first_name} {farmerData?.personal_info?.last_name}
              </h2>
              <span className="inline-block mt-3 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold shadow-sm">
                {farmerData?.registration_status?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>

            {/* Personal Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-green-500 pb-2">
                📋 Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoCard icon="📞" label="Phone" value={farmerData?.personal_info?.phone_primary} />
                <InfoCard icon="📧" label="Email" value={farmerData?.personal_info?.email || 'N/A'} />
                <InfoCard icon="🎂" label="Date of Birth" value={farmerData?.personal_info?.date_of_birth || 'N/A'} />
                <InfoCard icon="⚧" label="Gender" value={farmerData?.personal_info?.gender || 'N/A'} capitalize />
                <InfoCard icon="🆔" label="NRC Number" value={farmerData?.personal_info?.nrc || farmerData?.nrc_number || 'N/A'} />
                <InfoCard 
                  icon="📅" 
                  label="Registration Date" 
                  value={farmerData?.created_at ? new Date(farmerData.created_at).toLocaleDateString() : 'N/A'} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address & Farm Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Address Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 border-b-2 border-blue-500 pb-2">
              <span>📍</span> Address Information
            </h3>
            <div className="space-y-4">
              <InfoCard icon="🏛️" label="Province" value={farmerData?.address?.province || 'N/A'} />
              <InfoCard icon="🏙️" label="District" value={farmerData?.address?.district || 'N/A'} />
              <InfoCard icon="🏘️" label="Village" value={farmerData?.address?.village || 'N/A'} />
              <InfoCard icon="👑" label="Chiefdom" value={farmerData?.address?.chiefdom || 'N/A'} />
            </div>
          </div>

          {/* Farm Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 border-b-2 border-green-500 pb-2">
              <span>🌾</span> Farm Information
            </h3>
            <div className="space-y-4">
              <InfoCard 
                icon="📏" 
                label="Farm Size" 
                value={`${farmerData?.farm_info?.farm_size_hectares || 0} hectares`} 
              />
              <InfoCard 
                icon="🌱" 
                label="Crops Grown" 
                value={farmerData?.farm_info?.crops_grown?.join(', ') || 'N/A'} 
              />
              <InfoCard 
                icon="🐄" 
                label="Livestock" 
                value={farmerData?.farm_info?.livestock?.join(', ') || 'None'} 
              />
              <InfoCard 
                icon="💧" 
                label="Irrigation" 
                value={farmerData?.farm_info?.has_irrigation ? 'Available' : 'Not Available'} 
              />
              <InfoCard 
                icon="📊" 
                label="Farming Experience" 
                value={`${farmerData?.farm_info?.farming_experience_years || 0} years`} 
              />
            </div>
          </div>
          <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl}
                alt="QR Code"
                className="w-56 h-56 mx-auto"
              />
            )}
            <p className="text-sm text-gray-600 mt-6 text-center">
              Present this QR code at agricultural offices, cooperatives, or support centers for quick identification and access to services.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-white">
          <p className="text-sm opacity-75">
            Zambian Farmer Support System • For support, contact your local agricultural officer
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 🧩 REUSABLE INFO CARD COMPONENT
// ============================================
function InfoCard({ 
  icon, 
  label, 
  value, 
  capitalize = false 
}: { 
  icon?: string
  label: string
  value?: string | number
  capitalize?: boolean 
}) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
          <p className={`text-base font-semibold text-gray-900 mt-1 ${capitalize ? 'capitalize' : ''}`}>
            {value || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}