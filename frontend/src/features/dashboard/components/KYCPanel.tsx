import React from "react";
import { ShieldCheck, Check, Upload, AlertCircle, Trash2 } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

interface KYCDoc {
  type?: string;
  name: string;
  size: string;
  status: string;
}

interface KYCPanelProps {
  kycDocs: KYCDoc[];
  kycStatus: "not_started" | "pending" | "approved";
  kycUploading: boolean;
  onKycUpload: (type: string, file: File) => void;
  onKycDelete: (index: number) => void;
}

const KYCPanel: React.FC<KYCPanelProps> = ({ kycDocs, kycStatus, kycUploading, onKycUpload, onKycDelete }) => {
  const { t } = useLanguage();
  return (
    <div className="glass-panel border border-slate-200/40 dark:border-dark-800/40 rounded-3xl p-6 sm:p-8 bg-white/70 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-dark-850 pb-4">
        <ShieldCheck className="h-8 w-8 text-emerald-600" />
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{t("KYC Verification Portal")}</h3>
          <p className="text-[10px] text-slate-500 font-semibold">{t("Verify your identity to increase profile visibility and trust rating")}</p>
        </div>
      </div>

      {kycStatus === "approved" ? (
        <div className="p-5 border border-emerald-200 dark:border-emerald-900/30 bg-emerald-500/5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {t("Identity Verified")} <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">{t("Approved")}</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t("Your Aadhaar card was successfully audited and verified by our system.")}</p>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold font-mono">ID: SEC-895-VER</div>
        </div>
      ) : kycStatus === "pending" ? (
        <div className="p-5 border border-amber-500 dark:border-amber-700 bg-amber-500/10 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {t("Approval Pending")} <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">{t("Pending")}</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t("Your KYC document is under review by our administration team. Please wait up to 24 hours.")}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {t("Verification Pending")} <span className="text-[9px] bg-slate-500 text-white px-2 py-0.5 rounded-full font-bold">{t("Action Required")}</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t("Please upload your Aadhaar card (Front & Back) to complete your verification process.")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t("Uploaded Documents")}</h4>
        <div className="space-y-2.5">
          {kycDocs.map((doc: any, idx) => (
            <div key={idx} className="p-3 border border-slate-100 dark:border-dark-800 rounded-xl grid grid-cols-4 items-center justify-items-center gap-2 bg-white/40">
              
              {/* Column 1: Image */}
              {doc.url ? (
                 <img src={doc.url} alt={doc.name} className="h-10 w-14 object-cover rounded shadow-sm border border-slate-200" />
              ) : (
                <div className="h-10 w-14 rounded bg-slate-100 dark:bg-dark-900 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-slate-400" />
                </div>
              )}
              
              {/* Column 2: Details */}
              <div className="text-center w-full overflow-hidden">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate">{doc.name}</p>
                <span className="text-[9px] text-slate-400 font-semibold">{doc.size}</span>
              </div>
              
              {/* Column 3: Status */}
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${kycStatus === "approved" || doc.status === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {kycStatus === "approved" ? "Verified" : doc.status}
              </span>

              {/* Column 4: Delete Button */}
              <button 
                onClick={() => onKycDelete(idx)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                title={t("Delete Document")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {kycDocs.length < 2 && (
        <div className="pt-4 border-t border-slate-100 dark:border-dark-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Upload Identity Documents (Aadhaar / PAN / Driving License)</h4>
          <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
              Both Front Side and Back Side of the document are mandatory for KYC verification. Max 2 photos allowed.
            </p>
          </div>
          
          <div className="bg-white/50 dark:bg-dark-900/50 border border-slate-200 dark:border-dark-800 rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Side */}
              <div>
                <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">Front Side *</h5>
                <input 
                  type="file" 
                  id="kyc-file-front" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onKycUpload("Front", e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
                <label
                  htmlFor="kyc-file-front"
                  className={`border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-2xl p-6 text-center bg-slate-50 dark:bg-dark-950/20 hover:bg-slate-100/50 dark:hover:bg-dark-850/50 transition-colors cursor-pointer flex flex-col items-center justify-center ${kycUploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-300">
                    {kycUploading ? "Uploading..." : "Upload Front"}
                  </span>
                  <span className="text-[9px] text-slate-455 block mt-0.5">Max 5MB</span>
                </label>
              </div>

              {/* Back Side */}
              <div>
                <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">Back Side *</h5>
                <input 
                  type="file" 
                  id="kyc-file-back" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onKycUpload("Back", e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
                <label
                  htmlFor="kyc-file-back"
                  className={`border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-2xl p-6 text-center bg-slate-50 dark:bg-dark-950/20 hover:bg-slate-100/50 dark:hover:bg-dark-850/50 transition-colors cursor-pointer flex flex-col items-center justify-center ${kycUploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-300">
                    {kycUploading ? "Uploading..." : "Upload Back"}
                  </span>
                  <span className="text-[9px] text-slate-455 block mt-0.5">Max 5MB</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCPanel;
