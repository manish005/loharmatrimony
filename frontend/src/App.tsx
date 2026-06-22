import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./config/firebase";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./features/landing/LandingPage";
import { RegisterWizard } from "./features/auth/RegisterWizard";
import { Login } from "./features/auth/Login";
import { ForgotPassword } from "./features/auth/ForgotPassword";
import { ResetPassword } from "./features/auth/ResetPassword";
import { Dashboard } from "./features/dashboard/Dashboard";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { PrivacyPolicy } from "./features/legal/PrivacyPolicy";
import { TermsConditions } from "./features/legal/TermsConditions";
import { ChatProvider } from "./features/chat/ChatContext";
import ChatPage from "./features/chat/ChatPage";
import { Heart } from "lucide-react";
import { Toaster } from "react-hot-toast";

const AppLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeChanging, setRouteChanging] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        sessionStorage.removeItem("logging_out");
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show page loader on location changes (page switches)
  useEffect(() => {
    setRouteChanging(true);
    const timer = setTimeout(() => {
      setRouteChanging(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] dark:bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-maroon-700"></div>
      </div>
    );
  }

  const isLoggingOut = sessionStorage.getItem("logging_out") === "true";
  const isRegistering = sessionStorage.getItem("registering") === "true";
  const effectiveUser = (isLoggingOut || isRegistering) ? null : currentUser;

  // Layout guards to hide components on login/register and admin pages
  const showHeader = !["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);
  const showFooter = !effectiveUser && !["/dashboard", "/admin", "/privacy", "/terms", "/login", "/register", "/forgot-password", "/reset-password", "/chat"].includes(location.pathname);
  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2] dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      {/* Animated Page Transition Logo Loader */}
      {routeChanging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#faf7f2]/80 dark:bg-dark-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-maroon-700 to-maroon-505 shadow-lg shadow-maroon-500/25 animate-bounce">
              <Heart className="h-9 w-9 text-gold-200 fill-gold-200" />
            </div>
            <span className="font-serif text-sm font-bold text-maroon-750 dark:text-gold-400 tracking-wider animate-pulse">
              Connecting Hearts...
            </span>
          </div>
        </div>
      )}

      {/* Global Header Layout */}
      {showHeader && <Header />}

      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            effectiveUser 
              ? (effectiveUser.email?.toLowerCase().includes("admin") 
                  ? <Navigate to="/admin" replace /> 
                  : <Dashboard />)
              : <LandingPage />
          } />
          <Route path="/login" element={
            effectiveUser 
              ? (effectiveUser.email?.toLowerCase().includes("admin") 
                  ? <Navigate to="/admin" replace /> 
                  : <Navigate to="/dashboard" replace />)
              : <Login />
          } />
          <Route path="/register" element={
            effectiveUser 
              ? (effectiveUser.email?.toLowerCase().includes("admin") 
                  ? <Navigate to="/admin" replace /> 
                  : <Navigate to="/dashboard" replace />)
              : <RegisterWizard />
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={
            effectiveUser 
              ? (effectiveUser.email?.toLowerCase().includes("admin") 
                  ? <Navigate to="/admin" replace /> 
                  : <Dashboard />)
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin" element={
            effectiveUser 
              ? (effectiveUser.email?.toLowerCase().includes("admin") 
                  ? <AdminDashboard /> 
                  : <Navigate to="/dashboard" replace />)
              : <Navigate to="/login" replace />
          } />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/chat" element={
            effectiveUser
              ? <ChatPage />
              : <Navigate to="/login" replace />
          } />
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer Layout */}
      {showFooter && <Footer />}
      <Toaster position="top-center" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
      <ThemeProvider>
        <Router>
          <ChatProvider>
            <AppLayout />
          </ChatProvider>
        </Router>
      </ThemeProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
