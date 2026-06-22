import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Save, Loader2, Layout, FileText, Image,
  GitBranch, BarChart3, Users, CreditCard, HeartHandshake, HelpCircle,
  Upload, X, Trash2
} from "lucide-react";
import { db, storage } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

interface SectionConfig {
  visible: boolean;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  rightImage?: string;
}

interface UIConfig {
  sections: {
    hero: SectionConfig;
    statistics: SectionConfig;
    members: SectionConfig;
    howItWorks: SectionConfig;
    pricing: SectionConfig;
    successStories: SectionConfig;
    faq: SectionConfig;
  };
}

const DEFAULT_CONFIG: UIConfig = {
  sections: {
    hero: { visible: true, title: "Find Your Perfect Life Partner Within Lohar Community", subtitle: "Welcome to the exclusive and most trusted matrimonial service for Lohar community.", backgroundImage: "", rightImage: "" },
    statistics: { visible: true },
    members: { visible: true, title: "Newly Joined Members", subtitle: "Fresh Profiles" },
    howItWorks: { visible: true, title: "How Lohar Matrimony Works", subtitle: "Six simple steps to find your life partner" },
    pricing: { visible: true, title: "Select Your Subscription Plan", subtitle: "Upgrade your profile to contact matches directly" },
    successStories: { visible: true, title: "Lohar Matrimony Success Stories" },
    faq: { visible: true, title: "Have Questions? Look Here" },
  },
};

const SECTION_KEYS: { key: keyof UIConfig["sections"]; label: string; icon: React.ElementType }[] = [
  { key: "hero", label: "Hero Section", icon: Image },
  { key: "statistics", label: "Statistics Counters", icon: BarChart3 },
  { key: "members", label: "Newly Joined Members", icon: Users },
  { key: "howItWorks", label: "How It Works", icon: GitBranch },
  { key: "pricing", label: "Pricing Plans", icon: CreditCard },
  { key: "successStories", label: "Success Stories", icon: HeartHandshake },
  { key: "faq", label: "FAQ Section", icon: HelpCircle },
];

export default function ManageUISettings() {
  const [config, setConfig] = useState<UIConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "siteConfig", "landingPage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UIConfig;
          const merged: UIConfig = { sections: { ...DEFAULT_CONFIG.sections } };
          for (const key of Object.keys(DEFAULT_CONFIG.sections) as (keyof UIConfig["sections"])[]) {
            merged.sections[key] = { ...DEFAULT_CONFIG.sections[key], ...data.sections?.[key] };
          }
          setConfig(merged);
        }
      } catch (err) {
        console.error("Error fetching UI config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const updateSection = (key: keyof UIConfig["sections"], field: string, value: boolean | string) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: { ...prev.sections[key], [field]: value },
      },
    }));
  };

  const handleImageUpload = async (file: File, field: "backgroundImage" | "rightImage") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const setter = field === "backgroundImage" ? setUploadingBg : setUploadingRight;
    setter(true);
    try {
      const fileRef = ref(storage, `site/landing_${field}_${Date.now()}.jpg`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      updateSection("hero", field, url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setter(false);
    }
  };

  const handleClearImage = (field: "backgroundImage" | "rightImage") => {
    updateSection("hero", field, "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "siteConfig", "landingPage"), config);
      toast.success("Landing page UI saved successfully!");
    } catch (err) {
      console.error("Error saving UI config:", err);
      toast.error("Failed to save UI config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-maroon-700 dark:text-gold-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Manage Landing Page UI</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toggle sections, edit headers, and manage images displayed on the homepage
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-maroon-500/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECTION_KEYS.map(({ key, label, icon: Icon }) => {
          const section = config.sections[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-6 transition-all ${
                section.visible
                  ? "bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 shadow-sm"
                  : "bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-dark-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-maroon-50 dark:bg-maroon-950/20 flex items-center justify-center text-maroon-700 dark:text-gold-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{label}</h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {section.visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => updateSection(key, "visible", !section.visible)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    section.visible
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-400 dark:bg-dark-800 dark:text-slate-500"
                  }`}
                  title={section.visible ? "Hide section" : "Show section"}
                >
                  {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Hero section gets image uploads */}
              {key === "hero" && (
                <div className="space-y-4 mb-4 pb-4 border-b border-slate-100 dark:border-dark-800">
                  {/* Background image */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Background Image
                    </label>
                    {section.backgroundImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 mb-2">
                        <img
                          src={section.backgroundImage}
                          alt="Hero background"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => handleClearImage("backgroundImage")}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 dark:border-dark-700 h-32 flex items-center justify-center text-xs text-slate-400 mb-2">
                        <FileText className="h-5 w-5 mr-2" />
                        No custom image set (uses default)
                      </div>
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      {uploadingBg ? "Uploading..." : "Upload Background"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingBg}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "backgroundImage");
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Right image */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Right Frame Image (Wedding Illustration)
                    </label>
                    {section.rightImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 mb-2">
                        <img
                          src={section.rightImage}
                          alt="Hero right"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => handleClearImage("rightImage")}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 dark:border-dark-700 h-32 flex items-center justify-center text-xs text-slate-400 mb-2">
                        <Image className="h-5 w-5 mr-2" />
                        No custom image set (uses default SVG illustration)
                      </div>
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      {uploadingRight ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingRight}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "rightImage");
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {(key === "hero" || key === "members" || key === "howItWorks" || key === "pricing" || key === "successStories" || key === "faq") && (
                <div className="space-y-3">
                  {key !== "successStories" && key !== "faq" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Badge / Sub-label
                      </label>
                      <input
                        type="text"
                        value={section.subtitle || ""}
                        onChange={(e) => updateSection(key, "subtitle", e.target.value)}
                        placeholder="e.g. Fresh Profiles"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-500/30"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Heading Title
                    </label>
                    <input
                      type="text"
                      value={section.title || ""}
                      onChange={(e) => updateSection(key, "title", e.target.value)}
                      placeholder="Section heading"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-500/30"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
