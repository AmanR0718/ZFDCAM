// src/pages/FarmerRegistration/Step1Personal.tsx
import { useState } from "react";
import { WizardState } from ".";

type PersonalData = WizardState["personal"];

type Props = {
  data: PersonalData;
  onNext: (values: PersonalData) => void;
};

export default function Step1Personal({ data, onNext }: Props) {
  const [nrc, setNrc] = useState(data.nrc || "");
  const [firstName, setFirstName] = useState(data.first_name || "");
  const [lastName, setLastName] = useState(data.last_name || "");
  const [dob, setDob] = useState(data.date_of_birth || "");
  const [gender, setGender] = useState(data.gender || "");
  const [maritalStatus, setMaritalStatus] = useState(data.marital_status || "");
  const [phone, setPhone] = useState(data.phone_primary || "");
  const [educationLevel, setEducationLevel] = useState(data.education_level || "");
  
  const [err, setErr] = useState("");

  const handleNext = () => {
    if (!nrc.trim() || !firstName.trim() || !lastName.trim()) {
      setErr("NRC, First Name, and Surname are required.");
      return;
    }
    // Basic validation, more can be added
    onNext({
      ...data,
      nrc,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      gender,
      marital_status: maritalStatus,
      phone_primary: phone,
      education_level: educationLevel,
    });
  };

  return (
    <div id="form-sec-1" className="form-section">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">1. Farmer Identification</h3>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">NRC Number *</label>
                <input type="text" value={nrc} onChange={e => setNrc(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="000000/00/1" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Surname *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marital Status</label>
                <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Widowed">Widowed</option>
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Primary)</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="+260" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Education Level</label>
                <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                    <option value="None">None</option>
                </select>
            </div>
        </div>
        <div className="flex justify-end mt-8">
            <button onClick={handleNext} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800">Next Step <i className="fa-solid fa-arrow-right ml-2"></i></button>
        </div>
    </div>
  );
}
