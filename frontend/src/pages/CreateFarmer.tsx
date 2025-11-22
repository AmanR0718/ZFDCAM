// src/pages/CreateFarmer.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { farmerService } from "@/services/farmer.service";

type Crop = {
  product: string;
  area_farmed: number;
  yield_estimate: number;
  yield_actual: number;
};

type FormData = {
  first_name: string;
  last_name: string;
  nrc_no: string;
  primary_phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: {
    chiefdom: string;
    district_name: string;
    province_name: string;
    village: string;
  },
  farm_info: {
    size_hectares: number;
    crops: Crop[];
    tenure: string;
  }
  // TODO: Add the rest of the fields
};

const PROVINCES = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western",
];

const CROPS = [
  "Maize",
  "Soya Beans",
  "Groundnuts",
  "Sunflower",
  "Cotton",
  "Wheat",
  "Rice",
  "Cassava",
  "Sweet Potato",
  "Tobacco",
];

const WizardStep = ({ step, activeStep }: { step: number, activeStep: number }) => {
    const getStepClass = () => {
        if (step < activeStep) return 'wizard-done';
        if (step === activeStep) return 'wizard-active';
        return 'wizard-pending';
    }
    const titles = ["Bio-Data", "Location", "Farm Profile", "Socio-Econ"];

    return (
        <div className="flex flex-col items-center">
            <div className={`wizard-step ${getStepClass()}`}>{step}</div>
            <span className={`text-xs mt-2 font-bold ${step === activeStep ? 'text-green-800' : 'text-gray-500'}`}>{titles[step-1]}</span>
        </div>
    )
}

export default function CreateFarmer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    nrc_no: "",
    primary_phone: "",
    email: "",
    gender: "Male",
    date_of_birth: "",
    address: {
        chiefdom: "",
        district_name: "",
        province_name: "Lusaka",
        village: "",
    },
    farm_info: {
        size_hectares: 0,
        crops: [{ product: "Maize", area_farmed: 0, yield_estimate: 0, yield_actual: 0 }],
        tenure: "Customary"
    }
  });

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const updateAddress = <K extends keyof FormData['address']>(key: K, val: FormData['address'][K]) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: val } }));
    
  const updateFarmInfo = <K extends keyof FormData['farm_info']>(key: K, val: FormData['farm_info'][K]) =>
    setForm((prev) => ({ ...prev, farm_info: { ...prev.farm_info, [key]: val } }));

  const updateCrop = (i: number, key: keyof Crop, value: any) => {
    const crops = [...form.farm_info.crops];
    crops[i] = { ...crops[i], [key]: value };
    updateFarmInfo('crops', crops);
  };

  const addCrop = () =>
    updateFarmInfo('crops', [...form.farm_info.crops, { product: "", area_farmed: 0, yield_estimate: 0, yield_actual: 0 }]);

  const rmCrop = (i: number) =>
    updateFarmInfo('crops', form.farm_info.crops.filter((_, idx) => idx !== i));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await farmerService.createFarmer(form);
      alert("✅ Farmer Added!");
      navigate("/farmers");
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
        {/* Wizard Header */}
        <div className="flex justify-between items-center mb-8 px-8">
            <WizardStep step={1} activeStep={step} />
            <div className="h-1 bg-gray-300 flex-1 mx-2 mt-[-20px]"></div>
            <WizardStep step={2} activeStep={step} />
            <div className="h-1 bg-gray-300 flex-1 mx-2 mt-[-20px]"></div>
            <WizardStep step={3} activeStep={step} />
            <div className="h-1 bg-gray-300 flex-1 mx-2 mt-[-20px]"></div>
            <WizardStep step={4} activeStep={step} />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

            {/* SECTION 1: BIO DATA */}
            <div id="form-sec-1" className={`form-section ${step === 1 ? '' : 'hidden'}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">1. Farmer Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">NRC Number *</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="000000/00/1" value={form.nrc_no} onChange={e => update('nrc_no', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.first_name} onChange={e => update('first_name', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Surname *</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.last_name} onChange={e => update('last_name', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                        <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                        <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none" value={form.gender} onChange={e => update('gender', e.target.value)}>
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Primary)</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="+260" value={form.primary_phone} onChange={e => update('primary_phone', e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button onClick={() => setStep(2)} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 flex items-center">Next Step</button>
                </div>
            </div>

            {/* SECTION 2: LOCATION */}
            <div id="form-sec-2" className={`form-section ${step === 2 ? '' : 'hidden'}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">2. Geographic Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Province</label>
                        <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none" value={form.address.province_name} onChange={e => updateAddress('province_name', e.target.value)}>
                            {PROVINCES.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">District</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.address.district_name} onChange={e => updateAddress('district_name', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chiefdom</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.address.chiefdom} onChange={e => updateAddress('chiefdom', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Village / Zone</label>
                        <input type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.address.village} onChange={e => updateAddress('village', e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-700">Back</button>
                    <button onClick={() => setStep(3)} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 flex items-center">Next Step</button>
                </div>
            </div>

            {/* SECTION 3: FARM PROFILE */}
            <div id="form-sec-3" className={`form-section ${step === 3 ? '' : 'hidden'}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">3. Farm Characteristics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Hectares</label>
                        <input type="number" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={form.farm_info.size_hectares} onChange={e => updateFarmInfo('size_hectares', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Land Tenure</label>
                        <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none" value={form.farm_info.tenure} onChange={e => updateFarmInfo('tenure', e.target.value)}>
                            <option>Customary</option>
                            <option>Title Deed</option>
                        </select>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Crops Cultivated</label>
                    {form.farm_info.crops.map((crop, i) => (
                        <div key={i} className="grid grid-cols-3 gap-4 mb-2 p-2 border rounded">
                            <select className="w-full p-2 border rounded bg-white" value={crop.product} onChange={e => updateCrop(i, 'product', e.target.value)}>
                                <option value="">Select Crop</option>
                                {CROPS.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <input type="number" placeholder="Area (Ha)" className="w-full p-2 border rounded" value={crop.area_farmed} onChange={e => updateCrop(i, 'area_farmed', parseFloat(e.target.value) || 0)} />
                            <button onClick={() => rmCrop(i)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Remove</button>
                        </div>
                    ))}
                    <button onClick={addCrop} className="text-sm text-blue-600 hover:underline mt-2">+ Add another crop</button>
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:text-gray-700">Back</button>
                    <button onClick={() => setStep(4)} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800 flex items-center">Next Step</button>
                </div>
            </div>

            {/* SECTION 4: SOCIO-ECON */}
            <div id="form-sec-4" className={`form-section ${step === 4 ? '' : 'hidden'}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">4. Socio-Economic & Financial</h3>
                <p className="text-center text-gray-500">This section is a placeholder for additional socio-economic data.</p>
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(3)} className="text-gray-500 font-bold hover:text-gray-700">Back</button>
                    <button onClick={submit} disabled={loading} className="bg-orange-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-orange-700 shadow-lg transform hover:-translate-y-1 transition disabled:opacity-50">
                        {loading ? 'Saving...' : 'Submit Registration'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
