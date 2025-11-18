// src/pages/FarmerRegistrationWizard/Step3Farm.tsx
import React, { useState } from "react";

type FarmData = {
  size_hectares?: string;
  crops?: string;
};

type Props = {
  data: FarmData;
  onBack: () => void;
  onNext: (values: FarmData) => void;
};

export default function Step3Farm({ data, onBack, onNext }: Props) {
  const [size, setSize] = useState(data?.size_hectares || "");
  const [crops, setCrops] = useState(data?.crops || "");

  return (
    <div>
      <h3>Farm details (optional)</h3>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="farmSize" style={{ fontWeight: "bold" }}>
          Farm size (hectares)
        </label>
        <input
          id="farmSize"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="e.g. 1.5"
          type="number"
          min="0"
          step="0.01"
          aria-describedby="farmSizeDesc"
        />
        <small id="farmSizeDesc" style={{ color: "#666" }}>
          Enter farm size in hectares
        </small>
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="mainCrops" style={{ fontWeight: "bold" }}>
          Main crops (comma separated)
        </label>
        <input
          id="mainCrops"
          value={crops}
          onChange={(e) => setCrops(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="maize, groundnuts"
          aria-describedby="mainCropsDesc"
        />
        <small id="mainCropsDesc" style={{ color: "#666" }}>
          Enter main crops separated by commas
        </small>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={onBack}
          style={{
            padding: 12,
            background: "#6B7280",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
          aria-label="Go back to previous step"
        >
          ← Back
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onNext({ size_hectares: size, crops })}
          style={{
            padding: 12,
            background: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
          aria-label="Go to next step"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
