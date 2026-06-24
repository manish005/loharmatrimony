import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { realtimeHelpers } from "../../config/firebase";
import { auth, database } from "../../config/firebase";
import { Sun, Moon, Menu, Bell, Check, X, LogOut, User, Settings, Globe } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import Logo from "../ui/Logo";

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notiOpen, setNotiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");

  useEffect(() => {
    let unsubNotis: () => void;
    let unsubProfile: () => void;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profilesRef = realtimeHelpers.ref(database, "profiles");
          unsubProfile = realtimeHelpers.onValue(profilesRef, (snapshot) => {
            let profileId = "";
            const data = snapshot.val();
            if (data) {
              const profiles = Object.values(data);
              const userProfile = profiles.find((p: any) => p.email?.toLowerCase() === user.email?.toLowerCase());
              if (userProfile) {
                profileId = Object.keys(data).find(k => data[k] === userProfile) || "";
              }
            }

            const targetReceiverId = profileId || user.uid;
            if (unsubNotis) unsubNotis();

            const notificationsRef = realtimeHelpers.ref(database, `notifications/${targetReceiverId}`);
            unsubNotis = realtimeHelpers.onValue(notificationsRef, (snapshot) => {
                const data = snapshot.val();
                const list = data ? Object.values(data) : [];
              list.sort((a: any, b: any) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
                return dateB.getTime() - dateA.getTime();
              });
              setNotifications(list);
            }, (err) => {
              console.error("Error in notifications snapshot listener:", err);
            });
          }, (err) => {
            console.error("Error in profile snapshot listener:", err);
          });
        } catch (err) {
          console.error("Error setting up notifications listener in Header:", err);
        }
      } else {
        setNotifications([]);
        if (unsubNotis) unsubNotis();
        if (unsubProfile) unsubProfile();
      }
    });

    return () => {
      unsubscribe();
      if (unsubNotis) unsubNotis();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      setNotiOpen(false);
      sessionStorage.setItem("logging_out", "true");
      navigate("/");
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await realtimeHelpers.update(realtimeHelpers.ref(database, `notifications/${id}`), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveNoti = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await realtimeHelpers.remove(realtimeHelpers.ref(database, `notifications/${id}`));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updates: Record<string, any> = {};
      notifications.filter(n => !n.read).forEach(n => {
        updates[`notifications/${n.id}/read`] = true;
      });
      await realtimeHelpers.update(realtimeHelpers.ref(database), updates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n: any) => {
    if (!n.read) {
      realtimeHelpers.update(realtimeHelpers.ref(database, `notifications/${n.id}`), { read: true }).catch(console.error);
    }
    setNotiOpen(false);
    
    if (
      n.type === "interest_received" || 
      n.type === "interest_approved" || 
      n.type === "interest_rejected" ||
      n.type === "marriage_proposal" ||
      n.type === "marriage_proposal_rejected"
    ) {
      navigate("/dashboard?tab=interests");
    } else if (n.type === "marriage_proposal_accepted") {
      navigate("/dashboard?tab=stories");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const notiDropdown = () => (
    <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 p-2 shadow-xl bg-white dark:bg-dark-900 z-50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-dark-850">
        <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-maroon-700 dark:text-gold-400 hover:underline cursor-pointer">Mark all read</button>
        )}
      </div>
      <div className="py-1 max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-dark-850">
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n.id} 
               onClick={() => handleNotificationClick(n)}
               className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-800 ${!n.read ? "bg-slate-55/30 dark:bg-dark-850/20" : ""}`}>
            <div className="flex-grow min-w-0">
              <p className={`text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 ${!n.read ? "font-bold text-slate-900 dark:text-white" : ""}`}>{n.text}</p>
              <span className="text-[9px] text-slate-400 block mt-1">
                {n.createdAt ? new Date(n.createdAt.toDate()).toLocaleString() : "Just now"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!n.read && (
                <button onClick={(e) => handleMarkAsRead(n.id, e)}
                  className="p-1 rounded bg-maroon-50 text-maroon-750 dark:bg-maroon-950/20 dark:text-gold-450 hover:scale-105 transition-transform cursor-pointer" title="Mark as Read">
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={(e) => handleRemoveNoti(n.id, e)}
                className="p-1 rounded bg-slate-50 text-slate-450 hover:text-red-650 hover:bg-red-50 dark:bg-dark-800 dark:hover:bg-red-950/20 transition-colors cursor-pointer" title="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">No notifications yet.</div>
        )}
      </div>
    </div>
  );

  const handleHamburgerClick = () => {
    if (isDashboard) {
      window.dispatchEvent(new CustomEvent('toggle-dashboard-sidebar'));
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-dark-800/50 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleHamburgerClick}
              className="p-2 md:hidden rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="shrink-0">
              <Logo size="md" showIcon={false} />
            </Link>
          </div>

          {/* Right: Theme + Bell (or Sign In) */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle (hidden on landing page) */}
            {location.pathname !== "/" && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative" ref={notiRef}>
                  <button
                    onClick={() => setNotiOpen(!notiOpen)}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all duration-200 cursor-pointer relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white leading-none">{unreadCount}</span>
                    )}
                  </button>
                  {notiOpen && notiDropdown()}
                </div>

              </div>
            ) : (
              <Link to="/login"
                className="rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (non-dashboard pages only) */}
      {drawerOpen && !isDashboard && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-dark-800/50 bg-white dark:bg-dark-900 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {!currentUser && (
              <>
                <a href="/#testimonials" onClick={() => setDrawerOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-maroon-50 dark:hover:bg-dark-800 hover:text-maroon-700 dark:hover:text-gold-400 transition-all">Testimonials</a>
                <a href="/#subscriptions" onClick={() => setDrawerOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-maroon-50 dark:hover:bg-dark-800 hover:text-maroon-700 dark:hover:text-gold-400 transition-all">Subscriptions</a>
              </>
            )}
            {currentUser && (
              <div className="pt-2 border-t border-slate-100 dark:border-dark-800">
                <button onClick={() => { setDrawerOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"><LogOut className="h-4 w-4" /> Logout</button>
              </div>
            )}
            {!currentUser && (
              <div className="pt-2 border-t border-slate-100 dark:border-dark-800">
                <Link to="/login" onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-maroon-700 to-maroon-600 px-4 py-3 text-sm font-bold text-white shadow-sm">Sign In / Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
