// src/pages/FarmerRegistrationWizard/Step4Preview.tsx
import React, { useState } from "react";
import { farmerService } from "@/services/farmer.service";
import { WizardState } from "."; // Import type

type Props = {
  data: WizardState;
  onBack: () => void;
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
};

export default function Step4Preview({ data, onBack, onSubmitStart, onSubmitEnd }: Props) {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async () => {
    onSubmitStart();
    setError("");
    setSuccess("");
    try {
      const payload = {
        personal_info: {
          first_name: data.personal.first_name,
          last_name: data.personal.last_name,
          phone_primary: data.personal.phone_primary,
        },
        address: {
          province: data.address.province_name,
          district: data.address.district_name,
          chiefdom: data.address.chiefdom_name,
          village: data.address.village,
          province_code: data.address.province_code,
          district_code: data.address.district_code,
          chiefdom_code: data.address.chiefdom_code,
        },
        farm: data.farm,
      };

      const res = await farmerService.create(payload);
      setSuccess(`Created: ${res.farmer_id || "OK"}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to create");
    } finally {
      onSubmitEnd();
    }
  };

  return (
    <div>
      <h3>Preview</h3>
      <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 6 }}>
        <div>
          <strong>Name:</strong> {data.personal.first_name} {data.personal.last_name}
        </div>
        <div>
          <strong>Phone:</strong> {data.personal.phone_primary || "-"}
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Province:</strong> {data.address.province_name}
        </div>
        <div>
          <strong>District:</strong> {data.address.district_name}
        </div>
        <div>
          <strong>Chiefdom:</strong> {data.address.chiefdom_name || "-"}
        </div>
        <div>
          <strong>Village:</strong> {data.address.village || "-"}
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Farm size (ha):</strong> {data.farm?.size_hectares || "-"}
        </div>
        <div>
          <strong>Crops:</strong> {data.farm?.crops || "-"}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "#B91C1C" }} role="alert">
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: 12, color: "#065F46" }} role="status">
          {success}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={onBack}
          style={{ padding: 12, background: "#6B7280", color: "white", border: "none", borderRadius: 6 }}
          aria-label="Back to previous step"
        >
          ← Back
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleSubmit}
          style={{ padding: 12, background: "#16A34A", color: "white", border: "none", borderRadius: 6 }}
          aria-label="Submit registration"
        >
          Submit registration
        </button>
      </div>
    </div>
  );
}
