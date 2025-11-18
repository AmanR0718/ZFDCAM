// src/pages/FarmerRegistrationWizard/Step1Personal.tsx
import React, { useState } from "react";

type PersonalData = {
  first_name?: string;
  last_name?: string;
  phone_primary?: string;
};

type Props = {
  data: PersonalData;
  onNext: (values: PersonalData) => void;
};

export default function Step1Personal({ data, onNext }: Props) {
  const [firstName, setFirstName] = useState(data.first_name || "");
  const [lastName, setLastName] = useState(data.last_name || "");
  const [phone, setPhone] = useState(data.phone_primary || "");
  const [err, setErr] = useState("");

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErr("First and last name are required");
      return;
    }
    setErr("");
    onNext({ first_name: firstName.trim(), last_name: lastName.trim(), phone_primary: phone.trim() });
  };

  return (
    <div>
      <h3>Personal Information</h3>
      {err && (
        <div
          role="alert"
          style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 6 }}
        >
          {err}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <label htmlFor="firstName" style={{ fontWeight: "bold" }}>
          First name *
        </label>
        <input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          aria-required="true"
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="lastName" style={{ fontWeight: "bold" }}>
          Last name *
        </label>
        <input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          aria-required="true"
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="phone" style={{ fontWeight: "bold" }}>
          Phone
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="+2607..."
          type="tel"
          aria-required="false"
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleNext}
          style={{ padding: 12, background: "#16A34A", color: "white", border: "none", borderRadius: 6 }}
          aria-label="Proceed to next step"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
