// src/pages/FarmerRegistration/Step2Address.tsx
import { useEffect, useState } from "react";
import geoService from "@/services/geo.service";
import { WizardState } from ".";

type AddressData = WizardState["address"];

type Props = {
  data: AddressData;
  onBack: () => void;
  onNext: (values: AddressData) => void;
};

export default function Step2Address({ data, onBack, onNext }: Props) {
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [chiefdoms, setChiefdoms] = useState<{ code: string; name: string }[]>([]);

  const [provinceCode, setProvinceCode] = useState(data?.province_code || "");
  const [districtCode, setDistrictCode] = useState(data?.district_code || "");
  const [chiefdomCode, setChiefdomCode] = useState(data?.chiefdom_code || "");
  const [village, setVillage] = useState(data?.village || "");
  
  const [err, setErr] = useState("");

  useEffect(() => {
    geoService.provinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      return;
    }
    geoService.districts(provinceCode).then(d => setDistricts(d || []));
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setChiefdoms([]);
      setChiefdomCode("");
      return;
    }
    geoService.chiefdoms(districtCode).then(d => setChiefdoms(d || []));
  }, [districtCode]);

  const handleNext = () => {
    if (!provinceCode || !districtCode) {
      setErr("Province and District are required.");
      return;
    }
    const province = provinces.find((p) => p.code === provinceCode);
    const district = districts.find((d) => d.code === districtCode);
    const chiefdom = chiefdoms.find((c) => c.code === chiefdomCode);

    onNext({
      ...data,
      province_code: provinceCode,
      province_name: province?.name,
      district_code: districtCode,
      district_name: district?.name,
      chiefdom_code: chiefdomCode,
      chiefdom_name: chiefdom?.name,
      village,
    });
  };

  return (
    <div id="form-sec-2" className="form-section">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">2. Geographic Data</h3>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Province</label>
                <select value={provinceCode} onChange={e => setProvinceCode(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">District</label>
                <select value={districtCode} onChange={e => setDistrictCode(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none" disabled={!provinceCode}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agricultural Camp</label>
                <select value={chiefdomCode} onChange={e => setChiefdomCode(e.target.value)} className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none" disabled={!districtCode}>
                    <option value="">Select Camp</option>
                    {chiefdoms.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Village / Zone</label>
                <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GPS Latitude</label>
                <input type="text" className="w-full p-2 border rounded bg-gray-50" placeholder="-15.3875" readOnly />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GPS Longitude</label>
                <div className="flex gap-2">
                    <input type="text" className="w-full p-2 border rounded bg-gray-50" placeholder="28.3228" readOnly />
                    <button type="button" className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700" title="Get Location"><i className="fa-solid fa-location-crosshairs"></i></button>
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
