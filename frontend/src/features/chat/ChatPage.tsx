import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useChat } from "./ChatContext";
import ChatList from "./components/ChatList";
import ChatThread from "./components/ChatThread";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    myId,
    activeConversationId,
    setActiveConversation,
    startConversation,
  } = useChat();
  const [showList, setShowList] = useState(true);
  const processedUserId = useRef<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const photo = searchParams.get("photo");
    if (!userId || processedUserId.current === userId) return;
    if (!myId) return; // profile not yet resolved — will retry when myId changes
    processedUserId.current = userId;
    startConversation(userId, name || "User", photo || "")
      .then((convId) => {
        setActiveConversation(convId);
      })
      .catch(() => {
        processedUserId.current = null;
      });
  }, [myId, searchParams, startConversation, setActiveConversation]);

  useEffect(() => {
    setShowList(!activeConversationId);
  }, [activeConversationId]);

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-dark-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <MessageCircle className="h-5 w-5 text-maroon-700 dark:text-gold-400" />
          <h1 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{t("chat.pageTitle")}</h1>
        </div>

        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex flex-1 overflow-hidden">
            <div className={`${showList ? "flex" : "hidden"} md:flex`}>
              <ChatList />
            </div>
            <div className={`flex-1 flex ${!showList ? "flex" : "hidden md:flex"}`}>
              <ChatThread onBack={() => setShowList(true)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
