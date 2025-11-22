// src/pages/FarmerRegistration/index.tsx
import { useState } from "react";
import Step1Personal from "./Step1Personal";
import Step2Address from "./Step2Address";
import Step3Farm from "./Step3Farm";
import Step4Preview from "./Step4Preview";
import Step5PhotoUpload from "./Step5PhotoUpload";
import Step6DocumentUpload from "./Step6DocumentUpload";
import Step7Completion from "./Step7Completion";

export type WizardState = {
  personal: {
    first_name?: string;
    last_name?: string;
    phone_primary?: string;
    phone_secondary?: string;
    email?: string;
    nrc?: string;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    education_level?: string;
    ethnic_group?: string;
  };
  address: {
    province_code?: string;
    province_name?: string;
    district_code?: string;
    district_name?: string;
    chiefdom_code?: string;
    chiefdom_name?: string;
    village?: string;
  };
  farm?: {
    size_hectares?: string;
    land_tenure?: string;
    soil_type?: string;
    crops?: string[];
    livestock?: {
        cattle: number;
        goats: number;
        pigs: number;
        poultry: number;
    };
    household_size?: string;
    primary_income?: string;
    financial_services?: string[];
    vulnerability?: string[];
  };
};

const initialState: WizardState = {
  personal: {},
  address: {},
  farm: {
    crops: [],
    livestock: { cattle: 0, goats: 0, pigs: 0, poultry: 0 },
    financial_services: [],
    vulnerability: [],
  },
};

const stepTitles = ["Bio-Data", "Location", "Farm Profile", "Socio-Econ", "Photo", "Documents", "Complete"];

export default function FarmerRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardState>(initialState);
  const [loading, setLoading] = useState(false);
  const [newFarmerId, setNewFarmerId] = useState<string | null>(null);
  const [farmerName, setFarmerName] = useState<string>("");

  const update = <K extends keyof WizardState>(
    section: K,
    values: Partial<WizardState[K]>
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...values },
    }));
  };

  const handleStep6Complete = () => {
    setCurrentStep(7);
  };

  const getWizardStepClass = (step: number) => {
    if (step < currentStep) return "wizard-done";
    if (step === currentStep) return "wizard-active";
    return "wizard-pending";
  }

  const visibleSteps = 4;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Wizard Header */}
      {currentStep <= visibleSteps && (
        <div className="flex justify-between items-center mb-8 px-8">
          {[...Array(visibleSteps)].map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`wizard-step ${getWizardStepClass(i + 1)}`}>{i + 1}</div>
                <span className={`text-xs mt-2 font-bold ${i + 1 <= currentStep ? 'text-green-800' : 'text-gray-500'}`}>{stepTitles[i]}</span>
              </div>
              {i < visibleSteps - 1 && <div className="h-1 bg-gray-300 flex-1 mx-2 mt-[-20px]"></div>}
            </React.Fragment>
          ))}
        </div>
      )}


      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Step Content */}
        {currentStep === 1 && (
          <Step1Personal
            data={form.personal}
            onNext={(vals: WizardState["personal"]) => {
              update("personal", vals);
              setCurrentStep(2);
            }}
          />
        )}
        {currentStep === 2 && (
          <Step2Address
            data={form.address}
            onBack={() => setCurrentStep(1)}
            onNext={(vals: WizardState["address"]) => {
              update("address", vals);
              setCurrentStep(3);
            }}
          />
        )}
        {currentStep === 3 && (
          <Step3Farm
            data={form.farm || {}}
            onBack={() => setCurrentStep(2)}
            onNext={(vals: WizardState["farm"]) => {
              update("farm", vals);
              setCurrentStep(4);
            }}
          />
        )}
        {currentStep === 4 && (
          <Step4Preview
            data={form}
            onBack={() => setCurrentStep(3)}
            onSubmitStart={() => setLoading(true)}
            onSubmitEnd={() => setLoading(false)}
            onSuccess={(farmerId) => {
              setNewFarmerId(farmerId);
              setFarmerName(`${form.personal.first_name} ${form.personal.last_name}`);
              setCurrentStep(5);
            }}
          />
        )}
        {currentStep === 5 && newFarmerId && (
          <Step5PhotoUpload
            farmerId={newFarmerId}
            onBack={() => setCurrentStep(4)}
            onNext={() => setCurrentStep(6)}
          />
        )}
        {currentStep === 6 && newFarmerId && (
          <Step6DocumentUpload
            farmerId={newFarmerId}
            onBack={() => setCurrentStep(5)}
            onComplete={handleStep6Complete}
          />
        )}
        {currentStep === 7 && newFarmerId && (
          <Step7Completion farmerId={newFarmerId} farmerName={farmerName} />
        )}

        {loading && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-center">
            Submitting farmer registration...
          </div>
        )}
      </div>
    </div>
  );
}
