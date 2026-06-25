import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database, db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { realtimeHelpers } from "../../config/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ChevronDown, 
  Users, 
  UserCheck, 
  HeartHandshake, 
  Calendar, 
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import heroBg from "../../assets/hero.png";
import { useTheme } from "../../context/ThemeContext";

// Age helper
const calculateAge = (dobString: string) => {
  if (!dobString) return 25;
  
  // Convert dob if in DD/MM/YYYY format
  let dob = dobString;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    const [d, m, y] = dob.split("/");
    dob = `${y}-${m}-${d}`;
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Mock profiles for newly joined members fallback
const MOCK_NEW_MEMBERS = [
  {
    id: 1,
    name: "Sunita Lohar",
    age: 24,
    height: "5'2\"",
    education: "B.Tech Computer Science",
    occupation: "Software Engineer",
    city: "Mumbai",
    isOnline: true,
    isVerified: true,
    isPremium: true,
    photo: "https://ui-avatars.com/api/?name=Sunita+Lohar&background=8B1A1A&color=fff&size=256",
    bio: "Looking for a partner who is progressive yet values our cultural tradition."
  },
  {
    id: 2,
    name: "Rajesh Panchal",
    age: 28,
    height: "5'10\"",
    education: "MBA",
    occupation: "Product Manager",
    city: "Pune",
    isOnline: true,
    isVerified: true,
    isPremium: true,
    photo: "https://ui-avatars.com/api/?name=Rajesh+Panchal&background=2C3E50&color=fff&size=256",
    bio: "Passionate about travel, fitness, and reading. Family-oriented mindset."
  },
  {
    id: 3,
    name: "Neha Lohar",
    age: 26,
    height: "5'4\"",
    education: "M.Sc Biotech",
    occupation: "Research Analyst",
    city: "Nashik",
    isOnline: false,
    isVerified: true,
    isPremium: false,
    photo: "https://ui-avatars.com/api/?name=Neha+Lohar&background=E74C3C&color=fff&size=256",
    bio: "Friendly, simple, and love cooking. Looking for an educated partner."
  },
  {
    id: 4,
    name: "Sanjay Lohar",
    age: 29,
    height: "5'8\"",
    education: "B.Arch",
    occupation: "Interior Designer",
    city: "Nagpur",
    isOnline: true,
    isVerified: false,
    isPremium: false,
    photo: "https://ui-avatars.com/api/?name=Sanjay+Lohar&background=16A085&color=fff&size=256",
    bio: "Creative by heart, love traveling. Looking for a soulmate."
  },
  {
    id: 5,
    name: "Pratiksha Panchal",
    age: 25,
    height: "5'3\"",
    education: "CA",
    occupation: "Chartered Accountant",
    city: "Kolhapur",
    isOnline: true,
    isVerified: true,
    isPremium: true,
    photo: "https://ui-avatars.com/api/?name=Pratiksha+Panchal&background=8E44AD&color=fff&size=256",
    bio: "Goal-oriented, family-loving girl who enjoys classical music."
  }
];

// Success stories fallback
const MOCK_SUCCESS_STORIES = [
  {
    id: 1,
    couple: "Amit & Smita",
    weddingDate: "12th Nov 2025",
    photo: "https://ui-avatars.com/api/?name=Amit+Smita&background=8B1A1A&color=fff&size=128",
    story: "We found each other through Lohar Matrimony. The caste filtering and verified profile filters saved us months of searching. Truly grateful!"
  },
  {
    id: 2,
    couple: "Rahul & Sneha",
    weddingDate: "4th Jan 2026",
    photo: "https://ui-avatars.com/api/?name=Rahul+Sneha&background=2C3E50&color=fff&size=128",
    story: "It was love at first interest request! Highly recommend subscribing to the Gold tier, which gave us direct chat features instantly."
  }
];

// Plans helper with ₹30 to ₹60 monthly subscription packages and 20% discount on yearly packages
const getPlans = (isYearly: boolean) => [
  {
    name: "Free",
    price: "₹0",
    duration: "Month",
    features: [
      "Create profile and upload photos",
      "Browse verified matches",
      "Express interest (limited)",
      "Basic search filters"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Silver",
    price: isYearly ? "₹24" : "₹30",
    duration: "Month",
    note: isYearly ? "billed ₹288 annually (save 20%)" : "billed monthly",
    features: [
      "View 50 contact details",
      "Unlimited interest expressions",
      "Send up to 10 personalized messages",
      "Standard matching priority"
    ],
    cta: "Upgrade Silver",
    popular: false
  },
  {
    name: "Gold",
    price: isYearly ? "₹36" : "₹45",
    duration: "Month",
    note: isYearly ? "billed ₹432 annually (save 20%)" : "billed monthly",
    features: [
      "View 120 contact details",
      "Unlimited direct chat requests",
      "Standout profile badge (Gold)",
      "Premium search filters",
      "Compatibility match score analyzer"
    ],
    cta: "Upgrade Gold",
    popular: true
  },
  {
    name: "Platinum",
    price: isYearly ? "₹48" : "₹60",
    duration: "Month",
    note: isYearly ? "billed ₹576 annually (save 20%)" : "billed monthly",
    features: [
      "View unlimited contact details",
      "Top placement in search results",
      "Personal relationship manager",
      "Aadhaar verification verification assistance",
      "Exclusive profile styling"
    ],
    cta: "Upgrade Platinum",
    popular: false
  }
];


// FAQ list
const FAQS = [
  {
    q: "Is my personal data and profile image safe?",
    a: "Absolutely. We offer advanced privacy settings in the User Settings panel, letting you hide your profile, restrict photo views to accepted requests only, and blur horoscopes."
  },
  {
    q: "How does the identity verification work?",
    a: "Profiles with a verified badge have uploaded identity documentation (like Aadhaar card) which is verified by our admin board within 24 hours of registration."
  },
  {
    q: "Can I search by sub-castes within Lohar community?",
    a: "Yes, our advanced search panel lets you search by Sub-castes (e.g., Panchal, Gadi Lohar, Sangar, etc.), State, and District."
  },
  {
    q: "What is OTP Login?",
    a: "For security and simplicity, you can enter your registered mobile number and log in instantly via a one-time passcode sent directly to your phone."
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const { setTheme } = useTheme();

  // Redirect authenticated users directly to /dashboard and force light mode
  useEffect(() => {
    setTheme("light");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate, setTheme]);

  // Statistics counters and lists from Firebase
  const [stats, setStats] = useState({
    members: 0,
    active: 0,
    verified: 0,
    success: 0
  });
  const [newMembersList, setNewMembersList] = useState<any[]>([]);
  const [successStoriesList, setSuccessStoriesList] = useState<any[]>([]);

  const [uiConfig, setUiConfig] = useState<any>(null);

  const sectionVisible = (key: string): boolean => {
    return uiConfig?.sections?.[key]?.visible !== false;
  };
  const sectionTitle = (key: string, fallback: string): string => {
    return uiConfig?.sections?.[key]?.title || fallback;
  };
  const sectionSubtitle = (key: string, fallback: string): string => {
    return uiConfig?.sections?.[key]?.subtitle || fallback;
  };
  const sectionImage = (key: string, field: string): string | null => {
    return uiConfig?.sections?.[key]?.[field] || null;
  };

  useEffect(() => {
    // Real-time listener — landing page reflects admin changes instantly without refresh
    const docRef = realtimeHelpers.ref(database, "siteConfig/landingPage");
    const unsub = realtimeHelpers.onValue(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setUiConfig(snapshot.val());
      }
    }, (err) => {
      console.error("Failed to load UI config:", err);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const profiles = querySnapshot.docs.map(d => d.data());
        const totalCount = profiles.length;

        const activeCount = profiles.filter((p: any) => p.isOnline).length;
        const verifiedCount = profiles.filter((p: any) => p.isVerified).length;
        const successCount = profiles.filter((p: any) => p.isMarried).length;

        let currentMembers = 0;
        let currentActive = 0;
        let currentVerified = 0;
        let currentSuccess = 0;

        const interval = setInterval(() => {
          let done = true;
          if (currentMembers < totalCount) {
            currentMembers = Math.min(currentMembers + Math.ceil(totalCount / 20), totalCount);
            done = false;
          }
          if (currentActive < activeCount) {
            currentActive = Math.min(currentActive + Math.ceil(activeCount / 20), activeCount);
            done = false;
          }
          if (currentVerified < verifiedCount) {
            currentVerified = Math.min(currentVerified + Math.ceil(verifiedCount / 20), verifiedCount);
            done = false;
          }
          if (currentSuccess < successCount) {
            currentSuccess = Math.min(currentSuccess + Math.ceil(successCount / 20), successCount);
            done = false;
          }

          setStats({
            members: currentMembers,
            active: currentActive,
            verified: currentVerified,
            success: currentSuccess
          });

          if (done) {
            clearInterval(interval);
          }
        }, 50);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };

    const fetchNewMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        let members = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        members.sort((a: any, b: any) => {
          const dateA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
          const dateB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
          return dateB - dateA;
        });
        setNewMembersList(members.slice(0, 5));
      } catch (err) {
        console.error("Failed to load new members:", err);
      }
    };

    const fetchStories = async () => {
       try {
         const querySnapshot = await getDocs(collection(db, "successStories"));
         const stories = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
         setSuccessStoriesList(stories);
       } catch (err) {
         console.error("Failed to load success stories:", err);
       }
     };

    fetchRealData();
    fetchNewMembers();
    fetchStories();
  }, []);

  const NEW_MEMBERS = newMembersList.length > 0 ? newMembersList.map(m => ({
    id: m.id,
    name: m.name || `${m.firstName} ${m.lastName}`,
    age: m.age || (m.dob ? calculateAge(m.dob) : 25),
    height: m.height || "5'5\"",
    education: m.education || "Graduate",
    occupation: m.occupation || "Professional",
    city: m.city || "Mumbai",
    isOnline: m.isOnline || false,
    isVerified: m.isVerified || false,
    isPremium: m.isPremium || false,
    photo: m.photos?.[0] || m.photo || "",
    bio: m.bio || "Looking for a progressive partner who values tradition."
  })) : MOCK_NEW_MEMBERS;

  const SUCCESS_STORIES = successStoriesList.length > 0 ? successStoriesList.map((s, idx) => ({
    id: s.id,
    couple: s.partner1Name && s.partner2Name ? `${s.partner1Name.split(" ")[0]} & ${s.partner2Name.split(" ")[0]}` : s.couple || "Happy Couple",
    weddingDate: s.weddingDate || "TBD",
    photo: s.photo || s.partner1Photo || s.partner2Photo || "",
    story: s.story || "We found our perfect life partner on Lohar Matrimony. Truly grateful!"
  })) : MOCK_SUCCESS_STORIES;

  return (
    <div className="overflow-x-hidden pb-16 md:pb-0">
      {/* 1. HERO SECTION WITH GLASSMORPHISM AND PARTICLE ANIMATIONS */}
      {sectionVisible("hero") && <section className="relative min-h-[90vh] flex items-center justify-center pt-8 md:pt-0 overflow-hidden">
        
        {/* Background Image with overlay */}
        <div className="absolute inset-0">
          <img 
            src={sectionImage("hero", "backgroundImage") || heroBg} 
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-maroon-50/85 via-white/80 to-gold-50/75 dark:from-dark-950/90 dark:via-[#0c0c0c]/85 dark:to-maroon-950/85" />
        </div>

        {/* Animated Particles/Floating Hearts (Pure CSS background layer) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-16 h-16 bg-maroon-300 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute top-[60%] right-[15%] w-24 h-24 bg-gold-300 rounded-full blur-2xl animate-float-medium" />
          <div className="absolute bottom-[10%] left-[30%] w-20 h-20 bg-maroon-400 rounded-full blur-3xl animate-float-fast" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Elegant Devanagari Traditional Badges */}
            <div className="inline-flex flex-col items-center lg:items-start space-y-2 mb-4">
              <span className="font-devanagari text-2xl md:text-3xl text-maroon-700 dark:text-gold-400 font-extrabold tracking-wide drop-shadow-sm">
                ॥ लोहार समाज विवाह मंडळ ॥
              </span>
              <span className="font-devanagari text-sm md:text-md text-gold-600 dark:text-slate-300 font-semibold tracking-wider">
                सुसंस्कारित नात्यांची सुंदर सुरुवात
              </span>
              <span className="font-devanagari text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                विश्वास • परंपरा • नवे आयुष्य
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {sectionTitle("hero", "Find Your Perfect Life Partner Within Lohar Community")}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0">
              {sectionSubtitle("hero", "Welcome to the exclusive and most trusted matrimonial service for Lohar community. Connect with eligible candidates from your caste and sub-castes with complete privacy control.")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-maroon-700 to-maroon-600 dark:from-maroon-600 dark:to-maroon-700 text-white font-bold shadow-lg shadow-maroon-500/20 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all text-base"
              >
                Register Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl border border-maroon-700/20 hover:border-maroon-700/50 bg-white/40 dark:bg-dark-900/40 text-slate-800 dark:text-slate-200 font-bold backdrop-blur-md hover:bg-slate-50/50 transition-all text-base"
              >
                Browse Profiles
              </Link>
            </div>
          </div>

          {/* Hero Right Image Frame (Glassmorphic Mockup) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-white/50 dark:border-white/5 bg-gradient-to-br from-rose-100 via-amber-50 to-maroon-100 dark:from-dark-900 dark:via-dark-850 dark:to-maroon-950/30 flex items-center justify-center">
              {sectionImage("hero", "rightImage") ? (
                <img
                  src={sectionImage("hero", "rightImage")!}
                  alt="Wedding couple"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-40"
                />
              ) : (
                <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full opacity-80 dark:opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="mangal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#b8860b"/>
                      <stop offset="100%" stopColor="#8B1A1A"/>
                    </linearGradient>
                  </defs>
                  {/* Mandap */}
                  <path d="M100 350 L200 200 L300 350Z" fill="none" stroke="#b8860b" strokeWidth="3" opacity="0.6"/>
                  <path d="M120 370 L200 230 L280 370Z" fill="none" stroke="#b8860b" strokeWidth="2" opacity="0.4"/>
                  {/* Bride (left) */}
                  <circle cx="160" cy="220" r="28" fill="#8B1A1A" opacity="0.9"/>
                  <rect x="145" y="248" width="30" height="60" rx="5" fill="#8B1A1A" opacity="0.8"/>
                  <path d="M130 250 Q160 200 190 250" fill="none" stroke="#b8860b" strokeWidth="2" opacity="0.7"/>
                  {/* Groom (right) */}
                  <circle cx="240" cy="220" r="28" fill="#D4AF37" opacity="0.9"/>
                  <rect x="225" y="248" width="30" height="60" rx="5" fill="#D4AF37" opacity="0.8"/>
                  <path d="M220 200 L260 200 L260 210 L220 210Z" fill="#2C1810" opacity="0.8"/>
                  {/* Garland */}
                  <path d="M188 235 Q200 250 212 235" fill="none" stroke="#FF6B35" strokeWidth="3" opacity="0.8"/>
                  {/* Sacred fire */}
                  <ellipse cx="200" cy="350" rx="60" ry="15" fill="#FF4500" opacity="0.3"/>
                  <path d="M185 350 Q190 320 200 335 Q210 310 215 350Z" fill="#FF6347" opacity="0.5"/>
                  {/* Flower petals */}
                  <circle cx="140" cy="300" r="4" fill="#FF69B4" opacity="0.6"/>
                  <circle cx="260" cy="280" r="4" fill="#FF69B4" opacity="0.6"/>
                  <circle cx="170" cy="320" r="3" fill="#FFD700" opacity="0.5"/>
                  <circle cx="230" cy="310" r="3" fill="#FFD700" opacity="0.5"/>
                  <circle cx="200" cy="340" r="4" fill="#FFB6C1" opacity="0.6"/>
                </svg>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Floating overlay badge */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-2xl p-4 border border-white/20 text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gold-400 flex items-center justify-center text-slate-900 shadow">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Verified Matches</h4>
                  <p className="text-xs text-slate-200">100% Manual Profile Screening</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {sectionVisible("statistics") && <section className="py-12 bg-white dark:bg-dark-900 border-y border-slate-100 dark:border-dark-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-maroon-50 dark:bg-maroon-950/20 text-maroon-700 dark:text-gold-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                {stats.members.toLocaleString()}+
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Members</p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-gold-50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                {stats.active.toLocaleString()}+
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Active Profiles</p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                {stats.verified.toLocaleString()}+
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Verified Users</p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                {stats.success.toLocaleString()}+
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Happy Marriages</p>
            </div>

          </div>
        </div>
      </section>}

      {sectionVisible("members") && <section className="py-20 bg-slate-50 dark:bg-dark-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">{sectionSubtitle("members", "Fresh Profiles")}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
                {sectionTitle("members", "Newly Joined Members")}
              </h2>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-semibold text-maroon-700 dark:text-gold-400 hover:underline gap-1 group"
            >
              See All Profiles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Scrollable Container with horizontal swipe */}
          <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-1 no-scrollbar snap-x snap-mandatory">
            {NEW_MEMBERS.map((member) => (
              <div 
                key={member.id}
                className="w-[290px] flex-shrink-0 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all snap-start flex flex-col group relative"
              >
                {/* Photo & Badge Overlays */}
                <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-dark-800 flex items-center justify-center">
                  {member.photo ? (
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-maroon-700/10 to-maroon-600/5 dark:from-dark-800 dark:to-dark-850 flex items-center justify-center text-maroon-700 dark:text-gold-450 font-bold text-4xl">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  {/* Glass indicator overlays */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {member.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                        Verified
                      </span>
                    )}
                    {member.isPremium && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full shadow-sm">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Live Green Online Dot Indicator */}
                  {member.isOnline && (
                    <div className="absolute top-4 right-4 flex items-center justify-center">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white dark:border-dark-900"></span>
                      </span>
                    </div>
                  )}

                  {/* Demographics glass footer overlay */}
                  <div className="absolute bottom-4 left-4 right-4 glass-panel px-3 py-2 rounded-xl border border-white/20 text-slate-900 dark:text-white flex items-center justify-between text-xs font-semibold">
                    <span>{member.age} Yrs • {member.height}</span>
                    <span className="text-maroon-700 dark:text-gold-400">{member.city}</span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {member.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {member.occupation}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4 truncate font-medium">
                      {member.education}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic mb-5">
                      "{member.bio}"
                    </p>
                  </div>

                  <Link 
                    to="/login"
                    className="w-full text-center py-3 bg-slate-50 hover:bg-maroon-50 dark:bg-dark-950 dark:hover:bg-maroon-950/20 text-slate-800 dark:text-slate-200 hover:text-maroon-700 dark:hover:text-gold-400 rounded-xl text-xs font-bold border border-slate-100 dark:border-dark-800 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {sectionVisible("howItWorks") && <section className="py-24 bg-white dark:bg-dark-900 border-t border-slate-100 dark:border-dark-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">{sectionSubtitle("howItWorks", "Our Process")}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              {sectionTitle("howItWorks", "How Lohar Matrimony Works")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Six simple steps to find your life partner and start a beautiful journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            
            {[
              { step: 1, name: "Register", desc: "Create a detailed account" },
              { step: 2, name: "Complete Profile", desc: "Upload photos & KYC details" },
              { step: 3, name: "Search Matches", desc: "Filter by sub-caste & preferences" },
              { step: 4, name: "Send Interest", desc: "Express your interest" },
              { step: 5, name: "Chat Real-time", desc: "Chat and talk with security" },
              { step: 6, name: "Get Married", desc: "Tie the knot and live happily" }
            ].map((item, index) => (
              <div key={item.step} className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-100 dark:border-dark-850 text-center relative group hover:border-maroon-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-maroon-700 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-md">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>}

      {sectionVisible("pricing") && <section id="subscriptions" className="py-24 bg-slate-50 dark:bg-dark-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">{sectionSubtitle("pricing", "Premium Packages")}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              {sectionTitle("pricing", "Select Your Subscription Plan")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Upgrade your profile to contact matches directly and stand out from the crowd
            </p>
            
            {/* Monthly/Yearly subscription toggle switch */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs font-bold ${!isYearly ? "text-maroon-700 dark:text-gold-400" : "text-slate-500 dark:text-slate-450"}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-12 h-6 bg-slate-200 dark:bg-dark-800 rounded-full transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle billing duration"
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-maroon-700 dark:bg-gold-500 transition-transform duration-200 ${
                    isYearly ? "translate-x-6" : ""
                  }`}
                />
              </button>
              <span className={`text-xs font-bold ${isYearly ? "text-maroon-700 dark:text-gold-400" : "text-slate-500 dark:text-slate-450"}`}>
                Yearly <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1 bg-emerald-500/10 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {getPlans(isYearly).map((plan) => (
              <div 
                key={plan.name}
                className={`bg-white dark:bg-dark-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all ${
                  plan.popular 
                    ? "border-maroon-600 dark:border-gold-500 ring-2 ring-maroon-600/10 dark:ring-gold-500/10 scale-[1.02] md:scale-[1.04]" 
                    : "border-slate-100 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700"
                }`}
              >
                {/* Popular ribbon */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-maroon-700 dark:bg-gold-500 text-white dark:text-slate-950 text-[10px] font-bold py-1 px-4 rounded-bl-xl uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                      {plan.duration && (
                        <span className="text-xs text-slate-500 ml-2">/ {plan.duration}</span>
                      )}
                    </div>
                    {plan.note && (
                      <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-1 font-semibold italic">{plan.note}</p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-dark-800 pt-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => navigate("/register")}
                  className={`w-full py-3.5 mt-8 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                    plan.popular
                      ? "bg-maroon-700 text-white shadow-lg shadow-maroon-600/10 hover:bg-maroon-800"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-dark-800"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {sectionVisible("successStories") && <section id="testimonials" className="py-24 bg-white dark:bg-dark-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">{sectionSubtitle("successStories", "Happy Couples")}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              {sectionTitle("successStories", "Lohar Matrimony Success Stories")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SUCCESS_STORIES.map((story) => (
              <div 
                key={story.id}
                className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-5"
              >
                <div className="sm:col-span-2 relative h-48 sm:h-full min-h-[180px] flex items-center justify-center bg-slate-100 dark:bg-dark-850">
                  {story.photo ? (
                    <img 
                      src={story.photo} 
                      alt={story.couple}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-amber-100 dark:from-maroon-900/20 dark:to-gold-950/10 flex items-center justify-center text-maroon-700 dark:text-gold-450 text-4xl">
                      💝
                    </div>
                  )}
                </div>
                <div className="p-6 sm:col-span-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <HeartHandshake className="h-4 w-4 text-maroon-700 dark:text-gold-400" />
                      <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{story.couple}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Married on {story.weddingDate}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-350 italic mt-3 line-clamp-4 leading-relaxed">
                      "{story.story}"
                    </p>
                  </div>
                  <span className="text-[10px] text-maroon-700 dark:text-gold-400 font-bold uppercase tracking-wider mt-4">
                    Verified Story
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {sectionVisible("faq") && <section className="py-24 bg-slate-50 dark:bg-dark-950 border-t border-slate-100 dark:border-dark-800 transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">{sectionSubtitle("faq", "Frequently Asked Questions")}</span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {sectionTitle("faq", "Have Questions? Look Here")}
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-semibold text-slate-900 dark:text-white transition-colors hover:text-maroon-700 dark:hover:text-gold-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === idx ? "transform rotate-180 text-maroon-700 dark:text-gold-400" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-50 dark:border-dark-850 bg-slate-50/50 dark:bg-dark-900/50"
                    >
                      <p className="px-6 py-5 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>}
    </div>
  );
};
