import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Home, Users, Check, MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { db, auth } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { locationData } from "../../data/locationData";

interface OnboardingProps {
  onComplete: () => void;
  myProfileId: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, myProfileId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    currentAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    rashi: "",
    nakshatra: "",
    manglik: "No",
    birthTime: "",
    birthPlace: "",
    drinkingHabits: "Not specified",
    smokingHabits: "Not specified",
    bio: "",
    partnerPreferencesBio: "",
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
  });

  const [birthLocation, setBirthLocation] = useState({
    country: "",
    state: "",
    district: "",
    city: ""
  });

  const [siblings, setSiblings] = useState([{ name: "", relation: "Brother" }]);
  const [relatives, setRelatives] = useState([{ name: "", relation: "Uncle", address: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.currentAddress.trim()) newErrors.currentAddress = "Current address is required.";
      if (!formData.permanentAddress.trim()) newErrors.permanentAddress = "Permanent address is required.";
      if (!formData.city.trim()) newErrors.city = "City is required.";
      if (!formData.state.trim()) newErrors.state = "State is required.";
    } else if (currentStep === 3) {
      siblings.forEach((sib, idx) => {
        if (!sib.name.trim()) newErrors[`siblingName_${idx}`] = "Sibling name cannot be empty.";
      });
    } else if (currentStep === 4) {
      relatives.forEach((rel, idx) => {
        if (!rel.name.trim()) newErrors[`relName_${idx}`] = "Relative name cannot be empty.";
        if (!rel.address.trim()) newErrors[`relAddress_${idx}`] = "Relative address cannot be empty.";
      });
    } else if (currentStep === 5) {
      if (!formData.bio.trim()) newErrors.bio = "Please write a short bio.";
      if (!formData.partnerPreferencesBio.trim()) newErrors.partnerPreferencesBio = "Please describe what you are looking for.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addSibling = () => setSiblings([...siblings, { name: "", relation: "Brother" }]);
  const removeSibling = (index: number) => setSiblings(siblings.filter((_, i) => i !== index));

  const addRelative = () => setRelatives([...relatives, { name: "", relation: "Uncle", address: "" }]);
  const removeRelative = (index: number) => setRelatives(relatives.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!validateStep()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "profiles", myProfileId);
      await updateDoc(docRef, {
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        city: formData.city,
        state: formData.state,
        rashi: formData.rashi,
        nakshatra: formData.nakshatra,
        manglik: formData.manglik,
        birthTime: formData.birthTime,
        birthPlace: [birthLocation.city, birthLocation.district, birthLocation.state, birthLocation.country].filter(Boolean).join(", "),
        siblingsList: siblings,
        relativesList: relatives,
        fatherName: formData.fatherName,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        motherOccupation: formData.motherOccupation,
        drinking: formData.drinkingHabits,
        smoking: formData.smokingHabits,
        bio: formData.bio,
        partnerPreferencesBio: formData.partnerPreferencesBio,
        onboardingCompleted: true,
      });
      toast.success("Profile details updated successfully!");
      onComplete();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { title: "Address Info", icon: Home },
    { title: "Horoscope", icon: Users },
    { title: "Family", icon: Users },
    { title: "Relatives", icon: Users },
    { title: "Lifestyle", icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf7f2]/90 dark:bg-dark-950/90 backdrop-blur-md overflow-hidden px-4">
      <div className="max-w-2xl w-full glass-panel border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl bg-white/95 dark:bg-dark-900/95 flex flex-col max-h-[90vh]">
        
        <div className="text-center mb-6 shrink-0">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Complete Your Profile</h2>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Please provide these mandatory details to continue.</p>
        </div>

        {/* Steps Header */}
        <div className="mb-6 shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {stepTitles.map((step, idx) => {
              const StepIcon = step.icon;
              const stepNumber = idx + 1;
              const isCompleted = currentStep > stepNumber;
              const isActive = currentStep === stepNumber;
              return (
                <div key={idx} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-1 relative">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : isActive ? "bg-maroon-700 border-maroon-700 text-white shadow-sm" : "bg-slate-100 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-slate-400"}`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-3.5 w-3.5" />}
                    </div>
                    <span className={`text-[9px] font-bold tracking-wide ${isActive ? "text-maroon-700 dark:text-gold-400" : "text-slate-400"}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < totalSteps - 1 && (
                    <div className={`h-0.5 flex-grow mx-2 ${isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-dark-800"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-grow overflow-y-auto no-scrollbar pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Current Address *</label>
                    <textarea 
                      name="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                    />
                    {errors.currentAddress && <p className="text-[9px] text-red-500 font-semibold">{errors.currentAddress}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Permanent Address *</label>
                    <textarea 
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                    />
                    {errors.permanentAddress && <p className="text-[9px] text-red-500 font-semibold">{errors.permanentAddress}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">City *</label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      />
                      {errors.city && <p className="text-[9px] text-red-500 font-semibold">{errors.city}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">State *</label>
                      <input 
                        type="text" 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      />
                      {errors.state && <p className="text-[9px] text-red-500 font-semibold">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Rashi (Zodiac)</label>
                      <input 
                        type="text" 
                        name="rashi"
                        value={formData.rashi}
                        onChange={handleInputChange}
                        placeholder="e.g. Mesh"
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Nakshatra</label>
                      <input 
                        type="text" 
                        name="nakshatra"
                        value={formData.nakshatra}
                        onChange={handleInputChange}
                        placeholder="e.g. Ashwini"
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Manglik</label>
                      <select 
                        name="manglik"
                        value={formData.manglik}
                        onChange={handleInputChange as any}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      >
                        <option>No</option>
                        <option>Yes</option>
                        <option>Don't Know</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Birth Time</label>
                      <input 
                        type="time" 
                        name="birthTime"
                        value={formData.birthTime}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Birth Place</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <select
                          value={birthLocation.country}
                          onChange={(e) => setBirthLocation({ ...birthLocation, country: e.target.value, state: '', district: '', city: '' })}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600 appearance-none cursor-pointer"
                        >
                          <option value="">Country</option>
                          {Object.keys(locationData).map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={birthLocation.state}
                          onChange={(e) => setBirthLocation({ ...birthLocation, state: e.target.value, district: '', city: '' })}
                          disabled={!birthLocation.country}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600 appearance-none disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">State</option>
                          {birthLocation.country && Object.keys(locationData[birthLocation.country] || {}).map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={birthLocation.district}
                          onChange={(e) => setBirthLocation({ ...birthLocation, district: e.target.value, city: '' })}
                          disabled={!birthLocation.state}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600 appearance-none disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">District</option>
                          {birthLocation.country && birthLocation.state && Object.keys(locationData[birthLocation.country]?.[birthLocation.state] || {}).map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={birthLocation.city}
                          onChange={(e) => setBirthLocation({ ...birthLocation, city: e.target.value })}
                          disabled={!birthLocation.district}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600 appearance-none disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">Taluka</option>
                          {birthLocation.country && birthLocation.state && birthLocation.district && (locationData[birthLocation.country]?.[birthLocation.state]?.[birthLocation.district] || []).map(taluka => (
                            <option key={taluka} value={taluka}>{taluka}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b border-slate-100 dark:border-dark-800">Parents Details</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Father's Name</label>
                        <input 
                          type="text" 
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Father's Occupation</label>
                        <input 
                          type="text" 
                          name="fatherOccupation"
                          value={formData.fatherOccupation}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Mother's Name</label>
                        <input 
                          type="text" 
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Mother's Occupation</label>
                        <input 
                          type="text" 
                          name="motherOccupation"
                          value={formData.motherOccupation}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-dark-800 pt-4">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">Siblings Details</label>
                    <button 
                      type="button" 
                      onClick={addSibling}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Sibling
                    </button>
                  </div>
                  {siblings.length === 0 && <p className="text-[10px] text-slate-500 text-center py-4">No siblings added.</p>}
                  {siblings.map((sib, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl relative">
                      <button 
                        type="button" 
                        onClick={() => removeSibling(index)}
                        className="absolute top-2 right-2 p-1.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="grid grid-cols-2 gap-3 pr-10">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Name *</label>
                          <input 
                            type="text" 
                            value={sib.name}
                            onChange={(e) => {
                              const newSib = [...siblings];
                              newSib[index].name = e.target.value;
                              setSiblings(newSib);
                            }}
                            className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                          />
                          {errors[`siblingName_${index}`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`siblingName_${index}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Relation</label>
                          <select 
                            value={sib.relation}
                            onChange={(e) => {
                              const newSib = [...siblings];
                              newSib[index].relation = e.target.value;
                              setSiblings(newSib);
                            }}
                            className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                          >
                            <option>Brother</option>
                            <option>Sister</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">Relatives Details</label>
                    <button 
                      type="button" 
                      onClick={addRelative}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Relative
                    </button>
                  </div>
                  {relatives.length === 0 && <p className="text-[10px] text-slate-500 text-center py-4">No relatives added.</p>}
                  {relatives.map((rel, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl relative">
                      <button 
                        type="button" 
                        onClick={() => removeRelative(index)}
                        className="absolute top-2 right-2 p-1.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="space-y-2 pr-10">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Name *</label>
                            <input 
                              type="text" 
                              value={rel.name}
                              onChange={(e) => {
                                const newRel = [...relatives];
                                newRel[index].name = e.target.value;
                                setRelatives(newRel);
                              }}
                              className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                            />
                            {errors[`relName_${index}`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`relName_${index}`]}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Relation</label>
                            <select 
                              value={rel.relation}
                              onChange={(e) => {
                                const newRel = [...relatives];
                                newRel[index].relation = e.target.value;
                                setRelatives(newRel);
                              }}
                              className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                            >
                              <option>Uncle</option>
                              <option>Aunt</option>
                              <option>Cousin</option>
                              <option>Grandparent</option>
                              <option>Other</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Address *</label>
                          <input 
                            type="text" 
                            value={rel.address}
                            onChange={(e) => {
                              const newRel = [...relatives];
                              newRel[index].address = e.target.value;
                              setRelatives(newRel);
                            }}
                            className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1.5 focus:outline-none"
                          />
                          {errors[`relAddress_${index}`] && <p className="text-[9px] text-red-500 mt-0.5">{errors[`relAddress_${index}`]}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">About Me (Bio) *</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Tell us a little about yourself..."
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                    />
                    {errors.bio && <p className="text-[9px] text-red-500 font-semibold">{errors.bio}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">What are you looking for? (Partner Preferences) *</label>
                    <textarea 
                      name="partnerPreferencesBio"
                      value={formData.partnerPreferencesBio}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe your ideal partner..."
                      className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                    />
                    {errors.partnerPreferencesBio && <p className="text-[9px] text-red-500 font-semibold">{errors.partnerPreferencesBio}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Drinking Habits</label>
                      <select 
                        name="drinkingHabits"
                        value={formData.drinkingHabits}
                        onChange={handleInputChange as any}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      >
                        <option>Not specified</option>
                        <option>No</option>
                        <option>Occasionally</option>
                        <option>Yes</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Smoking Habits</label>
                      <select 
                        name="smokingHabits"
                        value={formData.smokingHabits}
                        onChange={handleInputChange as any}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      >
                        <option>Not specified</option>
                        <option>No</option>
                        <option>Occasionally</option>
                        <option>Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-850 mt-4 shrink-0">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Back
          </button>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white text-[10px] font-bold shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-bold shadow-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Submit Details"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
