import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { database, auth, storage, realtimeHelpers } from "../../config/firebase";
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

  useEffect(() => {
    const fetchProfiles = async (currentUser: any) => {
      try {
        const snapshot = await realtimeHelpers.get(realtimeHelpers.ref(database, "profiles"));
        const rawProfiles = snapshot.val() || {};
        const dbProfiles = Object.entries(rawProfiles).map(([id, val]: [string, any]) => {
          const data = val || {};
          return {
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
            // Preferences
            prefFamilyType: data.prefFamilyType || "",
            prefWorking: data.prefWorking || "",
            prefValues: data.prefValues || "",
            // Horoscope
            rashi: data.rashi || "",
            nakshatra: data.nakshatra || "",
            manglik: data.manglik || "",
            birthTime: data.birthTime || "",
            birthPlace: data.birthPlace || "",
            kycStatus: data.kycStatus || "",
            kycRejectReason: data.kycRejectReason || "",
          };
        });

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
              const profileRef = realtimeHelpers.ref(database, `profiles/${userProfile.id}`);
              realtimeHelpers.update(profileRef, { uid: currentUser.uid }).catch(() => { });
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
              const newProfileRef = realtimeHelpers.push(realtimeHelpers.ref(database, "profiles"));
              const docId = newProfileRef.key!;
              await realtimeHelpers.set(newProfileRef, {
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

    // Listen for interests
    const interestsRef = realtimeHelpers.ref(database, "interests");
    const unsubInterests = realtimeHelpers.onValue(interestsRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const allInterests = Object.entries(raw).map(([id, data]: [string, any]) => ({ id, ...data }));

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

    // Listen for Marriage Requests
    const marriageRequestsRef = realtimeHelpers.ref(database, "marriageRequests");
    const unsubMarriageRequests = realtimeHelpers.onValue(marriageRequestsRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const requests = Object.entries(raw).map(([id, data]: [string, any]) => ({ id, ...data }));
      const myRequests = requests.filter((r: any) => r.senderId === myProfile.id || r.receiverId === myProfile.id);
      setMarriageRequests(myRequests);
    });

    // Listen for Notifications (no toasts, only visible on dropdown)
    const notificationsRef = realtimeHelpers.ref(database, "notifications");
    const unsubNotifications = realtimeHelpers.onValue(notificationsRef, (snapshot) => {
      // Background notifications show up on dropdown
    });

    return () => {
      unsubInterests();
      unsubMarriageRequests();
      unsubNotifications();
    };
  }, [myProfile?.id, profiles]);

  // Heartbeat: keep isOnline true and update lastActive every 30s
  useEffect(() => {
    if (!myProfile?.id) return;
    const profileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);

    const heartbeat = async () => {
      try {
        await realtimeHelpers.update(profileRef, { isOnline: true, lastActive: Date.now() });
      } catch { /* ignore */ }
    };

    heartbeat();
    const interval = setInterval(heartbeat, 30000);

    const handleBeforeUnload = () => {
      realtimeHelpers.update(profileRef, { isOnline: false, lastActive: Date.now() }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      realtimeHelpers.update(profileRef, { isOnline: false, lastActive: Date.now() }).catch(() => {});
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
        // Find and delete the sent interest
        const snap = await realtimeHelpers.get(realtimeHelpers.ref(database, "interests"));
        const raw = snap.val() || {};
        const match = Object.entries(raw).find(([, data]: [string, any]) => data.senderId === myProfile.id && data.receiverId === id);
        if (match) {
          await realtimeHelpers.remove(realtimeHelpers.ref(database, `interests/${match[0]}`));
        }
        showToast("Interest removed.");
      } else {
        const newInterestRef = realtimeHelpers.push(realtimeHelpers.ref(database, "interests"));
        await realtimeHelpers.set(newInterestRef, {
          senderId: myProfile.id,
          receiverId: id,
          status: "pending",
          timestamp: Date.now()
        });

        // Add Notification
        const senderName = myProfile.name || myProfile.firstName || "Someone";
        const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
        await realtimeHelpers.set(newNotifRef, {
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
    try {
      const snap = await realtimeHelpers.get(realtimeHelpers.ref(database, "interests"));
      const raw = snap.val() || {};
      const match = Object.entries(raw).find(([, data]: [string, any]) => data.receiverId === myProfile.id && data.senderId === senderId && data.status === "pending");
      if (match) {
        await realtimeHelpers.update(realtimeHelpers.ref(database, `interests/${match[0]}`), { status: "approved" });
        showToast(`You approved ${senderName}'s interest!`);

        // Add Notification
        const myName = myProfile.name || myProfile.firstName || "Someone";
        const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
        await realtimeHelpers.set(newNotifRef, {
          receiverId: senderId,
          senderId: myProfile.id,
          text: `${myName} accepted your interest request!`,
          type: "interest_approved",
          read: false,
          createdAt: Date.now()
        });

        const initialMessage = "Our stars aligned and so did our vibes! 💖 Let's start this beautiful journey together.";
        await startAndMessageConversation(senderId, senderName, senderPhoto, initialMessage);

        setActiveTab("messages");
      }
    } catch (err) {
      console.error("Error approving interest:", err);
      showToast("Failed to approve interest.", "error");
    }
  };

  const handleRejectInterest = async (senderId: string) => {
    try {
      const snap = await realtimeHelpers.get(realtimeHelpers.ref(database, "interests"));
      const raw = snap.val() || {};
      const match = Object.entries(raw).find(([, data]: [string, any]) => data.receiverId === myProfile.id && data.senderId === senderId && data.status === "pending");
      if (match) {
        await realtimeHelpers.remove(realtimeHelpers.ref(database, `interests/${match[0]}`));
        showToast("Interest declined.");

        // Add Notification
        const myName = myProfile.name || myProfile.firstName || "Someone";
        const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
        await realtimeHelpers.set(newNotifRef, {
          receiverId: senderId,
          senderId: myProfile.id,
          text: `${myName} respectfully declined your interest.`,
          type: "interest_rejected",
          read: false,
          createdAt: Date.now()
        });
      }
    } catch (err) {
      console.error("Error rejecting interest:", err);
      showToast("Failed to reject interest.", "error");
    }
  };

  const handleSendMarriageProposal = async (proposalData: { date: string; time: string; venue: string }) => {
    if (!selectedMarriageProfile) return;
    setIsSubmittingProposal(true);
    try {
      const proposalRef = realtimeHelpers.push(realtimeHelpers.ref(database, "marriageRequests"));
      await realtimeHelpers.set(proposalRef, {
        senderId: myProfile.id,
        receiverId: selectedMarriageProfile.id,
        weddingDate: proposalData.date,
        weddingTime: proposalData.time,
        venue: proposalData.venue,
        status: "pending",
        timestamp: Date.now()
      });

      const senderName = myProfile.name || myProfile.firstName || "Someone";
      const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
      await realtimeHelpers.set(newNotifRef, {
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
      const requestRef = realtimeHelpers.ref(database, `marriageRequests/${requestId}`);
      const requestDoc = await realtimeHelpers.get(requestRef);
      if (!requestDoc.exists()) return;

      const reqData = requestDoc.val();

      // 1. Update request status
      await realtimeHelpers.update(requestRef, { status: "accepted" });

      // 2. Set both profiles to isMarried = true, maritalStatus = "Married", and save partner info
      const myProfileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
      const senderProfileRef = realtimeHelpers.ref(database, `profiles/${senderProfile.id}`);
      
      const weddingDate = reqData.weddingDate || "";
      
      await realtimeHelpers.update(myProfileRef, { 
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
      
      await realtimeHelpers.update(senderProfileRef, { 
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

      // Add Notification
      const myName = myProfile.name || myProfile.firstName || "Someone";
      const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
      await realtimeHelpers.set(newNotifRef, {
        receiverId: senderProfile.id,
        senderId: myProfile.id,
        text: `${myName} accepted your marriage proposal! Congratulations!`,
        type: "marriage_proposal_accepted",
        read: false,
        createdAt: Date.now()
      });

      // 3. Create Success Story
      const successStoryRef = realtimeHelpers.push(realtimeHelpers.ref(database, "successStories"));
      await realtimeHelpers.set(successStoryRef, {
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

  const handleRejectMarriageRequest = async (requestId: string) => {
    try {
      const requestRef = realtimeHelpers.ref(database, `marriageRequests/${requestId}`);
      const reqSnap = await realtimeHelpers.get(requestRef);
      if (reqSnap.exists()) {
        const reqData = reqSnap.val();
        const otherUserId = reqData.senderId === myProfile.id ? reqData.receiverId : reqData.senderId;

        // 1. Delete marriage request document
        await realtimeHelpers.remove(requestRef);

        // 2. Delete interest document(s) between them
        const interestsSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, "interests"));
        const rawInterests = interestsSnap.val() || {};
        for (const [id, data] of Object.entries(rawInterests)) {
          const item = data as any;
          if (
            (item.senderId === myProfile.id && item.receiverId === otherUserId) ||
            (item.senderId === otherUserId && item.receiverId === myProfile.id)
          ) {
            await realtimeHelpers.remove(realtimeHelpers.ref(database, `interests/${id}`));
          }
        }

        // 3. Send Notification to the other user
        const myName = myProfile.name || myProfile.firstName || "Someone";
        const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
        await realtimeHelpers.set(newNotifRef, {
          receiverId: otherUserId,
          senderId: myProfile.id,
          text: `${myName} declined your marriage proposal.`,
          type: "marriage_proposal_rejected",
          read: false,
          createdAt: Date.now()
        });

        showToast("Marriage Request declined and connection reset.");
      }
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

      // 1. Find the accepted marriage request
      const req = marriageRequests.find(
        (r: any) =>
          (r.senderId === myProfile.id || r.receiverId === myProfile.id) &&
          (r.senderId === partnerId || r.receiverId === partnerId) &&
          r.status === "accepted"
      );

      if (req) {
        const reqRef = realtimeHelpers.ref(database, `marriageRequests/${req.id}`);
        await realtimeHelpers.update(reqRef, {
          weddingDate: data.date,
          weddingTime: data.time,
          venue: data.venue
        });
      }

      // 2. Update both profiles' weddingDate, weddingTime, venue in RTDB
      const myProfileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
      const partnerProfileRef = realtimeHelpers.ref(database, `profiles/${partnerId}`);
      await realtimeHelpers.update(myProfileRef, { weddingDate: data.date, weddingTime: data.time, venue: data.venue });
      await realtimeHelpers.update(partnerProfileRef, { weddingDate: data.date, weddingTime: data.time, venue: data.venue });

      // 3. Find and update the successStory document
      const ssSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, "successStories"));
      const rawStories = ssSnap.val() || {};
      for (const [id, storyData] of Object.entries(rawStories)) {
        const ssData = storyData as any;
        if (
          (ssData.partner1Id === myProfile.id && ssData.partner2Id === partnerId) ||
          (ssData.partner2Id === myProfile.id && ssData.partner1Id === partnerId)
        ) {
          const ssRef = realtimeHelpers.ref(database, `successStories/${id}`);
          await realtimeHelpers.update(ssRef, {
            weddingDate: data.date,
            venue: data.venue
          });
        }
      }

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
      const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
      await realtimeHelpers.set(newNotifRef, {
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

      // 1. Delete the marriageRequests document
      const req = marriageRequests.find(
        (r: any) =>
          (r.senderId === myProfile.id || r.receiverId === myProfile.id) &&
          (r.senderId === partnerId || r.receiverId === partnerId) &&
          r.status === "accepted"
      );
      if (req) {
        await realtimeHelpers.remove(realtimeHelpers.ref(database, `marriageRequests/${req.id}`));
      }

      // 2. Find and delete the successStory document
      const ssSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, "successStories"));
      const rawStories = ssSnap.val() || {};
      for (const [id, storyData] of Object.entries(rawStories)) {
        const ssData = storyData as any;
        if (
          (ssData.partner1Id === myProfile.id && ssData.partner2Id === partnerId) ||
          (ssData.partner2Id === myProfile.id && ssData.partner1Id === partnerId)
        ) {
          await realtimeHelpers.remove(realtimeHelpers.ref(database, `successStories/${id}`));
        }
      }

      // 3. Delete the interests document between them (completely resets matching)
      const interestsSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, "interests"));
      const rawInterests = interestsSnap.val() || {};
      for (const [id, data] of Object.entries(rawInterests)) {
        const item = data as any;
        if (
          (item.senderId === myProfile.id && item.receiverId === partnerId) ||
          (item.senderId === partnerId && item.receiverId === myProfile.id)
        ) {
          await realtimeHelpers.remove(realtimeHelpers.ref(database, `interests/${id}`));
        }
      }

      // 4. Delete the conversations document and all its messages
      const convId = [myProfile.id, partnerId].sort().join("_");
      try {
        await realtimeHelpers.remove(realtimeHelpers.ref(database, `messages/${convId}`));
        await realtimeHelpers.remove(realtimeHelpers.ref(database, `conversations/${convId}`));
      } catch (chatErr) {
        console.error("Failed to delete chat logs, continuing reset:", chatErr);
      }

      // 5. Fetch partner's profile to retrieve their previousMaritalStatus
      let partnerPrevStatus = "Never Married";
      const partnerSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, `profiles/${partnerId}`));
      if (partnerSnap.exists()) {
        partnerPrevStatus = partnerSnap.val().previousMaritalStatus || "Never Married";
      }

      // 6. Reset both profiles in RTDB
      const myPrevStatus = myProfile.previousMaritalStatus || "Never Married";
      const myProfileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
      const partnerProfileRef = realtimeHelpers.ref(database, `profiles/${partnerId}`);

      await realtimeHelpers.update(myProfileRef, {
        isMarried: false,
        maritalStatus: myPrevStatus,
        previousMaritalStatus: null,
        partnerId: null,
        partnerName: null,
        partnerPhoto: null,
        weddingDate: null
      });

      await realtimeHelpers.update(partnerProfileRef, {
        isMarried: false,
        maritalStatus: partnerPrevStatus,
        previousMaritalStatus: null,
        partnerId: null,
        partnerName: null,
        partnerPhoto: null,
        weddingDate: null
      });

      // 7. Send notification to the partner about the cancellation
      const myName = myProfile.name || myProfile.firstName || "Someone";
      const newNotifRef = realtimeHelpers.push(realtimeHelpers.ref(database, "notifications"));
      await realtimeHelpers.set(newNotifRef, {
        receiverId: partnerId,
        senderId: myProfile.id,
        text: `${myName} cancelled the marriage connection. Your profiles have been reset.`,
        type: "marriage_cancelled",
        read: false,
        createdAt: Date.now()
      });

      // 8. Update local states
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === myProfile.id) {
            return {
              ...p,
              isMarried: false,
              maritalStatus: myPrevStatus,
              previousMaritalStatus: null,
              partnerId: null,
              partnerName: null,
              partnerPhoto: null,
              weddingDate: null
            };
          }
          if (p.id === partnerId) {
            return {
              ...p,
              isMarried: false,
              maritalStatus: partnerPrevStatus,
              previousMaritalStatus: null,
              partnerId: null,
              partnerName: null,
              partnerPhoto: null,
              weddingDate: null
            };
          }
          return p;
        })
      );

      setMyProfile((prev: any) => ({
        ...prev,
        isMarried: false,
        maritalStatus: myPrevStatus,
        previousMaritalStatus: null,
        partnerId: null,
        partnerName: null,
        partnerPhoto: null,
        weddingDate: null
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

      // Save to RTDB so admin can review
      const profileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
      const key = typeLower === "front" ? "front" : "back";
      await realtimeHelpers.update(profileRef, {
        [`kycDocuments/${key}`]: uploadUrl,
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
      const ticketRef = realtimeHelpers.push(realtimeHelpers.ref(database, "supportTickets"));
      await realtimeHelpers.set(ticketRef, {
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
      const profileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
      await realtimeHelpers.update(profileRef, { photos: updatedPhotos });
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

      const profileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
      await realtimeHelpers.update(profileRef, { photos: updatedPhotos });

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
        const profileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
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
            // Find the success story where this user is a partner
            const ssSnap = await realtimeHelpers.get(realtimeHelpers.ref(database, "successStories"));
            const rawStories = ssSnap.val() || {};
            
            let partnerId = null;
            let storyDocId = null;
            
            for (const [storyId, storyData] of Object.entries(rawStories)) {
              const data = storyData as any;
              if (data.partner1Id === myProfile.id) {
                partnerId = data.partner2Id;
                storyDocId = storyId;
              } else if (data.partner2Id === myProfile.id) {
                partnerId = data.partner1Id;
                storyDocId = storyId;
              }
            }

            // Un-marry the partner and delete the success story
            if (partnerId) {
              const partnerRef = realtimeHelpers.ref(database, `profiles/${partnerId}`);
              await realtimeHelpers.update(partnerRef, { 
                isMarried: false,
                maritalStatus: "Divorced"
              });
            }
            if (storyDocId) {
              await realtimeHelpers.remove(realtimeHelpers.ref(database, `successStories/${storyDocId}`));
            }
          }
        }

        await realtimeHelpers.update(profileRef, saveData);
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
        const profileRef = realtimeHelpers.ref(database, `profiles/${myProfile.id}`);
        await realtimeHelpers.update(profileRef, {
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

        const subscriptionRef = realtimeHelpers.push(realtimeHelpers.ref(database, "subscriptions"));
        await realtimeHelpers.set(subscriptionRef, {
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
        onClose={() => setIsEditMarriageModalOpen(false)}
        onUpdate={handleUpdateMarriageDetails}
        onCancelMarriage={handleCancelMarriage}
        initialDate={myProfile.weddingDate || ""}
        initialTime={myProfile.weddingTime || ""}
        initialVenue={myProfile.venue || ""}
        isSubmitting={isSubmittingMarriageUpdate}
        partnerName={myProfile.partnerName || "Partner"}
      />
    </div>
  );
};

export default Dashboard;
