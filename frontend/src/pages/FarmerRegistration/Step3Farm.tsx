// src/pages/FarmerRegistration/Step3Farm.tsx
import { useState } from "react";
import { WizardState } from ".";

type FarmData = WizardState["farm"];

type Props = {
  data: FarmData;
  onBack: () => void;
  onNext: (values: FarmData) => void;
};

const cropOptions = ["Maize", "Soya Beans", "Groundnuts", "Sunflower", "Cotton", "Tobacco", "Vegetables", "Fruits"];

export default function Step3Farm({ data, onBack, onNext }: Props) {
  const [sizeHectares, setSizeHectares] = useState(data?.size_hectares || "");
  const [landTenure, setLandTenure] = useState(data?.land_tenure || "");
  const [soilType, setSoilType] = useState(data?.soil_type || "");
  const [crops, setCrops] = useState<string[]>(data?.crops || []);
  const [livestock, setLivestock] = useState(data?.livestock || { cattle: 0, goats: 0, pigs: 0, poultry: 0 });
  const [householdSize, setHouseholdSize] = useState(data?.household_size || "");
  const [primaryIncome, setPrimaryIncome] = useState(data?.primary_income || "Farming Only");
  const [financialServices, setFinancialServices] = useState(data?.financial_services || []);
  const [vulnerability, setVulnerability] = useState(data?.vulnerability || []);

  const handleCropChange = (crop: string) => {
    setCrops(prev => prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]);
  };

  const handleLivestockChange = (animal: string, value: string) => {
    setLivestock(prev => ({ ...prev, [animal]: parseInt(value) || 0 }));
  };

  const handleNext = () => {
    onNext({
      ...data,
      size_hectares: sizeHectares,
      land_tenure: landTenure,
      soil_type: soilType,
      crops,
      livestock,
      household_size: householdSize,
      primary_income: primaryIncome,
      financial_services: financialServices,
      vulnerability,
    });
  };

  return (
    <div>
      {/* Farm Characteristics */}
      <div id="form-sec-3" className="form-section">
          <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">3. Farm Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Hectares</label>
                  <input type="number" value={sizeHectares} onChange={e => setSizeHectares(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Land Tenure</label>
                  <select value={landTenure} onChange={e => setLandTenure(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">Select...</option>
                      <option>Customary</option><option>Title Deed</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Soil Type</label>
                  <select value={soilType} onChange={e => setSoilType(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">Select...</option>
                      <option>Sandy Loam</option><option>Clay</option>
                  </select>
              </div>
          </div>
          <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Crops Cultivated</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {cropOptions.map(crop => (
                      <label key={crop} className="flex items-center p-2 border rounded hover:bg-gray-50">
                          <input type="checkbox" checked={crops.includes(crop)} onChange={() => handleCropChange(crop)} className="mr-2 text-green-600" /> {crop}
                      </label>
                  ))}
              </div>
          </div>
          <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Livestock Inventory</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div><label className="text-xs">Cattle</label><input type="number" value={livestock.cattle} onChange={e => handleLivestockChange('cattle', e.target.value)} className="w-full p-1 border rounded" /></div>
                  <div><label className="text-xs">Goats</label><input type="number" value={livestock.goats} onChange={e => handleLivestockChange('goats', e.target.value)} className="w-full p-1 border rounded" /></div>
                  <div><label className="text-xs">Pigs</label><input type="number" value={livestock.pigs} onChange={e => handleLivestockChange('pigs', e.target.value)} className="w-full p-1 border rounded" /></div>
                  <div><label className="text-xs">Poultry</label><input type="number" value={livestock.poultry} onChange={e => handleLivestockChange('poultry', e.target.value)} className="w-full p-1 border rounded" /></div>
              </div>
          </div>
      </div>

      {/* Socio-Economic */}
      <div id="form-sec-4" className="form-section mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">4. Socio-Economic & Financial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Household Size</label>
                  <input type="number" value={householdSize} onChange={e => setHouseholdSize(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Income Source</label>
                  <select value={primaryIncome} onChange={e => setPrimaryIncome(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                      <option>Farming Only</option><option>Farming + Business</option>
                  </select>
              </div>
          </div>
          <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Financial Services</label>
              <div className="space-y-2">
                  <label className="flex items-center"><input type="checkbox" className="mr-2" /> Has Bank Account</label>
                  <div className="flex items-center gap-2">
                      <label className="flex items-center"><input type="checkbox" className="mr-2" /> Has Mobile Money</label>
                      <select className="p-1 border rounded text-xs"><option>Airtel</option><option>MTN</option><option>Zamtel</option></select>
                  </div>
              </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-100 rounded mb-4">
              <h4 className="font-bold text-orange-800 text-sm mb-2">Vulnerability (FISP Eligibility)</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                  <label className="flex items-center"><input type="checkbox" className="mr-2" /> Female Headed Household</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" /> Youth Farmer (&lt; 35)</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" /> Living with Disability</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" /> Elderly (&gt; 60)</label>
              </div>
          </div>
      </div>

      <div className="flex justify-between mt-8">
          <button onClick={onBack} className="text-gray-500 font-bold hover:text-gray-700">Back</button>
          <button onClick={handleNext} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-800">Next Step <i className="fa-solid fa-arrow-right ml-2"></i></button>
      </div>
    </div>
  );
}
