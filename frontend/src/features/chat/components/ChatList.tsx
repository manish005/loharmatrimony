import React from "react";
import { MessageCircle } from "lucide-react";
import { useChat } from "../ChatContext";
import { useLanguage } from "../../../context/LanguageContext";
interface ChatListProps {
  onBackToHome?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onBackToHome }) => {
  const { myId, conversations, activeConversationId, setActiveConversation, liveProfiles } = useChat();
  const { t } = useLanguage();

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/50 dark:border-dark-800/50 flex flex-col bg-white/50 dark:bg-dark-900/50">
      <div className="p-4 border-b border-slate-200/50 dark:border-dark-800/50 flex items-center gap-2">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="Back to Home"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">{t("chat.recent")}</h3>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-850">
        {conversations.map((conv) => {
          const otherId = conv.participants.find((p) => p !== myId);
          const otherData = otherId
            ? (liveProfiles[otherId] ?? conv.participantData[otherId])
            : null;
          const lastMsg = conv.lastMessage;

          return (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                conv.id === activeConversationId
                  ? "bg-maroon-700/5 dark:bg-gold-500/5 border-l-4 border-maroon-700 dark:border-gold-500"
                  : "hover:bg-slate-50 dark:hover:bg-dark-850/50"
              }`}
            >
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 flex-shrink-0 relative">
                {otherData?.photo ? (
                  <img src={otherData.photo} alt={otherData.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    {otherData?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {otherData?.name || "Unknown"}
                  </h4>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 bg-maroon-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${conv.unreadCount > 0 ? "font-bold text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                  {lastMsg ? lastMsg.text : t("chat.nomessages")}
                </p>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 italic mb-1">{t("chat.noconversations")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
