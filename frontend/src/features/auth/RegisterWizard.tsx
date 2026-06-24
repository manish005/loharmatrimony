import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Smile, 
  ShieldCheck, 
  Check, 
  Users, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  X,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { database, storage, auth } from "../../config/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref as dbRef, set as dbSet, push } from "firebase/database";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage, type CompressionResult } from "../../utils/imageCompressor";
import toast from "react-hot-toast";

export const RegisterWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadFiles, setUploadFiles] = useState<{
    file: File;
    compressedBlob: Blob;
    result: CompressionResult;
  }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    // Basic Details (Step 1)
    firstName: "",
    middleName: "",
    lastName: "",
    name: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    
    // Community Details (Step 2)
    religion: "Hinduism",
    caste: "Lohar",
    subCaste: "",
    motherTongue: "Marathi",
    
    // Security & Verification (Step 3)
    aadhaarNumber: "",
    termsAccepted: false,

    // Placeholders for secondary details (completed in dashboard)
    height: "",
    weight: "",
    maritalStatus: "",
    education: "",
    occupation: "",
    income: "",
    address: "",
    state: "",
    district: "",
    city: "",
    familyDetails: "",
    fatherOccupation: "",
    motherOccupation: "",
    siblings: "",
    lifestyle: "",
    foodPreference: "",
    smoking: "",
    drinking: "",
    hobbies: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validatePassword = (pw: string) => {
    if (pw.length < 6) return "Password must be at least 6 characters long.";
    if (!/\d/.test(pw)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return "Password must contain at least one special character.";
    return "";
  };

  const getFullName = () =>
    [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean).join(" ").trim() || formData.name;

  const validateStep = () => {
    const stepErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.firstName || formData.firstName.length <= 2) stepErrors.firstName = "First name must be more than 2 characters.";
      if (!formData.lastName || formData.lastName.length <= 2) stepErrors.lastName = "Last name must be more than 2 characters.";
      if (!formData.gender) stepErrors.gender = "Gender is required.";
      if (!formData.dob) stepErrors.dob = "Date of birth is required.";
      if (!formData.mobile) stepErrors.mobile = "Mobile number is required.";
      if (!formData.email) stepErrors.email = "Email is required.";
      
      const pwValError = validatePassword(formData.password);
      if (pwValError) stepErrors.password = pwValError;
      if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = "Passwords do not match.";
    } else if (currentStep === 2) {
      if (!formData.subCaste) stepErrors.subCaste = "Sub-caste is required.";
      if (!formData.motherTongue) stepErrors.motherTongue = "Mother tongue is required.";
    } else if (currentStep === 3) {
      if (!formData.aadhaarNumber) {
        stepErrors.aadhaarNumber = "Aadhaar number is required.";
      } else if (formData.aadhaarNumber.length !== 12 || !/^\d+$/.test(formData.aadhaarNumber)) {
        stepErrors.aadhaarNumber = "Aadhaar must be a 12-digit number.";
      }
      if (!formData.termsAccepted) {
        stepErrors.termsAccepted = "You must accept the terms & conditions.";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploadError("");
    const selectedFiles = Array.from(e.target.files);

    if (uploadFiles.length + selectedFiles.length > 3) {
      setUploadError("You can upload a maximum of 3 photos.");
      return;
    }

    const newUploaded: typeof uploadFiles = [];
    for (const file of selectedFiles) {
      try {
        const compResult = await compressImage(file, 0.7, 1200);
        newUploaded.push({
          file,
          compressedBlob: compResult.blob,
          result: compResult
        });
      } catch (err: any) {
        console.error(err);
        setUploadError(`Failed to compress ${file.name}.`);
      }
    }
    setUploadFiles(prev => [...prev, ...newUploaded]);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsUploading(true);
    setUploadError("");
    sessionStorage.setItem("registering", "true");

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Send Email Verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      const uploadedUrls: string[] = [];

      // 2. Upload compressed files to Firebase Storage (if any photo selected)
      for (let i = 0; i < uploadFiles.length; i++) {
        const item = uploadFiles[i];
        const fileRef = ref(storage, `profiles/photo_${Date.now()}_${i}.jpg`);
        await uploadBytes(fileRef, item.compressedBlob);
        const downloadUrl = await getDownloadURL(fileRef);
        uploadedUrls.push(downloadUrl);
      }

      // 3. Submit complete profile document payload to Realtime Database profiles
      const { password, confirmPassword, ...payloadWithoutPassword } = formData;
      const profilePayload = {
        ...payloadWithoutPassword,
        uid: auth.currentUser!.uid,
        photos: uploadedUrls,
        isVerified: false,
        isPremium: false,
        isOnline: true,
        registeredAt: new Date().toISOString(),
        compatibility: Math.floor(Math.random() * 25) + 75
      };

      await dbSet(dbRef(database, "profiles/" + auth.currentUser!.uid), profilePayload);

      toast.success("Profile Registered! A verification link has been sent to your email. Please verify your email.");
      sessionStorage.removeItem("registering");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      sessionStorage.removeItem("registering");
      setUploadError(err.message || "Failed to register profile. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Step Header Details
  const stepTitles = [
    { title: "Account Info", icon: User },
    { title: "Caste Info", icon: Users },
    { title: "ID Audit", icon: ShieldCheck }
  ];

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-maroon-50/20 via-slate-50 to-gold-50/10 dark:from-dark-950 dark:via-dark-900 dark:to-maroon-950/10 relative overflow-hidden px-4">
      {/* Absolute top-left Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2.5 rounded-xl bg-white/80 dark:bg-dark-900/80 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-850 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs z-25"
      >
        <ArrowLeft className="h-4 w-4 text-maroon-700 dark:text-gold-450" /> Back to Home
      </button>

      {/* Registration Card Panel */}
      <div className="max-w-2xl w-full glass-panel border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-6 sm:p-8 shadow-xl bg-white/90 dark:bg-dark-900/90 backdrop-blur-lg max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col justify-between">
        
        {/* Step indicator header */}
        <div className="mb-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {stepTitles.map((step, idx) => {
              const StepIcon = step.icon;
              const stepNumber = idx + 1;
              const isCompleted = currentStep > stepNumber;
              const isActive = currentStep === stepNumber;

              return (
                <div key={idx} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-1 relative">
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : isActive 
                            ? "bg-maroon-700 border-maroon-700 text-white shadow-sm" 
                            : "bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-slate-400"
                      }`}
                    >
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

        {/* Form Body */}
        <div className="flex-grow">
          {uploadError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 text-xs flex gap-2 font-semibold">
              <Smile className="h-4 w-4 rotate-180" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* STEP 1: Basic credentials */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                        <input 
                          type="text" 
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const updated = { ...prev, firstName: val };
                              const parts = [updated.firstName, updated.middleName, updated.lastName].filter(Boolean);
                              return { ...updated, name: parts.join(" ").trim() };
                            });
                          }}
                          placeholder="First name"
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        />
                        {errors.firstName && <p className="text-[9px] text-red-500 font-semibold">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Middle Name</label>
                        <input 
                          type="text" 
                          name="middleName"
                          value={formData.middleName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const updated = { ...prev, middleName: val };
                              const parts = [updated.firstName, updated.middleName, updated.lastName].filter(Boolean);
                              return { ...updated, name: parts.join(" ").trim() };
                            });
                          }}
                          placeholder="Middle name"
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                        <input 
                          type="text" 
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const updated = { ...prev, lastName: val };
                              const parts = [updated.firstName, updated.middleName, updated.lastName].filter(Boolean);
                              return { ...updated, name: parts.join(" ").trim() };
                            });
                          }}
                          placeholder="Last name"
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        />
                        {errors.lastName && <p className="text-[9px] text-red-500 font-semibold">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Gender */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Gender</label>
                        <select 
                          name="gender"
                          required
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        {errors.gender && <p className="text-[9px] text-red-500 font-semibold">{errors.gender}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* DOB */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                        <input 
                          type="date" 
                          name="dob"
                          required
                          value={formData.dob}
                          min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0]}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        />
                        {errors.dob && <p className="text-[9px] text-red-500 font-semibold">{errors.dob}</p>}
                      </div>

                      {/* Mobile */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                        <input 
                          type="tel" 
                          name="mobile"
                          required
                          value={formData.mobile}
                          onChange={handleInputChange}
                          placeholder="+91 9999999999"
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        />
                        {errors.mobile && <p className="text-[9px] text-red-500 font-semibold">{errors.mobile}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@mail.com"
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        />
                        {errors.email && <p className="text-[9px] text-red-500 font-semibold">{errors.email}</p>}
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Password *</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Min 6 characters (number & special char)"
                            className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[9px] text-red-500 font-bold max-w-xs">{errors.password}</p>}
                      </div>
                      
                      {/* Confirm Password */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Re-enter password"
                            className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-[9px] text-red-500 font-bold max-w-xs">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Caste details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Religion (Fixed) */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Religion</label>
                        <input 
                          type="text" 
                          name="religion"
                          readOnly
                          value={formData.religion}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-100 dark:bg-dark-900/60 text-slate-400 focus:outline-none" 
                        />
                      </div>

                      {/* Caste (Fixed) */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Caste</label>
                        <input 
                          type="text" 
                          name="caste"
                          readOnly
                          value={formData.caste}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-100 dark:bg-dark-900/60 text-slate-400 focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Sub-Caste */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Sub Caste</label>
                        <select 
                          name="subCaste"
                          required
                          value={formData.subCaste}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600 appearance-none cursor-pointer"
                        >
                          <option value="">Select Sub Caste</option>
                          <option value="Panchal">Panchal</option>
                          <option value="Gadi Lohar">Gadi Lohar</option>
                          <option value="Sangar">Sangar</option>
                          <option value="Jhangra">Jhangra</option>
                          <option value="Dhiman">Dhiman</option>
                          <option value="Tarkhan">Tarkhan</option>
                          <option value="Vishwakarma">Vishwakarma</option>
                          <option value="Mathura Lohar">Mathura Lohar</option>
                          <option value="Rajput Lohar">Rajput Lohar</option>
                          <option value="Luhar">Luhar</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.subCaste && <p className="text-[9px] text-red-500 font-semibold">{errors.subCaste}</p>}
                      </div>

                      {/* Mother Tongue */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Mother Tongue</label>
                        <select 
                          name="motherTongue"
                          required
                          value={formData.motherTongue}
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                        >
                          <option value="Marathi">Marathi</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Gujarati">Gujarati</option>
                          <option value="Marwari">Marwari</option>
                          <option value="Punjabi">Punjabi</option>
                        </select>
                        {errors.motherTongue && <p className="text-[9px] text-red-500 font-semibold">{errors.motherTongue}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Security & verification */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    {/* Aadhaar Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number (12-Digits)</label>
                      <input 
                        type="text" 
                        name="aadhaarNumber" 
                        value={formData.aadhaarNumber} 
                        onChange={handleInputChange}
                        placeholder="Enter 12-digit Aadhaar Card Number"
                        maxLength={12}
                        className="w-full text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-maroon-600"
                      />
                      {errors.aadhaarNumber && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.aadhaarNumber}</p>}
                    </div>

                    {/* Photos upload */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Profile Photos (Max 3, Optional during registration)</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-655 dark:text-slate-350 dark:bg-dark-950 transition-colors text-[10px] font-bold cursor-pointer"
                        >
                          <Upload className="h-4 w-4" /> Choose Photos
                        </button>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                        <span className="text-[9px] text-slate-400 font-semibold">{uploadFiles.length} files selected</span>
                      </div>

                      {/* Display Selected Files previews */}
                      {uploadFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          {uploadFiles.map((item, index) => (
                            <div key={index} className="relative h-14 w-14 rounded-xl overflow-hidden border">
                              <img src={URL.createObjectURL(item.compressedBlob)} alt="" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3 pt-2">
                      <input 
                        type="checkbox" 
                        id="termsAccepted" 
                        checked={formData.termsAccepted}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
                          if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: "" }));
                        }}
                        className="mt-0.5 rounded accent-maroon-700" 
                      />
                      <label htmlFor="termsAccepted" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed cursor-pointer">
                        I hereby declare that the details provided above are true. I agree to the privacy policy and terms of service of Lohar Matrimony.
                      </label>
                    </div>
                    {errors.termsAccepted && <p className="text-[9px] text-red-500 font-semibold">{errors.termsAccepted}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-850 mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-955 transition-colors cursor-pointer ${
                  currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 dark:from-maroon-600 dark:to-maroon-700 text-white text-[10px] font-bold shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.termsAccepted || isUploading}
                  className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 dark:from-maroon-600 dark:to-maroon-700 text-white text-[10px] font-bold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {isUploading ? "Registering Profile..." : "Submit Profile"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Legal Policy Links */}
        <div className="text-center text-[10px] text-slate-450 dark:text-slate-500 font-bold pt-4 border-t border-slate-150 dark:border-dark-850 space-x-3 mt-4">
          <Link to="/privacy" className="hover:text-maroon-700 hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-maroon-700 hover:underline">Terms & Conditions</Link>
        </div>

      </div>
    </div>
  );
};
