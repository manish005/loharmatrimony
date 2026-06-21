import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TabType } from "../dashboardHelpers";
import { useLanguage } from "../../../context/LanguageContext";

interface MenuItem {
  id: TabType;
  name: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface DashboardSidebarProps {
  menuItems: MenuItem[];
  activeTab: TabType;
  sidebarOpen: boolean;
  onSetActiveTab: (tab: TabType, id?: string) => void;
  onSetSidebarOpen: (open: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  menuItems,
  activeTab,
  sidebarOpen,
  onSetActiveTab,
  onSetSidebarOpen,
}) => {
  const { t } = useLanguage();
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6">
        <div className="glass-panel border border-slate-200/40 dark:border-dark-800/50 rounded-3xl p-5 space-y-4 bg-white/70">
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white pb-1">
            {t("Dashboard Menu")}
          </h3>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSetActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === item.id
                    ? "bg-maroon-700 text-white shadow-md shadow-maroon-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-dark-850/50 hover:text-maroon-700 dark:hover:text-gold-400"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${activeTab === item.id
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

      {/* Mobile Navigation Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => onSetSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-55 p-6 pt-16 space-y-6 shadow-2xl bg-white dark:bg-dark-900"
            >
              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSetActiveTab(item.id);
                        onSetSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold ${activeTab === item.id
                        ? "bg-maroon-700 text-white"
                        : "text-slate-655 dark:text-slate-355"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4.5 w-4.5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
