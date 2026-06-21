import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../config/firebase";
import { Home, Search, UserPlus, LayoutDashboard, User as UserIcon } from "lucide-react";

export const BottomNavigation: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path: string) => {
    if (path.includes("?")) {
      const [pathname, search] = path.split("?");
      return location.pathname === pathname && location.search.includes(search);
    }
    return location.pathname === path && location.search === "";
  };

  const items = currentUser
    ? [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Search", path: "/dashboard?tab=search", icon: Search },
        { name: "My Profile", path: "/dashboard?tab=my-profile", icon: UserIcon },
      ]
    : [
        { name: "Home", path: "/", icon: Home },
        { name: "Register", path: "/register", icon: UserPlus },
        { name: "Login", path: "/login", icon: UserIcon },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-slate-200/50 dark:border-dark-800/50 px-4 py-2 flex items-center justify-around pb-safe-bottom shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? "text-maroon-700 dark:text-gold-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
            }`}
          >
            <Icon className={`h-5.5 w-5.5 mb-1 transition-transform ${isActive(item.path) ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
