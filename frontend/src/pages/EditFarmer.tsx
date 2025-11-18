// src/pages/EditFarmer.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "https://glowing-fishstick-xg76vqgjxxph67ww.app.github.dev:8000";

interface FarmerForm {
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  district: string;
}

export default function EditFarmer() {
  const navigate = useNavigate();
  const { farmerId } = useParams<{ farmerId: string }>();
  const [formData, setFormData] = useState<FarmerForm>({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    district: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (farmerId) {
      fetchFarmer();
    }
  }, [farmerId]);

  const fetchFarmer = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/farmers/${farmerId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const farmer = await response.json();
        setFormData({
          firstName: farmer.personal_info?.first_name || "",
          lastName: farmer.personal_info?.last_name || "",
          phone: farmer.personal_info?.phone_primary || "",
          province: farmer.address?.province || "",
          district: farmer.address?.district || "",
        });
      } else {
        setError("Failed to fetch farmer details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch farmer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FarmerForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/farmers/${farmerId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personal_info: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_primary: formData.phone,
          },
          address: {
            province: formData.province,
            district: formData.district,
          },
        }),
      });

      if (response.ok) {
        alert("✅ Updated!");
        navigate("/farmers");
      } else {
        setError("Failed to update farmer");
      }
    } catch (err: any) {
      setError(err.message || "Error updating farmer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "20px" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => navigate("/farmers")}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            backgroundColor: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← BACK
        </button>

        <h1>Edit Farmer</h1>
        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "6px",
            }}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: "First Name", field: "firstName" },
            { label: "Last Name", field: "lastName" },
            { label: "Phone", field: "phone" },
            { label: "Province", field: "province" },
            { label: "District", field: "district" },
          ].map(({ label, field }) => (
            <div key={field} style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }} htmlFor={field}>
                {label}
              </label>
              <input
                id={field}
                type="text"
                value={formData[field as keyof FarmerForm]}
                onChange={(e) => handleChange(field as keyof FarmerForm, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: saving ? "#9CA3AF" : "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {saving ? "⏳ Saving..." : "✅ Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/farmers")}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#6B7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
