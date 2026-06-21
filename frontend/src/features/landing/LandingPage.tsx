import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebase";
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

// Mock profiles for newly joined members
const NEW_MEMBERS = [
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
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
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
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
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
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
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
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
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
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Goal-oriented, family-loving girl who enjoys classical music."
  }
];

// Success stories
const SUCCESS_STORIES = [
  {
    id: 1,
    couple: "Amit & Smita",
    weddingDate: "12th Nov 2025",
    photo: "https://images.unsplash.com/photo-1621616875450-79f22448040e?w=600&h=400&fit=crop",
    story: "We found each other through Lohar Matrimony. The caste filtering and verified profile filters saved us months of searching. Truly grateful!"
  },
  {
    id: 2,
    couple: "Rahul & Sneha",
    weddingDate: "4th Jan 2026",
    photo: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=400&fit=crop",
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

  // Statistics counters animated mockup state
  const [stats, setStats] = useState({
    members: 14000,
    active: 7800,
    verified: 11000,
    success: 1500
  });

  useEffect(() => {
    // Quick count-up mockup
    const interval = setInterval(() => {
      setStats(prev => {
        const nextMembers = prev.members < 15240 ? prev.members + 120 : 15240;
        const nextActive = prev.active < 8420 ? prev.active + 60 : 8420;
        const nextVerified = prev.verified < 12100 ? prev.verified + 100 : 12100;
        const nextSuccess = prev.success < 1840 ? prev.success + 30 : 1840;
        
        if (nextMembers === 15240 && nextActive === 8420 && nextVerified === 12100 && nextSuccess === 1840) {
          clearInterval(interval);
        }
        return {
          members: nextMembers,
          active: nextActive,
          verified: nextVerified,
          success: nextSuccess
        };
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-hidden pb-16 md:pb-0">
      {/* 1. HERO SECTION WITH GLASSMORPHISM AND PARTICLE ANIMATIONS */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 md:pt-0 overflow-hidden">
        
        {/* Background Image with overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
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
              Find Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-maroon-700 to-maroon-500 dark:from-gold-400 dark:to-gold-500">
                Life Partner
              </span> Within <br />
              Lohar Community
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0">
              Welcome to the exclusive and most trusted matrimonial service for Lohar community. Connect with eligible candidates from your caste and sub-castes with complete privacy control.
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
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-white/50 dark:border-white/5 bg-slate-100 dark:bg-dark-900">
              <img 
                src="https://images.unsplash.com/photo-1621616875450-79f22448040e?w=800&fit=crop" 
                alt="Indian Bride and Groom"
                className="absolute inset-0 w-full h-full object-cover"
              />
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
      </section>

      {/* 2. COMMUNITY STATISTICS COUTERS */}
      <section className="py-12 bg-white dark:bg-dark-900 border-y border-slate-100 dark:border-dark-800 transition-colors">
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
      </section>

      {/* 3. NEWLY JOINED MEMBERS (HORIZONTAL SWIPE LIST) */}
      <section className="py-20 bg-slate-50 dark:bg-dark-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">Fresh Profiles</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
                Newly Joined Members
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
                <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-dark-800">
                  <img 
                    src={member.photo} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
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
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 bg-white dark:bg-dark-900 border-t border-slate-100 dark:border-dark-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">Our Process</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              How Lohar Matrimony Works
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
      </section>

      {/* 5. MEMBERSHIP PLANS WITH CTAS */}
      <section id="subscriptions" className="py-24 bg-slate-50 dark:bg-dark-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">Premium Packages</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              Select Your Subscription Plan
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
      </section>

      {/* 6. SUCCESS STORIES */}
      <section id="testimonials" className="py-24 bg-white dark:bg-dark-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">Happy Couples</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              Lohar Matrimony Success Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SUCCESS_STORIES.map((story) => (
              <div 
                key={story.id}
                className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-5"
              >
                <div className="sm:col-span-2 relative h-48 sm:h-full min-h-[180px]">
                  <img 
                    src={story.photo} 
                    alt={story.couple}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
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
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-dark-950 border-t border-slate-100 dark:border-dark-800 transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest">Frequently Asked Questions</span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Have Questions? Look Here
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
      </section>
    </div>
  );
};
