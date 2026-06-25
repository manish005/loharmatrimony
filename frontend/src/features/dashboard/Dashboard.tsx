import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, storage, db } from "../../config/firebase";
import { doc, collection, query, where, getDocs, getDoc, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { database, realtimeHelpers } from "../../config/firebase";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import {
  Menu, Search, Filter, ShieldCheck, Mail, MapPin, Briefcase, Ruler, 
  Image as ImageIcon, Video, Home, Bell, MessageSquare, Heart, Bookmark, 
  Activity, Sparkles, BookOpen, Star, Compass, User, Award, CheckCircle, 
  Smartphone, Users, Settings, Info
} from "lucide-react";
import { calculateAge, calculateCompatibility, encodeId, decodeId } from "./dashboardHelpers";
import type { TabType } from "./dashboardHelpers";
import DashboardSidebar from "./components/DashboardSidebar";
import MobileBottomNav from "./components/MobileBottomNav";
import FilterBar from "./components/FilterBar";
import SearchFilters from "./components/SearchFilters";
import ProfileGrid from "./components/ProfileGrid";
import LockedContent from "./components/LockedContent";
import MyProfileSection from "./components/MyProfileSection";
import HoroscopePanel from "./components/HoroscopePanel";
import KYCPanel from "./components/KYCPanel";
import SuccessStories from "./components/SuccessStories";
import InterestsPanel from "./components/InterestsPanel";
import SubscriptionPlans from "./components/SubscriptionPlans";
import SettingsPanel from "./components/SettingsPanel";
import HelpSupport from "./components/HelpSupport";
import ViewProfile from "./components/ViewProfile";
import ProfileCard from "./components/ProfileCard";
import CelebrationConfetti from "./components/CelebrationConfetti";
import StoryModal from "./components/StoryModal";
import WeddingInvitationModal from "./components/WeddingInvitationModal";
import InterestsReceivedPanel from "./components/InterestsReceivedPanel";
import InterestsSentPanel from "./components/InterestsSentPanel";
import Onboarding from "../auth/Onboarding";
import { useChat } from "../chat/ChatContext";
import ChatList from "../chat/components/ChatList";
import ChatThread from "../chat/components/ChatThread";
import MarriageProposalModal from "./components/MarriageProposalModal";
import { EditMarriageModal } from "./components/EditMarriageModal";

export const Dashboard: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const [userSubscription, setUserSubscription] = useState<"free" | "silver" | "gold" | "platinum">("free");
  const [showCelebration, setShowCelebration] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = (searchParams.get("tab") as TabType) || "matches";
  const selectedProfileId = searchParams.get("id") ? decodeId(searchParams.get("id")!) : "";
  const { globalUnreadCount, activeConversationId, setActiveConversation, startConversation, startAndMessageConversation } = useChat();
  const [profiles, setProfiles] = useState<any[]>([]);
  const activeProfile = profiles.find(p => p.id === selectedProfileId);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [interestSentIds, setInterestSentIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingInterestsReceived, setPendingInterestsReceived] = useState<any[]>([]);
  const [sentInterests, setSentInterests] = useState<any[]>([]);
  const [approvedReceivedIds, setApprovedReceivedIds] = useState<string[]>([]);
  const [approvedReceivedInterests, setApprovedReceivedInterests] = useState<any[]>([]);
  const [marriageRequests, setMarriageRequests] = useState<any[]>([]);
  const [isMarriageModalOpen, setIsMarriageModalOpen] = useState(false);
  const [isEditMarriageModalOpen, setIsEditMarriageModalOpen] = useState(false);
  const [selectedMarriageProfile, setSelectedMarriageProfile] = useState<any | null>(null);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [isSubmittingMarriageUpdate, setIsSubmittingMarriageUpdate] = useState(false);
  const [deletionStage, setDeletionStage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const initialInterestLoadDone = useRef(false);

  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-dashboard-sidebar', handler);
    return () => window.removeEventListener('toggle-dashboard-sidebar', handler);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubCaste, setSearchSubCaste] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchTaluka, setSearchTaluka] = useState("");
  const [searchAgeMin, setSearchAgeMin] = useState("18");
  const [searchAgeMax, setSearchAgeMax] = useState("70");
  const [searchVerifiedOnly, setSearchVerifiedOnly] = useState(false);
  const [searchOnlineOnly, setSearchOnlineOnly] = useState(false);
  const [searchMatchingOnly, setSearchMatchingOnly] = useState(false);
  const [searchMaritalStatus, setSearchMaritalStatus] = useState("");
  const [selectedInvitationProfile, setSelectedInvitationProfile] = useState<any | null>(null);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const advFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterDropdownOpen(false);
      }
      if (advFilterRef.current && !advFilterRef.current.contains(e.target as Node)) {
        setAdvancedFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [kycStatus, setKycStatus] = useState<"not_started" | "pending" | "approved" | "rejected">("not_started");
  const [kycRejectReason, setKycRejectReason] = useState("");
  const [kycDocs, setKycDocs] = useState<{ name: string; size: string; status: string; url?: string; publicId?: string }[]>([]);
  const [kycUploading, setKycUploading] = useState(false);

  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const [privacySettings, setPrivacySettings] = useState({
    hideProfile: false,
    blurHoroscope: false,
    maskContact: true,
    emailNotifications: true
  });

  const [activeDetailPhoto, setActiveDetailPhoto] = useState(0);
  const [showContactPremium, setShowContactPremium] = useState(false);
  const [isBillingYearly, setIsBillingYearly] = useState(false);

  const [myProfile, setMyProfile] = useState<any>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormState, setProfileFormState] = useState<any>({});
  const [profileLoading, setProfileLoading] = useState(true);

  const progressPercent = (() => {
    const fields: string[] = [
      "name", "gender", "dob", "mobile", "email", "subCaste", "motherTongue",
      "height", "weight", "maritalStatus", "education", "occupation", "income",
      "address", "state", "district", "city", "familyDetails", "lifestyle", "hobbies",
      "foodPreference", "smoking", "drinking", "religion", "bio", "manglik"
    ];
    let filled = 0;
    fields.forEach(field => {
      if (myProfile[field] && String(myProfile[field]).trim() !== "") {
        filled++;
      }
    });
    if (myProfile.photos && myProfile.photos.length > 0) filled++;
    return Math.round((filled / fields.length) * 100);
  })();

  const handleStartEdit = () => {
    const nameParts = (myProfile.name || "").split(" ");
    let heightFt = myProfile.heightFt || "";
    let heightInches = myProfile.heightInches || "";

    // Parse height string if ft/inches are not explicitly set
    if (!heightFt && myProfile.height) {
      const match = myProfile.height.match(/(\d+)'\s*(\d+)?"?/);
      if (match) {
        heightFt = match[1] || "";
        heightInches = match[2] || "";
      }
    }

    setProfileFormState({
      ...myProfile,
      firstName: nameParts[0] || "",
      middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
      heightFt: heightFt || "5",
      heightInches: heightInches || "0",
      country: myProfile.country || (myProfile.state ? "India" : ""),
    });
    setIsEditingProfile(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormState((prev: any) => ({ ...prev, [name]: value }));
  };

  const mapProfile = (id: string, data: any) => ({
    id: id,
    uid: data.uid || "",
    name: data.name || "Anonymous",
    firstName: data.firstName || "",
    middleName: data.middleName || "",
    lastName: data.lastName || "",
    age: data.age ? parseInt(data.age) : null,
    dob: data.dob || "",
    mobile: data.mobile || "",
    email: data.email || "",
    height: data.height || "",
    weight: data.weight || "",
    gender: data.gender || "",
    caste: data.caste || "",
    subCaste: data.subCaste || "",
    motherTongue: data.motherTongue || "",
    maritalStatus: data.maritalStatus || "",
    education: data.education || "",
    occupation: data.occupation || "",
    income: data.income || "",
    city: data.city || "",
    state: data.state || "",
    district: data.district || "",
    address: data.address || "",
    familyDetails: data.familyDetails || "",
    fatherOccupation: data.fatherOccupation || "",
    motherOccupation: data.motherOccupation || "",
    siblings: data.siblings || "",
    lifestyle: data.lifestyle || "",
    foodPreference: data.foodPreference || "",
    smoking: data.smoking || "",
    drinking: data.drinking || "",
    hobbies: data.hobbies || "",
    photos: data.photos || [],
    photo: data.photos && data.photos.length > 0 ? data.photos[0] : "",
    compatibility: data.compatibility || null,
    isOnline: data.isOnline || false,
    lastActive: data.lastActive || null,
    isVerified: data.isVerified || false,
    isPremium: data.isPremium || false,
    subscriptionPlan: data.subscriptionPlan || "free",
    bio: data.bio || "",
    onboardingCompleted: data.onboardingCompleted || false,
    isMarried: data.isMarried || false,
    partnerId: data.partnerId || "",
    partnerName: data.partnerName || "",
    partnerPhoto: data.partnerPhoto || "",
    weddingDate: data.weddingDate || "",
    weddingTime: data.weddingTime || "",
    venue: data.venue || "",
    prefFamilyType: data.prefFamilyType || "",
    prefWorking: data.prefWorking || "",
    prefValues: data.prefValues || "",
    rashi: data.rashi || "",
    nakshatra: data.nakshatra || "",
    manglik: data.manglik || "",
    birthTime: data.birthTime || "",
    birthPlace: data.birthPlace || "",
    kycStatus: data.kycStatus || "",
    kycRejectReason: data.kycRejectReason || "",
  });

  useEffect(() => {
    const fetchProfiles = async (currentUser: any) => {
      try {
        const snapshot = await getDocs(collection(db, "profiles"));
        const dbProfiles = snapshot.docs.map(d => mapProfile(d.id, d.data()));

        setProfiles(dbProfiles);

        if (currentUser?.email) {
          const userEmail = currentUser.email.toLowerCase();
          const userProfile = dbProfiles.find(p => p.uid === currentUser.uid) || dbProfiles.find(p => p.email?.toLowerCase() === userEmail);
          if (userProfile) {
            const updatedProfiles = dbProfiles.map(p => ({
              ...p,
              compatibility: p.id === userProfile.id ? 100 : calculateCompatibility(userProfile, p)
            }));
            setProfiles(updatedProfiles);
            setMyProfile(userProfile);
            setKycStatus(userProfile.kycStatus === "rejected" ? "rejected" : userProfile.isVerified ? "approved" : userProfile.kycStatus === "pending" ? "pending" : "not_started");
            setKycRejectReason(userProfile.kycRejectReason || "");
            setUserSubscription(userProfile.subscriptionPlan || "free");
            setPhotos(userProfile.photos || []);
            if (!userProfile.uid) {
              updateDoc(doc(db, "profiles", userProfile.id), { uid: currentUser.uid }).catch(() => {});
              userProfile.uid = currentUser.uid;
            }
          } else {
            const names = userEmail.split("@")[0];
            const isFemale = names.includes("manish") || names.includes("kumar");
            const guessedName = names
              .replace(/[0-9]/g, "")
              .replace(/(^\w|\_\w)/g, (m: string) => m.toUpperCase().replace("_", " "))
              || "User";
            const guessedGender = isFemale ? "Female" : "Male";
            try {
              const docRef = doc(collection(db, "profiles"));
              const docId = docRef.id;
              await setDoc(docRef, {
                uid: currentUser.uid,
                name: guessedName,
                firstName: guessedName,
                middleName: "",
                lastName: "",
                email: userEmail,
                gender: guessedGender,
                mobile: "",
                photos: [],
                isOnline: true,
                isVerified: false,
                isPremium: false,
                subscriptionPlan: "free",
                registeredAt: new Date().toISOString(),
                onboardingCompleted: false
              });
              setMyProfile({
                id: docId,
                firstName: guessedName,
                middleName: "",
                lastName: "",
                name: guessedName,
                email: userEmail,
                gender: guessedGender,
                onboardingCompleted: false
              } as any);
              setPhotos([]);
              window.location.reload();
            } catch (err) {
              console.error("Failed to create default profile:", err);
            }
          }
        } else {
          setProfileLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      } finally {
        setProfileLoading(false);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchProfiles(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!myProfile?.id || profiles.length === 0) return;

    // Listen for interests from Firestore
    const unsubInterests = onSnapshot(collection(db, "interests"), (snapshot) => {
      const allInterests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // sent BY me
      const sentData = allInterests.filter((i: any) => i.senderId === myProfile.id);
      const sentIds = sentData.map((d: any) => d.receiverId);
      setSentInterests(sentData);
      setInterestSentIds(sentIds);

      // received BY me (pending)
      const receivedData = allInterests.filter((i: any) => i.receiverId === myProfile.id && i.status === "pending");
      if (!initialInterestLoadDone.current) {
        initialInterestLoadDone.current = true;
      }
      setPendingInterestsReceived(receivedData);
      setInterestsLoading(false);

      // approved received BY me
      const approvedData = allInterests.filter((i: any) => i.receiverId === myProfile.id && i.status === "approved");
      setApprovedReceivedInterests(approvedData);
      setApprovedReceivedIds(approvedData.map((d: any) => d.senderId));
    });

    // Listen for Marriage Requests from Firestore
    const unsubMarriageRequests = onSnapshot(collection(db, "marriageRequests"), (snapshot) => {
      const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const myRequests = requests.filter((r: any) => r.senderId === myProfile.id || r.receiverId === myProfile.id);
      setMarriageRequests(myRequests);
    });

    return () => {
      unsubInterests();
      unsubMarriageRequests();
    };
  }, [myProfile?.id, profiles]);

  // Heartbeat: keep isOnline true and update lastActive every 30s
  useEffect(() => {
    if (!myProfile?.id) return;
    const profileRef = doc(db, "profiles", myProfile.id);

    const heartbeat = async () => {
      try {
        await updateDoc(profileRef, { isOnline: true, lastActive: Date.now() });
      } catch { /* ignore */ }
    };

    heartbeat();
    const interval = setInterval(heartbeat, 30000);

    const handleBeforeUnload = () => {
      updateDoc(profileRef, { isOnline: false, lastActive: Date.now() }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateDoc(profileRef, { isOnline: false, lastActive: Date.now() }).catch(() => {});
    };
  }, [myProfile?.id]);

  const toggleShortlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShortlistedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleInterest = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (interestSentIds.includes(id)) {
        // Find and delete the sent interest from Firestore
        const q = query(collection(db, "interests"), where("senderId", "==", myProfile.id), where("receiverId", "==", id));
        const snap = await getDocs(q);
        snap.forEach(d => { deleteDoc(doc(db, "interests", d.id)); });
        showToast("Interest removed.");
      } else {
        await addDoc(collection(db, "interests"), {
          senderId: myProfile.id,
          receiverId: id,
          status: "pending",
          timestamp: Date.now()
        });

        // Add Notification to Firestore
        const senderName = myProfile.name || myProfile.firstName || "Someone";
        await addDoc(collection(db, "notifications"), {
          receiverId: id,
          senderId: myProfile.id,
          text: `${senderName} sent you an interest request.`,
          type: "interest_received",
          read: false,
          createdAt: Date.now()
        });

        showToast("Interest sent successfully! They have been notified.");
      }
    } catch (err) {
      console.error("Failed to toggle interest", err);
      showToast("Failed to send interest.", "error");
    }
  };

  const handleApproveInterest = async (senderId: string, senderName: string, senderPhoto: string) => {
    setChatLoading(true);
    try {
      const q = query(collection(db, "interests"), where("receiverId", "==", myProfile.id), where("senderId", "==", senderId), where("status", "==", "pending"));
      const snap = await getDocs(q);
      const match = snap.docs[0];
      if (match) {
        await updateDoc(doc(db, "interests", match.id), { status: "approved" });
        showToast(`You approved ${senderName}'s interest!`);

        // Add Notification to Firestore
        const myName = myProfile.name || myProfile.firstName || "Someone";
        await addDoc(collection(db, "notifications"), {
          receiverId: senderId,
          senderId: myProfile.id,
          text: `${myName} accepted your interest request!`,
          type: "interest_approved",
          read: false,
          createdAt: Date.now()
        });

        const initialMessage = `Hey ${senderName}, I loved your profile! 💫 Looking forward to getting to know you better.`;
        const convId = await startAndMessageConversation(senderId, senderName, senderPhoto, initialMessage);
        setActiveConversation(convId);
        setActiveTab("messages");
      }
    } catch (err) {
      console.error("Error approving interest:", err);
      showToast("Failed to approve interest.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleRejectInterest = async (senderId: string) => {
    try {
      // Delete all interests between them (any status)
      const [iSnap1, iSnap2, nSnap1, nSnap2] = await Promise.all([
        getDocs(query(collection(db, "interests"), where("senderId", "==", myProfile.id), where("receiverId", "==", senderId))),
        getDocs(query(collection(db, "interests"), where("senderId", "==", senderId), where("receiverId", "==", myProfile.id))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", myProfile.id), where("receiverId", "==", senderId))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", senderId), where("receiverId", "==", myProfile.id))),
      ]);

      const batch = writeBatch(db);
      iSnap1.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      iSnap2.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      nSnap1.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));
      nSnap2.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));

      const myName = myProfile.name || myProfile.firstName || "Someone";
      const notifRef = doc(collection(db, "notifications"));
      batch.set(notifRef, {
        receiverId: senderId, senderId: myProfile.id,
        text: `${myName} respectfully declined your interest.`,
        type: "interest_rejected", read: false, createdAt: Date.now()
      });

      const convId = [myProfile.id, senderId].sort().join("_");
      await Promise.all([
        batch.commit(),
        realtimeHelpers.remove(realtimeHelpers.ref(database, `messages/${convId}`)).catch(() => {}),
        realtimeHelpers.remove(realtimeHelpers.ref(database, `conversations/${convId}`)).catch(() => {}),
      ]);

      showToast("Interest declined and chat cleared.");
    } catch (err) {
      console.error("Error rejecting interest", err);
      showToast("Failed to reject interest", "error");
    }
  };

  const handleSendMarriageProposal = async (proposalData: { date: string; time: string; venue: string }) => {
    if (!selectedMarriageProfile) return;
    setIsSubmittingProposal(true);
    try {
      await addDoc(collection(db, "marriageRequests"), {
        senderId: myProfile.id,
        receiverId: selectedMarriageProfile.id,
        weddingDate: proposalData.date,
        weddingTime: proposalData.time,
        venue: proposalData.venue,
        status: "pending",
        timestamp: Date.now()
      });

      const senderName = myProfile.name || myProfile.firstName || "Someone";
      await addDoc(collection(db, "notifications"), {
        receiverId: selectedMarriageProfile.id,
        senderId: myProfile.id,
        text: `${senderName} proposed a marriage setup!`,
        type: "marriage_proposal",
        read: false,
        createdAt: Date.now()
      });

      showToast("Marriage Request sent successfully!");
      setIsMarriageModalOpen(false);
      setSelectedMarriageProfile(null);
    } catch (err) {
      console.error("Error sending marriage request", err);
      showToast("Failed to send marriage request", "error");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleAcceptMarriageRequest = async (requestId: string, senderProfile: any) => {
    try {
      const requestRef = doc(db, "marriageRequests", requestId);
      const requestSnap = await getDoc(requestRef);
      if (!requestSnap.exists()) return;

      const reqData = requestSnap.data();

      // 1. Update request status
      await updateDoc(requestRef, { status: "accepted" });

      // 2. Set both profiles to isMarried = true, maritalStatus = "Married", and save partner info
      const myProfileRef = doc(db, "profiles", myProfile.id);
      const senderProfileRef = doc(db, "profiles", senderProfile.id);
      
      const weddingDate = reqData.weddingDate || "";
      
      await updateDoc(myProfileRef, { 
        isMarried: true, 
        maritalStatus: "Getting Married",
        previousMaritalStatus: myProfile.maritalStatus || "Never Married",
        partnerId: senderProfile.id,
        partnerName: senderProfile.name,
        partnerPhoto: senderProfile.photos?.[0] || senderProfile.photo || "",
        weddingDate: weddingDate,
        weddingTime: reqData.weddingTime || "",
        venue: reqData.venue || ""
      });
      
      await updateDoc(senderProfileRef, { 
        isMarried: true, 
        maritalStatus: "Getting Married",
        previousMaritalStatus: senderProfile.maritalStatus || "Never Married",
        partnerId: myProfile.id,
        partnerName: myProfile.name,
        partnerPhoto: myProfile.photos?.[0] || myProfile.photo || "",
        weddingDate: weddingDate,
        weddingTime: reqData.weddingTime || "",
        venue: reqData.venue || ""
      });

      // Add Notification to Firestore
      const myName = myProfile.name || myProfile.firstName || "Someone";
      await addDoc(collection(db, "notifications"), {
        receiverId: senderProfile.id,
        senderId: myProfile.id,
        text: `${myName} accepted your marriage proposal! Congratulations!`,
        type: "marriage_proposal_accepted",
        read: false,
        createdAt: Date.now()
      });

      // 3. Create Success Story in Firestore
      await addDoc(collection(db, "successStories"), {
        coupleId: `${senderProfile.id}_${myProfile.id}`,
        partner1Id: senderProfile.id,
        partner2Id: myProfile.id,
        partner1Name: senderProfile.name,
        partner2Name: myProfile.name,
        weddingDate: reqData.weddingDate,
        venue: reqData.venue,
        photo: senderProfile.photos?.[0] || myProfile.photos?.[0] || "",
        timestamp: Date.now()
      });

      // Update local profiles state so profile cards and ViewProfile reflect the change immediately
      setProfiles(prev => prev.map(p => {
        if (p.id === myProfile.id) {
          return { ...p, isMarried: true, maritalStatus: "Getting Married", previousMaritalStatus: myProfile.maritalStatus || "Never Married", partnerId: senderProfile.id, partnerName: senderProfile.name, partnerPhoto: senderProfile.photos?.[0] || senderProfile.photo || "", weddingDate: reqData.weddingDate || "", weddingTime: reqData.weddingTime || "", venue: reqData.venue || "" };
        }
        if (p.id === senderProfile.id) {
          return { ...p, isMarried: true, maritalStatus: "Getting Married", previousMaritalStatus: senderProfile.maritalStatus || "Never Married", partnerId: myProfile.id, partnerName: myProfile.name, partnerPhoto: myProfile.photos?.[0] || myProfile.photo || "", weddingDate: reqData.weddingDate || "", weddingTime: reqData.weddingTime || "", venue: reqData.venue || "" };
        }
        return p;
      }));
      setMyProfile((prev: any) => ({ 
        ...prev, 
        isMarried: true, 
        maritalStatus: "Getting Married",
        previousMaritalStatus: myProfile.maritalStatus || "Never Married",
        partnerId: senderProfile.id,
        partnerName: senderProfile.name,
        partnerPhoto: senderProfile.photos?.[0] || senderProfile.photo || "",
        weddingDate: reqData.weddingDate || "",
        weddingTime: reqData.weddingTime || "",
        venue: reqData.venue || ""
      }));
      showToast(`Congratulations! You are engaged to ${senderProfile.name}!`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
      setActiveTab("stories");
    } catch (err) {
      console.error("Error accepting marriage request", err);
      showToast("Failed to accept marriage request", "error");
    }
  };

  const deleteFirestoreDocsInBatches = async (q: any) => {
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(doc(db, q.collection?.id || "", d.id)));
    await batch.commit();
  };

  const handleRejectMarriageRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, "marriageRequests", requestId);
      const reqSnap = await getDoc(requestRef);
      if (!reqSnap.exists()) return;
      const reqData = reqSnap.data();
      const otherUserId = reqData.senderId === myProfile.id ? reqData.receiverId : reqData.senderId;

      // Run all queries in parallel
      const [iSnap1, iSnap2, nSnap1, nSnap2] = await Promise.all([
        getDocs(query(collection(db, "interests"), where("senderId", "==", myProfile.id), where("receiverId", "==", otherUserId))),
        getDocs(query(collection(db, "interests"), where("senderId", "==", otherUserId), where("receiverId", "==", myProfile.id))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", myProfile.id), where("receiverId", "==", otherUserId))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", otherUserId), where("receiverId", "==", myProfile.id))),
      ]);

      // Delete all docs + send notification + delete RTDB chat in parallel
      const batch = writeBatch(db);
      batch.delete(requestRef);
      iSnap1.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      iSnap2.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      nSnap1.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));
      nSnap2.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));
      const myName = myProfile.name || myProfile.firstName || "Someone";
      const notifRef = doc(collection(db, "notifications"));
      batch.set(notifRef, {
        receiverId: otherUserId, senderId: myProfile.id,
        text: `${myName} declined your marriage proposal.`,
        type: "marriage_proposal_rejected", read: false, createdAt: Date.now()
      });

      const convId = [myProfile.id, otherUserId].sort().join("_");
      await Promise.all([
        batch.commit(),
        realtimeHelpers.remove(realtimeHelpers.ref(database, `messages/${convId}`)).catch(() => {}),
        realtimeHelpers.remove(realtimeHelpers.ref(database, `conversations/${convId}`)).catch(() => {}),
      ]);

      showToast("Marriage Request declined and connection reset.");
    } catch (err) {
      console.error("Error rejecting marriage request", err);
      showToast("Failed to decline marriage request", "error");
    }
  };

  const handleOpenEditMarriageModal = () => {
    setIsEditMarriageModalOpen(true);
  };

  const handleUpdateMarriageDetails = async (data: { date: string; time: string; venue: string }) => {
    setIsSubmittingMarriageUpdate(true);
    try {
      const partnerId = myProfile.partnerId;
      if (!myProfile.id || !partnerId) {
        throw new Error("Could not find partner details.");
      }

      // 1. Find the accepted marriage request in Firestore
      const req = marriageRequests.find(
        (r: any) =>
          (r.senderId === myProfile.id || r.receiverId === myProfile.id) &&
          (r.senderId === partnerId || r.receiverId === partnerId) &&
          r.status === "accepted"
      );

      if (req) {
        await updateDoc(doc(db, "marriageRequests", req.id), {
          weddingDate: data.date,
          weddingTime: data.time,
          venue: data.venue
        });
      }

      // 2. Update both profiles in Firestore
      await updateDoc(doc(db, "profiles", myProfile.id), { weddingDate: data.date, weddingTime: data.time, venue: data.venue });
      await updateDoc(doc(db, "profiles", partnerId), { weddingDate: data.date, weddingTime: data.time, venue: data.venue });

      // 3. Find and update the successStory in Firestore
      const q = query(collection(db, "successStories"), where("partner1Id", "==", myProfile.id), where("partner2Id", "==", partnerId));
      const ssSnap = await getDocs(q);
      ssSnap.forEach(async (d) => {
        await updateDoc(doc(db, "successStories", d.id), { weddingDate: data.date, venue: data.venue });
      });
      const q2 = query(collection(db, "successStories"), where("partner1Id", "==", partnerId), where("partner2Id", "==", myProfile.id));
      const ssSnap2 = await getDocs(q2);
      ssSnap2.forEach(async (d) => {
        await updateDoc(doc(db, "successStories", d.id), { weddingDate: data.date, venue: data.venue });
      });

      // 4. Update local states
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === myProfile.id || p.id === partnerId) {
            return { ...p, weddingDate: data.date, weddingTime: data.time, venue: data.venue };
          }
          return p;
        })
      );
      setMyProfile((prev: any) => ({ ...prev, weddingDate: data.date, weddingTime: data.time, venue: data.venue }));

      // 5. Send notification to the partner about the update
      const myName = myProfile.name || myProfile.firstName || "Someone";
      await addDoc(collection(db, "notifications"), {
        receiverId: partnerId,
        senderId: myProfile.id,
        text: `${myName} updated your wedding program details.`,
        type: "marriage_details_updated",
        read: false,
        createdAt: Date.now()
      });

      showToast("Wedding program details updated successfully!");
    } catch (err: any) {
      console.error("Error updating wedding details:", err);
      showToast("Failed to update wedding details: " + err.message, "error");
    } finally {
      setIsSubmittingMarriageUpdate(false);
    }
  };

  const handleCancelMarriage = async () => {
    setIsSubmittingMarriageUpdate(true);
    try {
      const partnerId = myProfile.partnerId;
      if (!myProfile.id || !partnerId) {
        throw new Error("Could not find partner details.");
      }
      const convId = [myProfile.id, partnerId].sort().join("_");

      setDeletionStage("Fetching records...");
      // Run all queries in parallel
      const [
        mrSnap, ssSnap1, ssSnap2, iSnap1, iSnap2,
        nSnap1, nSnap2, partnerSnap,
      ] = await Promise.all([
        getDocs(query(collection(db, "marriageRequests"), where("senderId", "in", [myProfile.id, partnerId]), where("receiverId", "in", [myProfile.id, partnerId]), where("status", "==", "accepted"))),
        getDocs(query(collection(db, "successStories"), where("partner1Id", "==", myProfile.id), where("partner2Id", "==", partnerId))),
        getDocs(query(collection(db, "successStories"), where("partner1Id", "==", partnerId), where("partner2Id", "==", myProfile.id))),
        getDocs(query(collection(db, "interests"), where("senderId", "==", myProfile.id), where("receiverId", "==", partnerId))),
        getDocs(query(collection(db, "interests"), where("senderId", "==", partnerId), where("receiverId", "==", myProfile.id))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", myProfile.id), where("receiverId", "==", partnerId))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", partnerId), where("receiverId", "==", myProfile.id))),
        getDoc(doc(db, "profiles", partnerId)),
      ]);

      const partnerPrevStatus = partnerSnap.exists()
        ? (partnerSnap.data().previousMaritalStatus || "Never Married")
        : "Never Married";
      const myPrevStatus = myProfile.previousMaritalStatus || "Never Married";

      setDeletionStage("Clearing notifications...");
      // Batch all Firestore writes + RTDB deletes run in parallel
      const batch = writeBatch(db);
      mrSnap.docs.forEach(d => batch.delete(doc(db, "marriageRequests", d.id)));
      ssSnap1.docs.forEach(d => batch.delete(doc(db, "successStories", d.id)));
      ssSnap2.docs.forEach(d => batch.delete(doc(db, "successStories", d.id)));
      iSnap1.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      iSnap2.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      nSnap1.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));
      nSnap2.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));

      setDeletionStage("Resetting profiles...");
      batch.update(doc(db, "profiles", myProfile.id), {
        isMarried: false, maritalStatus: myPrevStatus,
        previousMaritalStatus: null, partnerId: null,
        partnerName: null, partnerPhoto: null, weddingDate: null,
      });
      batch.update(doc(db, "profiles", partnerId), {
        isMarried: false, maritalStatus: partnerPrevStatus,
        previousMaritalStatus: null, partnerId: null,
        partnerName: null, partnerPhoto: null, weddingDate: null,
      });

      const myName = myProfile.name || myProfile.firstName || "Someone";
      const notifRef = doc(collection(db, "notifications"));
      batch.set(notifRef, {
        receiverId: partnerId, senderId: myProfile.id,
        text: `${myName} cancelled the marriage connection. Your profiles have been reset.`,
        type: "marriage_cancelled", read: false, createdAt: Date.now(),
      });

      setDeletionStage("Clearing chat history...");
      await Promise.all([
        batch.commit(),
        realtimeHelpers.remove(realtimeHelpers.ref(database, `messages/${convId}`)).catch(() => {}),
        realtimeHelpers.remove(realtimeHelpers.ref(database, `conversations/${convId}`)).catch(() => {}),
      ]);

      // Update local states immediately
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === myProfile.id || p.id === partnerId) {
            const isMe = p.id === myProfile.id;
            return {
              ...p,
              isMarried: false,
              maritalStatus: isMe ? myPrevStatus : partnerPrevStatus,
              previousMaritalStatus: null,
              partnerId: null, partnerName: null, partnerPhoto: null,
              weddingDate: null,
            };
          }
          return p;
        })
      );
      setMyProfile((prev: any) => ({
        ...prev,
        isMarried: false, maritalStatus: myPrevStatus,
        previousMaritalStatus: null,
        partnerId: null, partnerName: null, partnerPhoto: null,
        weddingDate: null,
      }));

      showToast("Marriage connection cancelled and marital statuses reset successfully!");
      setActiveTab("matches");
    } catch (err: any) {
      console.error("Error cancelling marriage connection:", err);
      showToast("Failed to cancel marriage connection: " + err.message, "error");
    } finally {
      setIsSubmittingMarriageUpdate(false);
    }
  };

  const startChat = async (profile: any) => {
    try {
      const convId = await startConversation(profile.id, profile.name, profile.photo);
      setActiveConversation(convId);
      setActiveTab("messages");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKycUpload = async (type: string, file: File) => {
    if (!file) return;
    setKycUploading(true);
    
    try {
      if (!myProfile?.id) {
        throw new Error("Profile not found.");
      }
      
      const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '');
      const typeLower = type.toLowerCase();
      const publicId = `aadhar_${typeLower}_image_${myProfile.id}_${dateStr}_1`;
      const folder = `loharmatrimony/assets/profilesandKyc/${myProfile.id}/KYC images`;
      
      const uploadUrl = await uploadToCloudinary(file, folder, publicId);
      
      setKycDocs(prev => [...prev, { name: file.name, size: `${(file.size / 1024).toFixed(0)} KB`, status: "Pending Audit", url: uploadUrl, publicId: `${folder}/${publicId}` }]);
      setKycStatus("pending");
      setKycRejectReason("");

      // Save to Firestore so admin can review
      const key = typeLower === "front" ? "front" : "back";
      await updateDoc(doc(db, "profiles", myProfile.id), {
        [`kycDocuments.${key}`]: uploadUrl,
        kycStatus: "pending",
        kycRejectReason: null,
      });

      showToast(`${type} Document uploaded successfully! Our administration board will review and update within 24 hours.`);
    } catch (err: any) {
      console.error("KYC upload failed:", err);
      showToast("Failed to upload KYC document: " + err.message, "error");
    } finally {
      setKycUploading(false);
    }
  };

  const handleKycDelete = async (index: number) => {
    try {
      const docToDelete = kycDocs[index];
      if (docToDelete.publicId) {
        // Attempt to delete from Cloudinary
        try {
          await deleteFromCloudinary(docToDelete.publicId);
        } catch (cloudinaryErr) {
          console.error("Cloudinary deletion failed, but continuing to remove from UI:", cloudinaryErr);
        }
      }
      
      const newDocs = kycDocs.filter((_, i) => i !== index);
      setKycDocs(newDocs);
      
      if (newDocs.length === 0) {
        setKycStatus("not_started");
      }
      showToast("Document deleted successfully");
    } catch (err: any) {
      console.error("Delete KYC document failed:", err);
      showToast("Failed to delete document", "error");
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSupportSubmitted(true);

    const formData = new FormData(e.currentTarget);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;

    try {
      await addDoc(collection(db, "supportTickets"), {
        userId: myProfile?.id || "LM-GUEST",
        name: myProfile?.name || "Guest User",
        email: myProfile?.email || "Unknown",
        category: category,
        desc: description,
        status: "Open",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        timestamp: Date.now()
      });
      showToast("Support request submitted! We will email you back shortly.", "success");
      e.currentTarget.reset();
    } catch (err) {
      console.error("Support submission failed:", err);
      showToast("Failed to submit support request.", "error");
    } finally {
      setSupportSubmitted(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingPhoto(true);
    try {
      if (!myProfile?.id) {
        showToast("Profile not found. Please save your profile first.", "error");
        setUploadingPhoto(false);
        return;
      }

      const uploadedUrls: string[] = [];
      const files = Array.from(e.target.files);
      const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '');
      const folder = `loharmatrimony/assets/profilesandKyc/${myProfile.id}`;

      for (let i = 0; i < files.length; i++) {
        const seq = photos.length + i + 1;
        if (seq > 4) break;
        
        const publicId = `image${seq}_${myProfile.id}_${dateStr}_${seq}`;
        const downloadUrl = await uploadToCloudinary(files[i], folder, publicId);
        uploadedUrls.push(downloadUrl);
      }
      const updatedPhotos = [...photos, ...uploadedUrls].slice(0, 4);
      await updateDoc(doc(db, "profiles", myProfile.id), { photos: updatedPhotos });
      setPhotos(updatedPhotos);
      setMyProfile((prev: any) => ({ ...prev, photos: updatedPhotos, photo: updatedPhotos[0] || prev.photo }));
      showToast(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      showToast("Failed to upload photos: " + err.message, "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    try {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      if (!myProfile?.id) return;

      await updateDoc(doc(db, "profiles", myProfile.id), { photos: updatedPhotos });

      setPhotos(updatedPhotos);
      setMyProfile((prev: any) => ({ ...prev, photos: updatedPhotos, photo: updatedPhotos[0] || prev.photo }));
      showToast("Photo removed successfully!");
    } catch (err: any) {
      console.error("Delete photo failed:", err);
      showToast("Failed to delete photo", "error");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedProfile = { ...myProfile, ...profileFormState };

      if (myProfile?.id) {
        const parts = [
          profileFormState.firstName || "",
          profileFormState.middleName || "",
          profileFormState.lastName || ""
        ].filter(Boolean);
        const savePayload = {
          ...profileFormState,
          name: parts.join(" ").trim() || profileFormState.name,
        };
        const { id, photo, isVerified, isPremium, isOnline, registeredAt, compatibility, onboardingCompleted, ...saveData } = savePayload;
        
        // Construct height string if heightFt is set
        if (saveData.heightFt) {
          const ft = saveData.heightFt;
          const inches = saveData.heightInches || "0";
          saveData.height = `${ft}'${inches}"`;
          updatedProfile.height = `${ft}'${inches}"`;
        }

        // Filter out undefined values to prevent Firestore from throwing "Unsupported field value: undefined"
        Object.keys(saveData).forEach(key => {
          if (saveData[key] === undefined) {
            delete saveData[key];
          }
        });

        // Marital Status & Marriage / Divorce Logic
        const newStatus = saveData.maritalStatus;
        if (newStatus === "Getting Married" || newStatus === "Married") {
          saveData.isMarried = true;
          updatedProfile.isMarried = true;
        } else if (
          newStatus === "Divorced" || 
          newStatus === "Awaiting Divorce" || 
          newStatus === "Widowed" || 
          newStatus === "Never Married" || 
          newStatus === "Awaiting Divorced"
        ) {
          saveData.isMarried = false;
          updatedProfile.isMarried = false;
          
          if (myProfile.isMarried) {
            // Find the success story where this user is a partner from Firestore
            const q1 = query(collection(db, "successStories"), where("partner1Id", "==", myProfile.id));
            const ssSnap1 = await getDocs(q1);
            const q2 = query(collection(db, "successStories"), where("partner2Id", "==", myProfile.id));
            const ssSnap2 = await getDocs(q2);
            
            let partnerId = null;
            
            ssSnap1.forEach(d => {
              const data = d.data();
              partnerId = data.partner2Id;
              deleteDoc(doc(db, "successStories", d.id));
            });
            ssSnap2.forEach(d => {
              const data = d.data();
              partnerId = data.partner1Id;
              deleteDoc(doc(db, "successStories", d.id));
            });

            // Un-marry the partner from Firestore
            if (partnerId) {
              await updateDoc(doc(db, "profiles", partnerId), { 
                isMarried: false,
                maritalStatus: "Divorced"
              });
            }
          }
        }

        await updateDoc(doc(db, "profiles", myProfile.id), saveData);
        updatedProfile.id = myProfile.id;
      }
      setMyProfile(updatedProfile);
      setProfiles(prev => prev.map(p => p.id === myProfile.id ? updatedProfile : p));
      setIsEditingProfile(false);
      showToast("Profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      showToast("Error saving profile: " + err.message, "error");
    }
  };

  const handlePlanSelect = async (planKey: string, planName: string, amount: number, billing: string) => {
    try {
      if (myProfile?.id) {
        await updateDoc(doc(db, "profiles", myProfile.id), {
          subscriptionPlan: planKey,
          isPremium: planKey !== "free"
        });
        setMyProfile((prev: any) => ({ ...prev, subscriptionPlan: planKey, isPremium: planKey !== "free" }));

        const expiryDate = new Date();
        if (billing === "Yearly") {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        await addDoc(collection(db, "subscriptions"), {
          userId: myProfile.id,
          name: myProfile.name || "Unknown",
          email: myProfile.email || "Unknown",
          plan: planName,
          amount: amount,
          billing: billing,
          expiry: expiryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          timestamp: Date.now()
        });
      }
      setUserSubscription(planKey as "silver" | "gold" | "platinum");
      setShowCelebration(true);
      showToast(`🎉 ${planName} activated successfully! Welcome to premium.`);
      setTimeout(() => setShowCelebration(false), 2500);
    } catch (err) {
      console.error("Failed to update subscription:", err);
      showToast("Failed to activate subscription.", "error");
    }
  };

  const setActiveTab = (tab: TabType, id?: string) => {
    if (tab === "messages") {
      navigate("/chat");
      return;
    }
    const params: Record<string, string> = { tab };
    if (id) {
      params.id = encodeId(id);
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayList = useMemo(() => {
    let list = profiles;

    const userGender = myProfile?.gender || "Male";
    const oppositeGender = userGender === "Male" ? "Female" : "Male";
    list = list.filter(p => p.gender === oppositeGender);

    if (activeTab === "matches" || activeTab === "search") {
      list = list.filter(p => !p.isMarried);
    }

    if (activeTab === "shortlisted") {
      list = list.filter(p => shortlistedIds.includes(p.id));
    } else if (activeTab === "interests") {
      list = list.filter(p => interestSentIds.includes(p.id));
    }

    if (["matches", "shortlisted", "interests"].includes(activeTab)) {
      list = list.filter(p => {
        const matchesSubCaste = searchSubCaste ? (p.subCaste || "").toLowerCase().includes(searchSubCaste.toLowerCase()) : true;
        const pTaluka = p.city || ""; // Profile's "city" field maps to Taluka
        const matchesTaluka = searchTaluka ? pTaluka.toLowerCase().includes(searchTaluka.toLowerCase()) : true;
        const pDistrict = p.district || "";
        const matchesDistrict = searchDistrict ? pDistrict.toLowerCase().includes(searchDistrict.toLowerCase()) : true;
        const pState = p.state || "";
        const matchesState = searchState ? pState.toLowerCase().includes(searchState.toLowerCase()) : true;
        const matchesAgeMin = searchAgeMin ? p.age >= parseInt(searchAgeMin) : true;
        const matchesAgeMax = searchAgeMax ? p.age <= parseInt(searchAgeMax) : true;
        const matchesVerified = searchVerifiedOnly ? p.isVerified : true;
        const matchesOnline = searchOnlineOnly ? p.isOnline : true;
        const matchesMaritalStatus = searchMaritalStatus && searchMaritalStatus !== "Any" 
          ? p.maritalStatus === searchMaritalStatus 
          : true;
        const matchesMatching = searchMatchingOnly
          ? ((p.subCaste || "").toLowerCase() === (myProfile?.subCaste || "").toLowerCase() || p.compatibility >= 80)
          : true;
        return matchesSubCaste && matchesState && matchesDistrict && matchesTaluka && matchesAgeMin && matchesAgeMax && matchesVerified && matchesOnline && matchesMaritalStatus && matchesMatching;
      });
    }

    if (activeTab === "search") {
      list = list.filter(p => {
        const matchesQuery = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.occupation || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.city || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubCaste = searchSubCaste ? (p.subCaste || "").toLowerCase().includes(searchSubCaste.toLowerCase()) : true;
        const pTaluka = p.city || "";
        const matchesTaluka = searchTaluka ? pTaluka.toLowerCase().includes(searchTaluka.toLowerCase()) : true;
        const pDistrict = p.district || "";
        const matchesDistrict = searchDistrict ? pDistrict.toLowerCase().includes(searchDistrict.toLowerCase()) : true;
        const pState = p.state || "";
        const matchesState = searchState ? pState.toLowerCase().includes(searchState.toLowerCase()) : true;
        const matchesVerified = searchVerifiedOnly ? p.isVerified : true;
        const matchesOnline = searchOnlineOnly ? p.isOnline : true;
        const matchesAgeMin = searchAgeMin ? p.age >= parseInt(searchAgeMin) : true;
        const matchesAgeMax = searchAgeMax ? p.age <= parseInt(searchAgeMax) : true;
        const matchesMaritalStatus = searchMaritalStatus && searchMaritalStatus !== "Any" 
          ? p.maritalStatus === searchMaritalStatus 
          : true;

        return matchesQuery && matchesSubCaste && matchesState && matchesDistrict && matchesTaluka && matchesVerified && matchesOnline && matchesAgeMin && matchesAgeMax && matchesMaritalStatus;
      });
    }

    if (userGender === "Male") {
      list = list.slice(0, 50);
    }

    return list;
  }, [
    profiles, myProfile, activeTab, shortlistedIds, interestSentIds,
    searchQuery, searchSubCaste, searchCountry, searchState, searchDistrict, searchTaluka, searchAgeMin, searchAgeMax,
    searchVerifiedOnly, searchOnlineOnly, searchMatchingOnly, searchMaritalStatus
  ]);
  const normalizedSentInterests = useMemo(() => {
    const sent = sentInterests.map(i => ({
      ...i,
      otherUserId: i.receiverId,
      isIncoming: false
    }));
    const receivedApproved = approvedReceivedInterests.map(i => ({
      ...i,
      otherUserId: i.senderId,
      isIncoming: true
    }));
    return [...sent, ...receivedApproved];
  }, [sentInterests, approvedReceivedInterests]);

  const menuItems = [
    { id: "matches" as TabType, name: t("Recommended Profiles"), icon: Users, badge: profiles.length },
    { id: "search" as TabType, name: t("Advanced Search"), icon: Search },
    { id: "shortlisted" as TabType, name: t("Shortlisted Profiles"), icon: Bookmark, badge: shortlistedIds.length },
    { id: "interests" as TabType, name: t("Interests"), icon: Heart, badge: interestSentIds.length + pendingInterestsReceived.length },
    { id: "messages" as TabType, name: t("Messages"), icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
    { id: "my-profile" as TabType, name: t("Profile"), icon: User },
    { id: "kyc" as TabType, name: t("KYC Verification"), icon: ShieldCheck },
    { id: "stories" as TabType, name: t("Success Stories"), icon: BookOpen },
    { id: "subscriptions" as TabType, name: t("Subscriptions"), icon: Award },
    { id: "settings" as TabType, name: t("Settings"), icon: Settings },
  ];

  return (
    <div className={`min-h-screen bg-[#faf7f2] dark:bg-dark-950 transition-colors duration-300 ${activeTab === 'messages' ? 'pb-0' : 'pb-20 lg:pb-0'}`}>
      {chatLoading && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-maroon-500 border-t-transparent rounded-full" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Setting up your chat...</p>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start`}>

        <DashboardSidebar
          menuItems={menuItems}
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          onSetActiveTab={setActiveTab}
          onSetSidebarOpen={setSidebarOpen}
        />

        {/* 2. MAIN INTERACTIVE VIEWS AREA */}
        <main className={`lg:col-span-9 space-y-6 ${activeTab === 'messages' ? 'h-[calc(100vh-160px)] flex flex-col space-y-0' : ''}`}>

          {/* TAB 1 & 3: matches directory, shortlisted */}
          {["matches", "shortlisted"].includes(activeTab) && (
            <>
              {(activeTab === "shortlisted") && userSubscription === "free" ? (
                <LockedContent activeTab={activeTab} onViewPlans={() => setActiveTab("subscriptions")} />
              ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-[500px]">
                  {!profileLoading && !myProfile?.onboardingCompleted && (
                    <Onboarding myProfileId={myProfile.id} onComplete={() => setMyProfile((prev: any) => prev ? { ...prev, onboardingCompleted: true } : null)} />
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
                        {activeTab === "matches" && t("Recommended Profiles")}
                        {activeTab === "shortlisted" && t("Shortlisted Profiles")}
                      </h2>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        {activeTab === "matches" && t("Personalized recommendations based on your preferences")}
                        {activeTab === "shortlisted" && t("shortlisted.desc")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeTab === "matches" && (
                        <FilterBar
                          searchQuery={searchQuery}
                          searchSubCaste={searchSubCaste}
                          searchCountry={searchCountry}
                          searchState={searchState}
                          searchDistrict={searchDistrict}
                          searchTaluka={searchTaluka}
                          searchAgeMin={searchAgeMin}
                          searchAgeMax={searchAgeMax}
                          searchVerifiedOnly={searchVerifiedOnly}
                          searchOnlineOnly={searchOnlineOnly}
                          searchMatchingOnly={searchMatchingOnly}
                          searchMaritalStatus={searchMaritalStatus}
                          filterDropdownOpen={filterDropdownOpen}
                          filterRef={filterRef}
                          onSearchQueryChange={setSearchQuery}
                          onSearchSubCasteChange={setSearchSubCaste}
                          onSearchCountryChange={setSearchCountry}
                          onSearchStateChange={setSearchState}
                          onSearchDistrictChange={setSearchDistrict}
                          onSearchTalukaChange={setSearchTaluka}
                          onSearchAgeMinChange={setSearchAgeMin}
                          onSearchAgeMaxChange={setSearchAgeMax}
                          onSearchVerifiedOnlyChange={setSearchVerifiedOnly}
                          onSearchOnlineOnlyChange={setSearchOnlineOnly}
                          onSearchMatchingOnlyChange={setSearchMatchingOnly}
                          onSearchMaritalStatusChange={setSearchMaritalStatus}
                          onToggleFilterDropdown={() => setFilterDropdownOpen(!filterDropdownOpen)}
                          onResetFilters={() => {
                            setSearchQuery("");
                            setSearchSubCaste("");
                            setSearchCountry("");
                            setSearchState("");
                            setSearchDistrict("");
                            setSearchTaluka("");
                            setSearchAgeMin("18");
                            setSearchAgeMax("70");
                            setSearchVerifiedOnly(false);
                            setSearchOnlineOnly(false);
                            setSearchMatchingOnly(false);
                            setSearchMaritalStatus("Any");
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <ProfileGrid
                    loading={loading}
                    displayList={displayList}
                    myProfileGender={myProfile?.gender || "Male"}
                    shortlistedIds={shortlistedIds}
                    interestSentIds={interestSentIds}
                    approvedConnectionIds={[...sentInterests.filter(i => i.status === "approved").map(i => i.receiverId), ...approvedReceivedIds]}
                    userSubscription={userSubscription}
                    onToggleShortlist={toggleShortlist}
                    onToggleInterest={toggleInterest}
                    onStartChat={startChat}
                    onViewProfile={(id) => setActiveTab("view-profile", id)}
                    onSetSelectedInvitationProfile={setSelectedInvitationProfile}
                    recommended={true}
                  />
                </div>
              )}
            </>
          )}

          {/* TAB 2: Advanced Search (Integrated) */}
          {activeTab === "search" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{t("search.title")}</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{t("search.desc")}</p>
              </div>

              <div className="flex flex-col gap-6">
                <SearchFilters
                  searchQuery={searchQuery}
                  searchSubCaste={searchSubCaste}
                  searchCountry={searchCountry}
                  searchState={searchState}
                  searchDistrict={searchDistrict}
                  searchTaluka={searchTaluka}
                  searchAgeMin={searchAgeMin}
                  searchAgeMax={searchAgeMax}
                  searchVerifiedOnly={searchVerifiedOnly}
                  searchOnlineOnly={searchOnlineOnly}
                  searchMaritalStatus={searchMaritalStatus}
                  advancedFilterOpen={advancedFilterOpen}
                  advFilterRef={advFilterRef}
                  onSearchQueryChange={setSearchQuery}
                  onSearchSubCasteChange={setSearchSubCaste}
                  onSearchCountryChange={setSearchCountry}
                  onSearchStateChange={setSearchState}
                  onSearchDistrictChange={setSearchDistrict}
                  onSearchTalukaChange={setSearchTaluka}
                  onSearchAgeMinChange={setSearchAgeMin}
                  onSearchAgeMaxChange={setSearchAgeMax}
                  onSearchVerifiedOnlyChange={setSearchVerifiedOnly}
                  onSearchOnlineOnlyChange={setSearchOnlineOnly}
                  onSearchMaritalStatusChange={setSearchMaritalStatus}
                  onToggleAdvancedFilter={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                  onResetFilters={() => {
                    setSearchQuery("");
                    setSearchSubCaste("");
                    setSearchCountry("");
                    setSearchState("");
                    setSearchDistrict("");
                    setSearchTaluka("");
                    setSearchVerifiedOnly(false);
                    setSearchOnlineOnly(false);
                    setSearchMaritalStatus("Any");
                    setSearchAgeMin("18");
                    setSearchAgeMax("70");
                  }}
                />

                {/* Search Results List */}
                <div>
                  {displayList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                      {displayList.map((profile) => (
                        <ProfileCard
                          key={profile.id}
                          profile={profile}
                          shortlistedIds={shortlistedIds}
                          interestSentIds={interestSentIds}
                          approvedConnectionIds={[...sentInterests.filter(i => i.status === "approved").map(i => i.receiverId), ...approvedReceivedIds]}
                          userSubscription={userSubscription}
                          onToggleShortlist={toggleShortlist}
                          onToggleInterest={toggleInterest}
                          onStartChat={startChat}
                          onViewProfile={(id) => setActiveTab("view-profile", id)}
                          onSetSelectedInvitationProfile={setSelectedInvitationProfile}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
                      <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No matching profiles found.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try broadening your search keywords or sub-caste selections.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Messages */}
          {activeTab === "messages" && (
            <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl overflow-hidden shadow-sm lg:col-span-9">
              <div className="flex flex-1 overflow-hidden">
                <div className={`${!activeConversationId ? "flex" : "hidden"} md:flex w-full md:w-80 border-r border-slate-200 dark:border-dark-800 flex-shrink-0`}>
                  <ChatList onBackToHome={() => setActiveTab("matches")} />
                </div>
                <div className={`flex-1 flex ${activeConversationId ? "flex" : "hidden md:flex"}`}>
                  <ChatThread onBack={() => setActiveConversation(null)} />
                </div>
              </div>
            </div>
          )}

          {/* Combined Interests Tab */}
          {activeTab === "interests" && (
            <InterestsPanel
              loading={interestsLoading}
              sentInterests={normalizedSentInterests}
              pendingInterestsReceived={pendingInterestsReceived}
              profiles={profiles}
              currentUserId={myProfile?.id || ""}
              marriageRequests={marriageRequests}
              approvedReceivedIds={approvedReceivedIds}
              onViewProfile={(id: string) => setActiveTab("view-profile", id)}
              onMessage={(profile: any) => startChat(profile)}
              onApprove={handleApproveInterest}
              onReject={handleRejectInterest}
              onAcceptMarriageRequest={handleAcceptMarriageRequest}
              onRejectMarriageRequest={handleRejectMarriageRequest}
              onOpenMarriageModal={(profile: any) => {
                setSelectedMarriageProfile(profile);
                setIsMarriageModalOpen(true);
              }}
            />
          )}

          {/* TAB 6: Profile */}
          {activeTab === "my-profile" && (
            <MyProfileSection
              myProfile={myProfile}
              isEditingProfile={isEditingProfile}
              progressPercent={progressPercent}
              userSubscription={userSubscription}
              profileFormState={profileFormState}
              onStartEdit={handleStartEdit}
              onFormChange={handleFormChange}
              onSaveProfile={handleSaveProfile}
              onCancelEdit={() => setIsEditingProfile(false)}
              photos={photos}
              uploadingPhoto={uploadingPhoto}
              onPhotoUpload={handlePhotoUpload}
              onDeletePhoto={handleDeletePhoto}
              onEditMarriageDetails={handleOpenEditMarriageModal}
            />
          )}



          {/* TAB 8: KYC Verification */}
          {activeTab === "kyc" && (
            <KYCPanel
              kycDocs={kycDocs}
              kycStatus={kycStatus}
              kycRejectReason={kycRejectReason}
              kycUploading={kycUploading}
              onKycUpload={handleKycUpload}
              onKycDelete={handleKycDelete}
            />
          )}

          {/* TAB 9: Success Stories */}
          {activeTab === "stories" && (
            <SuccessStories onSelectStory={setSelectedStory} myProfile={myProfile} showToast={showToast} />
          )}

          {/* TAB 10: Premium Subscriptions */}
          {activeTab === "subscriptions" && (
            <SubscriptionPlans
              userSubscription={userSubscription}
              isBillingYearly={isBillingYearly}
              onIsBillingYearlyChange={setIsBillingYearly}
              onPlanSelect={handlePlanSelect}
            />
          )}

          {/* TAB 11: Settings & Privacy */}
          {activeTab === "settings" && (
            <SettingsPanel
              privacySettings={privacySettings}
              language={language}
              onPrivacySettingChange={(key, value) =>
                setPrivacySettings(prev => ({ ...prev, [key]: value }))
              }
              onSetLanguage={setLanguage}
              onLogout={handleLogout}
              onOpenHelp={() => setActiveTab("help")}
            />
          )}

          {/* Help & Support (Normally inside Settings now, but keep rendering logic if tab is somehow activated) */}
          {activeTab === "help" && (
            <HelpSupport
              faqOpen={faqOpen}
              supportSubmitted={supportSubmitted}
              myProfile={myProfile}
              onSetFaqOpen={setFaqOpen}
              onSupportSubmit={handleSupportSubmit as any}
            />
          )}

          {/* TAB 13: View Profile details */}
          {activeTab === "view-profile" && activeProfile && (
            <ViewProfile
              profile={activeProfile}
              myProfile={myProfile}
              allProfiles={profiles}
              showContactPremium={showContactPremium}
              userSubscription={userSubscription}
              interestSentIds={interestSentIds}
              approvedConnectionIds={[...sentInterests.filter(i => i.status === "approved").map(i => i.receiverId), ...approvedReceivedIds]}
              marriageRequests={marriageRequests}
              activeDetailPhoto={activeDetailPhoto}
              onBack={() => setActiveTab("matches")}
              onToggleInterest={toggleInterest}
              onStartChat={startChat}
              onSetActiveTab={setActiveTab}
              onSetShowContactPremium={setShowContactPremium}
              onSetActiveDetailPhoto={setActiveDetailPhoto}
              onOpenMarriageModal={setSelectedMarriageProfile}
              showToast={showToast as (msg: string, type?: string) => void}
              onEditMarriageDetails={handleOpenEditMarriageModal}
            />
          )}

        </main>
      </div>

      {/* Celebration Confetti on Subscription */}
      {showCelebration && <CelebrationConfetti />}

      {/* Bottom Mobile Navigation */}
      <MobileBottomNav activeTab={activeTab} onSetActiveTab={setActiveTab} globalUnreadCount={globalUnreadCount} />

      {/* Success Story Modal */}
      <StoryModal selectedStory={selectedStory} onClose={() => setSelectedStory(null)} />

      {/* Wedding Invitation Modal */}
      <WeddingInvitationModal
        selectedInvitationProfile={selectedInvitationProfile}
        shortlistedIds={shortlistedIds}
        interestSentIds={interestSentIds}
        onToggleShortlist={toggleShortlist}
        onToggleInterest={toggleInterest}
        onClose={() => setSelectedInvitationProfile(null)}
      />

      {/* Marriage Proposal Modal */}
      <MarriageProposalModal
        selectedProfile={selectedMarriageProfile}
        isSubmitting={isSubmittingProposal}
        onSendProposal={handleSendMarriageProposal}
        onClose={() => {
          setIsMarriageModalOpen(false);
          setSelectedMarriageProfile(null);
        }}
      />

      {/* Edit / Cancel Marriage Modal */}
      <EditMarriageModal
        isOpen={isEditMarriageModalOpen}
        onClose={() => { setIsEditMarriageModalOpen(false); setDeletionStage(""); }}
        onUpdate={handleUpdateMarriageDetails}
        onCancelMarriage={handleCancelMarriage}
        initialDate={myProfile.weddingDate || ""}
        initialTime={myProfile.weddingTime || ""}
        initialVenue={myProfile.venue || ""}
        isSubmitting={isSubmittingMarriageUpdate}
        partnerName={myProfile.partnerName || "Partner"}
        deletionStage={deletionStage}
      />
    </div>
  );
};

export default Dashboard;
