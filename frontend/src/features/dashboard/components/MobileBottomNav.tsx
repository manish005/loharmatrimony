import React from "react";
import { Users, Search, MessageSquare, User, Settings } from "lucide-react";
import type { TabType } from "../dashboardHelpers";

interface MobileBottomNavProps {
  activeTab: TabType;
  onSetActiveTab: (tab: TabType, id?: string) => void;
  globalUnreadCount?: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSetActiveTab, globalUnreadCount = 0 }) => {
  const items = [
    { id: "matches" as TabType, icon: Users, label: "Matches" },
    { id: "search" as TabType, icon: Search, label: "Search" },
    { id: "messages" as TabType, icon: MessageSquare, label: "Inbox", badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
    { id: "my-profile" as TabType, icon: User, label: "Profile" },
    { id: "settings" as TabType, icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-t border-slate-200/50 dark:border-dark-800/50 px-2 py-1 flex items-center justify-around shadow-xl">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSetActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${isActive
              ? "text-maroon-700 dark:text-gold-400"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? "fill-maroon-700/10 dark:fill-gold-400/10" : ""}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 bg-maroon-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-dark-900 shadow-sm min-w-[16px] text-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
