import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  FileCheck2, 
  Check, 
  X, 
  Search,
  ShieldCheck,
  Activity,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Filter,
  Edit,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  LayoutDashboard,
  Settings,
  Trash2,
} from "lucide-react";
import { db, auth } from "../../config/firebase";
import { collection, getDocs, updateDoc, doc, setDoc, onSnapshot, query, where, getDoc, addDoc, serverTimestamp, deleteDoc, writeBatch } from "firebase/firestore";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SettingsPanel from "../dashboard/components/SettingsPanel";
import { useLanguage } from "../../context/LanguageContext";

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  
  const [privacySettings, setPrivacySettings] = useState({
    hideProfile: false,
    blurHoroscope: false,
    maskContact: false,
    emailNotifications: true,
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  
  const [kycProfiles, setKycProfiles] = useState<any[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [memberSubscriptions, setMemberSubscriptions] = useState<any[]>([]);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const seedDummyUsers = async () => {
    try {
      const maleUser = {
        id: "LM-TEST-MALE1",
        firstName: "Raj",
        lastName: "Sharma",
        name: "Raj Sharma",
        email: "raj.sharma@example.com",
        gender: "Male",
        dob: "1994-08-15",
        age: 29,
        mobile: "+91 9876543210",
        religion: "Hinduism",
        caste: "Brahmin",
        subCaste: "Saraswat",
        motherTongue: "Marathi",
        height: "5'11\"",
        weight: "75 kg",
        maritalStatus: "Never Married",
        isMarried: false,
        education: "M.Tech in Computer Science",
        occupation: "Software Engineer",
        income: "₹15 Lakh - ₹20 Lakh",
        address: "Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        district: "Mumbai Suburban",
        familyDetails: "Nuclear family with traditional values.",
        fatherOccupation: "Businessman",
        motherOccupation: "Homemaker",
        siblings: "1 Brother",
        lifestyle: "Moderate",
        foodPreference: "Vegetarian",
        smoking: "No",
        drinking: "No",
        hobbies: "Reading, Traveling",
        isOnline: true,
        isVerified: true,
        isPremium: true,
        compatibility: 95,
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        ],
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
      };

      const femaleUser = {
        id: "LM-TEST-FEMALE1",
        firstName: "Priya",
        lastName: "Patil",
        name: "Priya Patil",
        email: "priya.patil@example.com",
        gender: "Female",
        dob: "1996-03-10",
        age: 28,
        mobile: "+91 9876543211",
        religion: "Hinduism",
        caste: "Maratha",
        subCaste: "Deshmukh",
        motherTongue: "Marathi",
        height: "5'4\"",
        weight: "58 kg",
        maritalStatus: "Never Married",
        isMarried: false,
        education: "MBA in Finance",
        occupation: "Financial Analyst",
        income: "₹10 Lakh - ₹12 Lakh",
        address: "Bandra East",
        city: "Mumbai",
        state: "Maharashtra",
        district: "Mumbai Suburban",
        familyDetails: "Joint family.",
        fatherOccupation: "Government Employee",
        motherOccupation: "Homemaker",
        siblings: "1 Sister",
        lifestyle: "Modern",
        foodPreference: "Vegetarian",
        smoking: "No",
        drinking: "Occasionally",
        hobbies: "Dancing, Cooking",
        isOnline: true,
        isVerified: true,
        isPremium: true,
        compatibility: 92,
        photos: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop"
        ],
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
      };

      await setDoc(doc(db, "profiles", maleUser.id), maleUser);
      await setDoc(doc(db, "profiles", femaleUser.id), femaleUser);

      toast.success("Dummy users generated successfully!");
    } catch(err) {
      console.error(err);
      toast.error("Failed to generate dummy users");
    }
  };

  // Search/Filter states
  const [searchKyc, setSearchKyc] = useState("");
  const [searchOnline, setSearchOnline] = useState("");
  const [searchSub, setSearchSub] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [filterUnverified, setFilterUnverified] = useState("All");

  // Modals state
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Member selection & delete
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [dashboardSelectedIds, setDashboardSelectedIds] = useState<Set<string>>(new Set());
  const [dashboardSelectAll, setDashboardSelectAll] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<any | null>(null);
  const [deletingMembers, setDeletingMembers] = useState(false);

  // Pagination states
  const [unverifiedPage, setUnverifiedPage] = useState(1);
  const [unverifiedRowsPerPage, setUnverifiedRowsPerPage] = useState(10);
  
  const [onlinePage, setOnlinePage] = useState(1);
  const [onlineRowsPerPage, setOnlineRowsPerPage] = useState(10);

  const [membersPage, setMembersPage] = useState(1);
  const [membersRowsPerPage, setMembersRowsPerPage] = useState(10);

  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-dashboard-sidebar', handler);
    return () => window.removeEventListener('toggle-dashboard-sidebar', handler);
  }, []);

  const [adminRole, setAdminRole] = useState("admin");

  useEffect(() => {
    const fetchAdminRole = async () => {
      if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, "profiles", auth.currentUser.uid));
        if (docSnap.exists() && docSnap.data().role) {
          setAdminRole(docSnap.data().role);
        }
      }
    };
    fetchAdminRole();
  }, []);

  // Fetch Data from Firestore
  useEffect(() => {
    setLoading(true);

    // Profiles for Directory & KYC
    const unsubProfiles = onSnapshot(collection(db, "profiles"), (snapshot) => {
      const profilesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOnlineMembers(profilesData);
      setKycProfiles(profilesData.filter((p: any) => p.isVerified === false));
    });

    // Subscriptions
    const unsubSubs = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
      setMemberSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Support Tickets
    const unsubTickets = onSnapshot(collection(db, "supportTickets"), (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);

    return () => {
      unsubProfiles();
      unsubSubs();
      unsubTickets();
    };
  }, []);
  
  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleApproveKYC = async (id: string) => {
    try {
      await updateDoc(doc(db, "profiles", id), { isVerified: true });
      await addDoc(collection(db, "notifications"), {
        userId: id,
        title: "KYC Approved",
        message: "Your KYC documents have been approved. Your profile is now verified!",
        type: "success",
        read: false,
        timestamp: serverTimestamp()
      });
      toast.success(`KYC Document approved! Verification badge has been issued.`);
      setSelectedKyc(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve KYC.");
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    if (adminRole !== "super_admin") {
      toast.error("Only super admins can update roles.");
      return;
    }
    try {
      await updateDoc(doc(db, "profiles", id), { role: newRole });
      toast.success("User role updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    }
  };

  const handleRejectKYC = async (id: string) => {
    const reason = prompt("Enter verification rejection reason:");
    if (reason !== null) {
      try {
        await updateDoc(doc(db, "profiles", id), { kycRejectReason: reason });
        await addDoc(collection(db, "notifications"), {
          userId: id,
          title: "KYC Rejected",
          message: `Your KYC documents were rejected. Reason: ${reason}`,
          type: "error",
          read: false,
          timestamp: serverTimestamp()
        });
        toast.success(`KYC Document rejected. User notified.`);
        setSelectedKyc(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to reject KYC.");
      }
    }
  };

  const handleTicketUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await updateDoc(doc(db, "supportTickets", selectedTicket.id), {
        status: selectedTicket.status,
        adminReply: selectedTicket.adminReply || ""
      });
      toast.success(`Ticket ${selectedTicket.id} updated successfully.`);
      setSelectedTicket(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket.");
    }
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    if (adminRole !== "super_admin") {
      toast.error("Only super admins can modify subscriptions.");
      return;
    }
    try {
      await updateDoc(doc(db, "subscriptions", editingSub.id), {
        plan: editingSub.plan,
        billing: editingSub.billing,
        expiry: editingSub.expiry
      });
      toast.success("Subscription updated successfully!");
      setEditingSub(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update subscription.");
    }
  };

  const deleteUserCascade = async (profile: any) => {
    setDeletingMembers(true);
    try {
      const profileId = profile.id;
      const uid = profile.uid;

      // Delete profile document
      await deleteDoc(doc(db, "profiles", profileId)).catch(() => {});

      // Delete conversations and their messages
      const convQuery = query(collection(db, "conversations"), where("participants", "array-contains", profileId));
      const convSnap = await getDocs(convQuery);
      const batch = writeBatch(db);
      for (const convDoc of convSnap.docs) {
        const msgSnap = await getDocs(collection(db, "conversations", convDoc.id, "messages"));
        msgSnap.docs.forEach(m => batch.delete(m.ref));
        batch.delete(convDoc.ref);
      }
      await batch.commit();

      // Delete interests (sent/received)
      const interestQuery = query(
        collection(db, "interests"),
        where("senderId", "==", profileId)
      );
      const interestSnap = await getDocs(interestQuery);
      const interestBatch = writeBatch(db);
      interestSnap.docs.forEach(d => interestBatch.delete(d.ref));
      const interestReceivedQuery = query(
        collection(db, "interests"),
        where("receiverId", "==", profileId)
      );
      const interestReceivedSnap = await getDocs(interestReceivedQuery);
      interestReceivedSnap.docs.forEach(d => interestBatch.delete(d.ref));
      await interestBatch.commit();

      // Delete marriage requests
      const mrQuery = query(
        collection(db, "marriageRequests"),
        where("senderId", "==", profileId)
      );
      const mrSnap = await getDocs(mrQuery);
      const mrBatch = writeBatch(db);
      mrSnap.docs.forEach(d => mrBatch.delete(d.ref));
      const mrReceivedQuery = query(
        collection(db, "marriageRequests"),
        where("receiverId", "==", profileId)
      );
      const mrReceivedSnap = await getDocs(mrReceivedQuery);
      mrReceivedSnap.docs.forEach(d => mrBatch.delete(d.ref));
      await mrBatch.commit();

      // Delete notifications
      const notifQuery = query(collection(db, "notifications"), where("receiverId", "==", profileId));
      const notifSnap = await getDocs(notifQuery);
      const notifBatch = writeBatch(db);
      notifSnap.docs.forEach(d => notifBatch.delete(d.ref));
      await notifBatch.commit();

      // Delete support tickets
      const ticketQuery = query(collection(db, "supportTickets"), where("uid", "==", uid));
      const ticketSnap = await getDocs(ticketQuery);
      const ticketBatch = writeBatch(db);
      ticketSnap.docs.forEach(d => ticketBatch.delete(d.ref));
      await ticketBatch.commit();

      // Delete subscription records
      const subQuery = query(collection(db, "subscriptions"), where("uid", "==", uid));
      const subSnap = await getDocs(subQuery);
      const subBatch = writeBatch(db);
      subSnap.docs.forEach(d => subBatch.delete(d.ref));
      await subBatch.commit();

      // Delete success stories
      const storyQuery = query(collection(db, "successStories"), where("uid", "==", uid));
      const storySnap = await getDocs(storyQuery);
      const storyBatch = writeBatch(db);
      storySnap.docs.forEach(d => storyBatch.delete(d.ref));
      await storyBatch.commit();

      // Try to delete Firebase Auth user (requires callable cloud function)
      try {
        const functions = await import("firebase/functions");
        const { getFunctions, httpsCallable } = functions;
        const deleteAuthUser = httpsCallable(getFunctions(), "deleteAuthUser");
        await deleteAuthUser({ uid });
      } catch (authErr) {
        // Cloud function not deployed; auth record remains
      }

      toast.success(`User "${profile.name || profileId}" deleted successfully. Auth record deletion requires deploying the deleteAuthUser cloud function.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setDeletingMembers(false);
      setConfirmDeleteMember(null);
      setSelectedMemberIds(new Set());
      setSelectAll(false);
    }
  };

  const handleBulkDelete = async (ids?: Set<string>) => {
    const targetIds = ids || selectedMemberIds;
    if (targetIds.size === 0) return;
    setDeletingMembers(true);
    const profilesToDelete = onlineMembers.filter((m: any) => targetIds.has(m.id));
    let successCount = 0;
    let failCount = 0;
    for (const profile of profilesToDelete) {
      try {
        await deleteDoc(doc(db, "profiles", profile.id)).catch(() => {});

        const uid = profile.uid;
        const convQuery = query(collection(db, "conversations"), where("participants", "array-contains", profile.id));
        const convSnap = await getDocs(convQuery);
        const batch = writeBatch(db);
        for (const convDoc of convSnap.docs) {
          const msgSnap = await getDocs(collection(db, "conversations", convDoc.id, "messages"));
          msgSnap.docs.forEach(m => batch.delete(m.ref));
          batch.delete(convDoc.ref);
        }
        await batch.commit();

        const interestQ1 = query(collection(db, "interests"), where("senderId", "==", profile.id));
        const interestQ2 = query(collection(db, "interests"), where("receiverId", "==", profile.id));
        const [i1, i2] = await Promise.all([getDocs(interestQ1), getDocs(interestQ2)]);
        const ib = writeBatch(db);
        i1.docs.forEach(d => ib.delete(d.ref));
        i2.docs.forEach(d => ib.delete(d.ref));
        await ib.commit();

        const mrQ1 = query(collection(db, "marriageRequests"), where("senderId", "==", profile.id));
        const mrQ2 = query(collection(db, "marriageRequests"), where("receiverId", "==", profile.id));
        const [m1, m2] = await Promise.all([getDocs(mrQ1), getDocs(mrQ2)]);
        const mb = writeBatch(db);
        m1.docs.forEach(d => mb.delete(d.ref));
        m2.docs.forEach(d => mb.delete(d.ref));
        await mb.commit();

        const nq = query(collection(db, "notifications"), where("receiverId", "==", profile.id));
        const ns = await getDocs(nq);
        const nb = writeBatch(db);
        ns.docs.forEach(d => nb.delete(d.ref));
        await nb.commit();

        if (uid) {
          const tq = query(collection(db, "supportTickets"), where("uid", "==", uid));
          const ts = await getDocs(tq);
          const tb = writeBatch(db);
          ts.docs.forEach(d => tb.delete(d.ref));
          await tb.commit();

          const sq = query(collection(db, "subscriptions"), where("uid", "==", uid));
          const ss = await getDocs(sq);
          const sb = writeBatch(db);
          ss.docs.forEach(d => sb.delete(d.ref));
          await sb.commit();

          const stq = query(collection(db, "successStories"), where("uid", "==", uid));
          const sts = await getDocs(stq);
          const stb = writeBatch(db);
          sts.docs.forEach(d => stb.delete(d.ref));
          await stb.commit();

          try {
            const functions = await import("firebase/functions");
            const { getFunctions, httpsCallable } = functions;
            const deleteAuthUser = httpsCallable(getFunctions(), "deleteAuthUser");
            await deleteAuthUser({ uid: profile.uid });
          } catch {}
        }
        successCount++;
      } catch {
        failCount++;
      }
    }
    toast.success(`${successCount} user(s) deleted.${failCount > 0 ? ` ${failCount} failed.` : ""} Auth deletion requires deploying deleteAuthUser cloud function.`);
    setDeletingMembers(false);
    setSelectedMemberIds(new Set());
    setSelectAll(false);
  };

  // Filtered lists
  const filteredKyc = kycProfiles.filter(p => 
    (p.name || "").toLowerCase().includes(searchKyc.toLowerCase()) || 
    (p.city || "").toLowerCase().includes(searchKyc.toLowerCase())
  );

  const filteredOnline = onlineMembers.filter(p => {
    const matchesQuery = (p.name || "").toLowerCase().includes(searchOnline.toLowerCase()) || 
                         (p.city || "").toLowerCase().includes(searchOnline.toLowerCase()) ||
                         (p.subCaste || "").toLowerCase().includes(searchOnline.toLowerCase());
    const memberStatus = p.isOnline ? "Active" : "Offline";
    const matchesStatus = statusFilter === "All" ? true : memberStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const filteredSubs = memberSubscriptions.filter(s => {
    const matchesQuery = (s.name || "").toLowerCase().includes(searchSub.toLowerCase()) ||
                         (s.email || "").toLowerCase().includes(searchSub.toLowerCase()) ||
                         (s.plan || "").toLowerCase().includes(searchSub.toLowerCase());
    const matchesPackage = packageFilter === "All" ? true : s.plan === packageFilter;
    return matchesQuery && matchesPackage;
  });

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "members", name: "Members", icon: Users, badge: onlineMembers.length },
    { id: "kyc", name: "KYC Verification", icon: FileCheck2, badge: kycProfiles.length },
    ...(adminRole === "super_admin" ? [{ id: "subscriptions", name: "Manage Subscriptions", icon: CreditCard }] : []),
    { id: "help", name: "Support", icon: HelpCircle, badge: tickets.filter(t => t.status === "Open").length },
    { id: "settings", name: "Settings", icon: Settings }
  ];

  const totalRevenue = memberSubscriptions.reduce((acc, sub) => {
    let amt = Number(sub.amount) || 0;
    if (amt === 0 && sub.plan) {
      if (sub.plan.includes("Platinum")) amt = sub.billing === "Yearly" ? 576 : 60;
      else if (sub.plan.includes("Gold")) amt = sub.billing === "Yearly" ? 432 : 45;
      else if (sub.plan.includes("Silver")) amt = sub.billing === "Yearly" ? 288 : 30;
    }
    return acc + amt;
  }, 0);
  const unverifiedAndNew = [...onlineMembers].filter(p => !p.isVerified).filter(p => {
    const hasDocs = p.kycDocuments && (p.kycDocuments.front || p.kycDocuments.back);
    if (filterUnverified === "Pending KYC") return hasDocs;
    if (filterUnverified === "Not Sent") return !hasDocs;
    return true;
  }).sort((a, b) => {
    const dateA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
    const dateB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
    return dateB - dateA;
  });

  const totalUnverified = unverifiedAndNew.length;
  const unverifiedTotalPages = Math.ceil(totalUnverified / unverifiedRowsPerPage) || 1;
  const paginatedUnverified = unverifiedAndNew.slice((unverifiedPage - 1) * unverifiedRowsPerPage, unverifiedPage * unverifiedRowsPerPage);

  const totalOnline = filteredOnline.length;
  const onlineTotalPages = Math.ceil(totalOnline / onlineRowsPerPage) || 1;
  const paginatedOnline = filteredOnline.slice((onlinePage - 1) * onlineRowsPerPage, onlinePage * onlineRowsPerPage);

  const verifiedCount = onlineMembers.filter(m => m.isVerified).length;

  // Member list filtering
  const filteredMembers = onlineMembers.filter(p =>
    (p.name || "").toLowerCase().includes(searchMembers.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(searchMembers.toLowerCase()) ||
    (p.city || "").toLowerCase().includes(searchMembers.toLowerCase())
  );
  const membersTotalPages = Math.ceil(filteredMembers.length / membersRowsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice((membersPage - 1) * membersRowsPerPage, membersPage * membersRowsPerPage);

  // Reset selection when search/filter changes
  useEffect(() => {
    setSelectedMemberIds(new Set());
    setSelectAll(false);
    setMembersPage(1);
  }, [searchMembers]);

  useEffect(() => {
    setDashboardSelectedIds(new Set());
    setDashboardSelectAll(false);
  }, [searchOnline, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6">
          <div className="glass-panel border border-slate-200/40 dark:border-dark-800/50 rounded-3xl p-5 space-y-4 bg-white/70">
            <div className="flex items-center gap-2 border-b border-slate-200/30 pb-3">
              <ShieldCheck className="h-5 w-5 text-maroon-700 dark:text-gold-450" />
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                Admin Panel Menu
              </h3>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeTab === item.id
                        ? "bg-maroon-700 text-white shadow-md shadow-maroon-500/10"
                        : "text-slate-650 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-dark-850/50 hover:text-maroon-700 dark:hover:text-gold-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                        activeTab === item.id 
                          ? "bg-white/20 text-white" 
                          : "bg-slate-100 dark:bg-dark-800 text-slate-500"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-55 glass-panel p-6 space-y-6 shadow-2xl bg-white dark:bg-dark-900 border-r border-slate-200/50 dark:border-dark-800/50"
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-maroon-700 dark:text-gold-450" />
                  <span>Admin Menu</span>
                </h3>
                <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold ${
                        activeTab === item.id
                          ? "bg-maroon-700 text-white"
                          : "text-slate-655 dark:text-slate-350"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4.5 w-4.5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          

          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-850 rounded-3xl p-6 shadow-sm min-h-[400px]">
            
            {/* TAB: Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                  <div className="bg-slate-50 dark:bg-dark-950 border border-slate-150/80 dark:border-dark-850 rounded-2xl p-4 flex items-center gap-3 shadow-md dark:shadow-dark-900/50">
                    <div className="h-10 w-10 rounded-xl bg-maroon-700/10 text-maroon-700 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Members</span>
                      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">{onlineMembers.length}</h3>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-dark-950 border border-slate-150/80 dark:border-dark-850 rounded-2xl p-4 flex items-center gap-3 shadow-md dark:shadow-dark-900/50">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Verified</span>
                      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">{verifiedCount}</h3>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-dark-950 border border-slate-150/80 dark:border-dark-850 rounded-2xl p-4 flex items-center gap-3 shadow-md dark:shadow-dark-900/50">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Subscriptions</span>
                      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">{memberSubscriptions.length}</h3>
                    </div>
                  </div>

                  {adminRole === "super_admin" && (
                    <div className="bg-slate-50 dark:bg-dark-950 border border-slate-150/80 dark:border-dark-850 rounded-2xl p-4 flex items-center gap-3 shadow-md dark:shadow-dark-900/50">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Revenue</span>
                        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">₹{totalRevenue}</h3>
                      </div>
                    </div>
                  )}

                  <div 
                    onClick={() => setTab("kyc")}
                    className="bg-slate-50 dark:bg-dark-950 border border-slate-150/80 dark:border-dark-850 rounded-2xl p-4 flex items-center gap-3 shadow-md dark:shadow-dark-900/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Pending KYC</span>
                      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">{kycProfiles.length}</h3>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Unverified & Recently Registered Profiles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Unverified / New Users</h3>
                      <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <select
                          value={filterUnverified}
                          onChange={(e) => { setFilterUnverified(e.target.value); setUnverifiedPage(1); }}
                          className="pl-8 pr-6 py-1.5 border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-950 text-[10px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                        >
                          <option value="All">All</option>
                          <option value="Pending KYC">Pending KYC</option>
                          <option value="Not Sent">Not Sent</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-950 flex flex-col">
                      <div className="overflow-y-auto h-[400px]">
                        <table className="w-full text-left text-xs font-semibold">
                          <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-dark-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-dark-800">
                            <tr className="text-[9px] text-slate-400 uppercase tracking-wider">
                              <th className="py-2 px-3">User</th>
                              <th className="py-2 px-3">KYC Document</th>
                              <th className="py-2 px-3 text-left">Verification Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
                            {paginatedUnverified.length > 0 ? paginatedUnverified.map(p => {
                              const hasDocs = p.kycDocuments && (p.kycDocuments.front || p.kycDocuments.back);
                              return (
                                <tr 
                                  key={p.id} 
                                  onClick={() => {
                                    setTab("kyc");
                                    setSelectedKyc(p);
                                  }}
                                  className="hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors cursor-pointer"
                                >
                                  <td className="py-2 px-3 flex items-center gap-2">
                                    <img src={p.photos?.[0] || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"} alt={p.name} className="h-6 w-6 rounded-md object-cover border" />
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-white block text-[10px]">{p.name || "Unknown"}</span>
                                      <span className="text-[8px] text-slate-450 font-normal">{p.registeredAt || "Recent"}</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    {hasDocs ? (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">Sent</span>
                                    ) : (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 dark:bg-dark-800 dark:text-slate-400">Not Sent</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-left">
                                    {p.isVerified ? (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</span>
                                    ) : hasDocs ? (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">Pending KYC</span>
                                    ) : (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Unverified</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan={3} className="py-6 text-center text-xs text-slate-500 italic">No unverified or new registrations.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination UI */}
                      <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Rows per page:</span>
                          <select 
                            value={unverifiedRowsPerPage} 
                            onChange={(e) => { setUnverifiedRowsPerPage(Number(e.target.value)); setUnverifiedPage(1); }}
                            className="text-[10px] border border-slate-200 dark:border-dark-800 rounded px-1 py-0.5 bg-white dark:bg-dark-900 focus:outline-none cursor-pointer"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500">{unverifiedPage} of {unverifiedTotalPages}</span>
                          <div className="flex gap-1">
                            <button 
                              disabled={unverifiedPage === 1} 
                              onClick={() => setUnverifiedPage(p => p - 1)}
                              className="p-1 border border-slate-200 dark:border-dark-800 rounded hover:bg-slate-100 dark:hover:bg-dark-900 disabled:opacity-50 cursor-pointer"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button 
                              disabled={unverifiedPage === unverifiedTotalPages} 
                              onClick={() => setUnverifiedPage(p => p + 1)}
                              className="p-1 border border-slate-200 dark:border-dark-800 rounded hover:bg-slate-100 dark:hover:bg-dark-900 disabled:opacity-50 cursor-pointer"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Online Directory */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Online Directory</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search..."
                            value={searchOnline}
                            onChange={(e) => setSearchOnline(e.target.value)}
                            className="w-full text-[10px] pl-8 pr-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-950 focus:outline-none"
                          />
                        </div>
                        <div className="relative">
                          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setOnlinePage(1); }}
                            className="pl-8 pr-6 py-1.5 border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-950 text-[10px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                          >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </div>
                        {dashboardSelectedIds.size > 0 && (
                          <button
                            onClick={() => {
                              const items = paginatedOnline.filter((m: any) => dashboardSelectedIds.has(m.id));
                              setConfirmDeleteMember({ bulk: true, count: dashboardSelectedIds.size, ids: dashboardSelectedIds });
                            }}
                            disabled={deletingMembers}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete ({dashboardSelectedIds.size})
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-950 flex flex-col">
                      <div className="overflow-y-auto h-[400px]">
                        <table className="w-full text-left text-xs font-semibold">
                          <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-dark-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-dark-800">
                            <tr className="text-[9px] text-slate-400 uppercase tracking-wider">
                              <th className="py-2 px-3 w-8">
                                <input
                                  type="checkbox"
                                  checked={dashboardSelectAll && paginatedOnline.length > 0}
                                  onChange={() => {
                                    if (dashboardSelectAll) {
                                      setDashboardSelectedIds(new Set());
                                      setDashboardSelectAll(false);
                                    } else {
                                      setDashboardSelectedIds(new Set(paginatedOnline.map((m: any) => m.id)));
                                      setDashboardSelectAll(true);
                                    }
                                  }}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-maroon-700 focus:ring-maroon-700 cursor-pointer"
                                />
                              </th>
                              <th className="py-2 px-3">Member Info</th>
                              {adminRole === "super_admin" && <th className="py-2 px-3 text-center">Role</th>}
                              <th className="py-2 px-3 text-center">Status</th>
                              <th className="py-2 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
                            {paginatedOnline.map(member => (
                              <tr key={member.id} className="hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors">
                                <td className="py-2 px-3">
                                  <input
                                    type="checkbox"
                                    checked={dashboardSelectedIds.has(member.id)}
                                    onChange={() => {
                                      const next = new Set(dashboardSelectedIds);
                                      if (next.has(member.id)) next.delete(member.id);
                                      else next.add(member.id);
                                      setDashboardSelectedIds(next);
                                      setDashboardSelectAll(next.size === paginatedOnline.length);
                                    }}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-maroon-700 focus:ring-maroon-700 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2 px-3 flex items-center gap-2">
                                  <img src={member.photos?.[0] || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"} alt={member.name} className="h-6 w-6 rounded-md object-cover border" />
                                  <div>
                                    <span className="font-bold text-slate-900 dark:text-white block text-[10px]">{member.name}</span>
                                    <span className="text-[8px] text-slate-450 font-normal">{member.subCaste}</span>
                                  </div>
                                </td>
                                {adminRole === "super_admin" && (
                                  <td className="py-2 px-3 text-center">
                                    <select 
                                      value={member.role || "user"} 
                                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                      className="text-[9px] font-bold px-2 py-1 rounded bg-slate-200 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-dark-700 cursor-pointer focus:outline-none"
                                    >
                                      <option value="user">User</option>
                                      <option value="admin">Admin</option>
                                      <option value="super_admin">Super Admin</option>
                                    </select>
                                  </td>
                                )}
                                <td className="py-2 px-3 text-center">
                                  <span className={`inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                    member.isOnline
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
                                      : "bg-slate-200 text-slate-500 dark:bg-dark-800 dark:text-slate-400"
                                  }`}>
                                    <span className={`h-1 w-1 rounded-full ${
                                      member.isOnline ? "bg-emerald-500" : "bg-slate-400"
                                    }`} />
                                    {member.isOnline ? "Active" : "Offline"}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    onClick={() => setConfirmDeleteMember(member)}
                                    disabled={deletingMembers}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-50 text-[8px] font-bold"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" /> Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {paginatedOnline.length === 0 && (
                              <tr>
                                <td colSpan={adminRole === "super_admin" ? 6 : 5} className="py-6 text-center text-[10px] text-slate-500 italic">No members found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination UI */}
                      <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Rows per page:</span>
                          <select 
                            value={onlineRowsPerPage} 
                            onChange={(e) => { setOnlineRowsPerPage(Number(e.target.value)); setOnlinePage(1); }}
                            className="text-[10px] border border-slate-200 dark:border-dark-800 rounded px-1 py-0.5 bg-white dark:bg-dark-900 focus:outline-none cursor-pointer"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500">{onlinePage} of {onlineTotalPages}</span>
                          <div className="flex gap-1">
                            <button 
                              disabled={onlinePage === 1} 
                              onClick={() => setOnlinePage(p => p - 1)}
                              className="p-1 border border-slate-200 dark:border-dark-800 rounded hover:bg-slate-100 dark:hover:bg-dark-900 disabled:opacity-50 cursor-pointer"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button 
                              disabled={onlinePage === onlineTotalPages} 
                              onClick={() => setOnlinePage(p => p + 1)}
                              className="p-1 border border-slate-200 dark:border-dark-800 rounded hover:bg-slate-100 dark:hover:bg-dark-900 disabled:opacity-50 cursor-pointer"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KYC Verification */}
            {activeTab === "kyc" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">KYC Verification Audit</h2>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Audit identity documentation cards</p>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search name or city..."
                      value={searchKyc}
                      onChange={(e) => setSearchKyc(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {filteredKyc.length > 0 ? (
                  <div className="space-y-4">
                    {filteredKyc.map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedKyc(p)}
                        className="border border-slate-100 dark:border-dark-800 rounded-2xl p-4 hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-all flex items-center gap-5 justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <img src={p.photos?.[0] || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"} alt={p.name} className="h-14 w-14 rounded-xl object-cover border border-slate-100" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {p.name} <span className="text-[10px] font-normal text-slate-400">{p.gender} • {p.dob}</span>
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold">{p.subCaste} • {p.city}</p>
                            <p className="text-[10px] text-slate-450 mt-1 font-mono font-medium">Aadhaar Card: {p.aadhaarNumber}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">All caught up! No KYC document submissions waiting.</p>
                  </div>
                )}
                
                {/* KYC Modal */}
                <AnimatePresence>
                  {selectedKyc && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
                      >
                        <div className="flex justify-between items-center border-b pb-3">
                          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Verify KYC Document</h3>
                          <button onClick={() => setSelectedKyc(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <img src={selectedKyc.photos?.[0] || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"} alt={selectedKyc.name} className="h-16 w-16 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedKyc.name}</p>
                              <p className="text-xs text-slate-500">Aadhaar: <span className="font-mono">{selectedKyc.aadhaarNumber}</span></p>
                              <p className="text-xs text-slate-500">Registered: {selectedKyc.registeredAt}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-dark-950 p-4 rounded-xl border border-slate-200 dark:border-dark-800">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Submitted Documents</p>
                            {(selectedKyc.kycDocuments?.front || selectedKyc.kycDocuments?.back) ? (
                              <div className="flex gap-4 overflow-x-auto pb-2">
                                {selectedKyc.kycDocuments.front && (
                                  <div className="flex-shrink-0 cursor-pointer" onClick={() => setActiveZoomImage(selectedKyc.kycDocuments.front)}>
                                    <p className="text-[10px] text-slate-500 mb-1">Front Side</p>
                                    <img src={selectedKyc.kycDocuments.front} alt="KYC Front" className="h-32 w-48 object-cover rounded-lg border border-slate-200 dark:border-dark-700 hover:opacity-80 transition-opacity shadow-sm" />
                                  </div>
                                )}
                                {selectedKyc.kycDocuments.back && (
                                  <div className="flex-shrink-0 cursor-pointer" onClick={() => setActiveZoomImage(selectedKyc.kycDocuments.back)}>
                                    <p className="text-[10px] text-slate-500 mb-1">Back Side</p>
                                    <img src={selectedKyc.kycDocuments.back} alt="KYC Back" className="h-32 w-48 object-cover rounded-lg border border-slate-200 dark:border-dark-700 hover:opacity-80 transition-opacity shadow-sm" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-40 w-full bg-slate-200 dark:bg-dark-800 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-xs italic">No documents uploaded.</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-3 border-t">
                          <button onClick={() => handleApproveKYC(selectedKyc.id)} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:scale-[1.02] transition-transform cursor-pointer">Approve</button>
                          <button onClick={() => handleRejectKYC(selectedKyc.id)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:scale-[1.02] transition-transform cursor-pointer">Reject</button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Zoom Modal */}
                <AnimatePresence>
                  {activeZoomImage && (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
                      <button 
                        onClick={() => setActiveZoomImage(null)} 
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                      <motion.img 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        src={activeZoomImage} 
                        alt="Zoomed KYC Document" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg" 
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* TAB: Manage Subscriptions */}
            {activeTab === "subscriptions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 border-b pb-4">
                  <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Subscriptions</h2>
                  
                  <div className="flex items-center gap-3 w-full max-w-md">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchSub}
                        onChange={(e) => setSearchSub(e.target.value)}
                        className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <select
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                      className="text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Packages</option>
                      <option value="Free Tier">Free Tier</option>
                      <option value="Silver Package">Silver Package</option>
                      <option value="Gold Package">Gold Package</option>
                      <option value="Platinum Package">Platinum Package</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b text-[10px] text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Plan Tier</th>
                        <th className="py-3 px-4">Billing</th>
                        <th className="py-3 px-4">Expiry Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
                      {filteredSubs.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{sub.name}</td>
                          <td className="py-3 px-4 text-slate-655 dark:text-slate-350">{sub.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                              sub.plan?.includes("Platinum")
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                                : sub.plan?.includes("Gold")
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                  : sub.plan?.includes("Silver")
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                    : "bg-slate-100 text-slate-505 dark:bg-dark-800 dark:text-slate-400"
                            }`}>
                              {sub.plan}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-750 dark:text-slate-350">{sub.billing}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{sub.expiry}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setEditingSub(sub)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-maroon-700 dark:hover:text-gold-400 transition-colors cursor-pointer"
                            >
                              <Edit className="h-3 w-3" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredSubs.length === 0 && (
                    <p className="text-center py-10 text-slate-400 text-xs italic font-normal">No subscriptions match search query.</p>
                  )}
                </div>

                <AnimatePresence>
                  {editingSub && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
                      >
                        <div className="flex justify-between items-center border-b pb-3">
                          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Modify Subscription</h3>
                          <button onClick={() => setEditingSub(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveSubscription} className="space-y-4 text-xs font-semibold">
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">User</span>
                            <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{editingSub.name} ({editingSub.email})</p>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-450 uppercase">Subscription Plan Tier</label>
                            <select
                              value={editingSub.plan}
                              onChange={(e) => setEditingSub({ ...editingSub, plan: e.target.value })}
                              className="w-full border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-1 focus:ring-maroon-700"
                            >
                              <option value="Free Tier">Free Tier</option>
                              <option value="Silver Package">Silver Package</option>
                              <option value="Gold Package">Gold Package</option>
                              <option value="Platinum Package">Platinum Package</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-455 uppercase">Billing Duration</label>
                            <select
                              value={editingSub.billing}
                              onChange={(e) => setEditingSub({ ...editingSub, billing: e.target.value })}
                              className="w-full border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-1 focus:ring-maroon-700"
                            >
                              <option value="None">None</option>
                              <option value="Monthly">Monthly</option>
                              <option value="Yearly">Yearly</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-450 uppercase">Expiration Date</label>
                            <input
                              type="text"
                              value={editingSub.expiry}
                              onChange={(e) => setEditingSub({ ...editingSub, expiry: e.target.value })}
                              className="w-full border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-maroon-700"
                            />
                          </div>
                          <div className="flex gap-3 pt-3 border-t">
                            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white font-bold text-xs shadow hover:scale-[1.02] transition-transform cursor-pointer">Save</button>
                            <button type="button" onClick={() => setEditingSub(null)} className="px-4 py-2.5 rounded-xl border text-slate-655 font-bold hover:bg-slate-55 transition-colors">Cancel</button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* TAB: Support Tickets */}
            {activeTab === "help" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Support Tickets</h2>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {tickets.filter(t => t.status === "Open").length} Open Tickets
                    </span>
                  </div>
                </div>

                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => setSelectedTicket(t)}
                        className="border border-slate-100 dark:border-dark-800 rounded-2xl p-5 hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-all flex flex-col md:flex-row items-start md:items-center gap-5 justify-between cursor-pointer"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">{t.id}</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.name} ({t.email})</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              t.status === "Open" ? "bg-amber-100 text-amber-700" : 
                              t.status === "Closed" ? "bg-slate-200 text-slate-600" :
                              t.status === "Rejected" ? "bg-red-100 text-red-600" :
                              "bg-emerald-100 text-emerald-600"
                            }`}>{t.status}</span>
                          </div>
                          <p className="text-[10px] text-maroon-700 dark:text-gold-450 font-bold uppercase tracking-wider">{t.category}</p>
                          <p className="text-xs text-slate-655 dark:text-slate-350 italic font-semibold">"{t.desc}"</p>
                          <span className="text-[9px] text-slate-400 block">Submitted on {t.date}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-slate-400 text-xs italic">No support tickets found.</p>
                )}

                <AnimatePresence>
                  {selectedTicket && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
                      >
                        <div className="flex justify-between items-center border-b pb-3">
                          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Respond to Ticket</h3>
                          <button onClick={() => setSelectedTicket(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <form onSubmit={handleTicketUpdate} className="space-y-4 text-xs font-semibold">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-450 uppercase">Update Status</label>
                            <select
                              value={selectedTicket.status}
                              onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                              className="w-full border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-1 focus:ring-maroon-700"
                            >
                              <option value="Open">Open (Ask user to Re-open)</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-450 uppercase">Admin Message</label>
                            <textarea
                              value={selectedTicket.adminReply || ""}
                              onChange={(e) => setSelectedTicket({ ...selectedTicket, adminReply: e.target.value })}
                              rows={4}
                              placeholder="Type your response here..."
                              className="w-full border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-1 focus:ring-maroon-700"
                            />
                          </div>
                          <div className="flex gap-3 pt-3 border-t">
                            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 text-white font-bold text-xs shadow hover:scale-[1.02] transition-transform cursor-pointer">Submit Response</button>
                            <button type="button" onClick={() => setSelectedTicket(null)} className="px-4 py-2.5 rounded-xl border text-slate-655 font-bold hover:bg-slate-55 transition-colors">Cancel</button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            )}

            {/* TAB: Members */}
            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">All Members</h2>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{onlineMembers.length} total members</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative max-w-xs w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search name, email or city..."
                        value={searchMembers}
                        onChange={(e) => setSearchMembers(e.target.value)}
                        className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    {selectedMemberIds.size > 0 && (
                      <button
                        onClick={() => setConfirmDeleteMember({ bulk: true, count: selectedMemberIds.size })}
                        disabled={deletingMembers}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete ({selectedMemberIds.size})
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-950 flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="bg-slate-100/90 dark:bg-dark-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-dark-800">
                        <tr className="text-[9px] text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={() => {
                                if (selectAll) {
                                  setSelectedMemberIds(new Set());
                                  setSelectAll(false);
                                } else {
                                  const ids = new Set(filteredMembers.map((m: any) => m.id));
                                  setSelectedMemberIds(ids);
                                  setSelectAll(true);
                                }
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-maroon-700 focus:ring-maroon-700 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4">Member</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4 text-center">Profile Status</th>
                          <th className="py-3 px-4 text-center">Verification</th>
                          {adminRole === "super_admin" && <th className="py-3 px-4 text-center">Role</th>}
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
                        {paginatedMembers.length > 0 ? paginatedMembers.map((member: any) => (
                          <tr key={member.id} className="hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors">
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedMemberIds.has(member.id)}
                                onChange={() => {
                                  const next = new Set(selectedMemberIds);
                                  if (next.has(member.id)) next.delete(member.id);
                                  else next.add(member.id);
                                  setSelectedMemberIds(next);
                                  setSelectAll(next.size === filteredMembers.length);
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-maroon-700 focus:ring-maroon-700 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={member.photos?.[0] || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"}
                                  alt={member.name}
                                  className="h-8 w-8 rounded-lg object-cover border border-slate-200 dark:border-dark-700"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block text-[11px]">{member.name || "Unknown"}</span>
                                  <span className="text-[9px] text-slate-450 font-normal">{member.city || ""}{member.city && member.subCaste ? " • " : ""}{member.subCaste || ""}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-350 text-[10px]">{member.email || "—"}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                member.isOnline
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
                                  : "bg-slate-200 text-slate-500 dark:bg-dark-800 dark:text-slate-400"
                              }`}>
                                <span className={`h-1 w-1 rounded-full ${
                                  member.isOnline ? "bg-emerald-500" : "bg-slate-400"
                                }`} />
                                {member.isOnline ? "Active" : "Offline"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {member.isVerified ? (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">Verified</span>
                              ) : (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Unverified</span>
                              )}
                            </td>
                            {adminRole === "super_admin" && (
                              <td className="py-3 px-4 text-center">
                                <select 
                                  value={member.role || "user"} 
                                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                  className="text-[9px] font-bold px-2 py-1 rounded bg-slate-200 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-dark-700 cursor-pointer focus:outline-none"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                  <option value="super_admin">Super Admin</option>
                                </select>
                              </td>
                            )}
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setConfirmDeleteMember(member)}
                                disabled={deletingMembers}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-50 text-[10px] font-bold"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={adminRole === "super_admin" ? 7 : 6} className="py-10 text-center text-[10px] text-slate-500 italic">No members found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Rows per page:</span>
                      <select 
                        value={membersRowsPerPage} 
                        onChange={(e) => { setMembersRowsPerPage(Number(e.target.value)); setMembersPage(1); }}
                        className="text-[10px] border border-slate-200 dark:border-dark-800 rounded px-1 py-0.5 bg-white dark:bg-dark-900 focus:outline-none cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">{membersPage} of {membersTotalPages}</span>
                      <div className="flex gap-1">
                        <button 
                          disabled={membersPage === 1} 
                          onClick={() => setMembersPage(p => p - 1)}
                          className="p-1 border border-slate-200 dark:border-dark-800 rounded hover:bg-slate-100 dark:hover:bg-dark-900 disabled:opacity-50 cursor-pointer"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <button 
                          disabled={membersPage === membersTotalPages} 
                          onClick={() => setMembersPage(p => p + 1)}
                          className="p-1 border border-slate-200 dark:border-dark-800 rounded hover:bg-slate-100 dark:hover:bg-dark-900 disabled:opacity-50 cursor-pointer"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                  {confirmDeleteMember && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
                      >
                        <div className="flex justify-between items-center border-b pb-3">
                          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                            {confirmDeleteMember.bulk ? "Delete Members" : "Delete Member"}
                          </h3>
                          <button onClick={() => setConfirmDeleteMember(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {confirmDeleteMember.bulk
                              ? `Are you sure you want to delete ${confirmDeleteMember.count} member(s)?`
                              : `Are you sure you want to delete "${confirmDeleteMember.name || confirmDeleteMember.id}"?`
                            }
                          </p>
                          <p className="text-[10px] text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                            This will permanently delete the profile, all conversations, messages, interests, marriage requests, notifications, and associated data. Auth account deletion requires the deleteAuthUser cloud function to be deployed.
                          </p>
                        </div>
                        <div className="flex gap-3 pt-3 border-t">
                          <button
                            onClick={() => {
                              if (confirmDeleteMember.bulk) {
                                handleBulkDelete(confirmDeleteMember.ids);
                              } else {
                                deleteUserCascade(confirmDeleteMember);
                              }
                            }}
                            disabled={deletingMembers}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {deletingMembers ? (
                              <>Deleting...</>
                            ) : (
                              <><Trash2 className="h-3.5 w-3.5" /> Delete</>
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteMember(null)}
                            disabled={deletingMembers}
                            className="px-4 py-2.5 rounded-xl border text-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* TAB: Settings */}
            {activeTab === "settings" && (
              <SettingsPanel
                privacySettings={privacySettings}
                language={language}
                onPrivacySettingChange={(key, value) =>
                  setPrivacySettings(prev => ({ ...prev, [key]: value }))
                }
                onSetLanguage={setLanguage}
                onLogout={handleLogout}
              />
            )}

          </div>

        </main>
      </div>
    </div>
  );
};
