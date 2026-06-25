import React, { useRef, useEffect, useState } from "react";
import { Send, ArrowLeft, MoreVertical, Ban, Trash2, UserX, X, Lock } from "lucide-react";
import { useChat } from "../ChatContext";
import MessageBubble from "./MessageBubble";
import { useLanguage } from "../../../context/LanguageContext";
import { db } from "../../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface ChatThreadProps {
  onBack?: () => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const {
    myId,
    activeConversationId,
    setActiveConversation,
    conversations,
    messages,
    sending,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleBlockChat,
    clearChat,
    unmatchUser,
    liveProfiles,
    otherTyping,
    setTyping,
  } = useChat();
  const [input, setInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === activeConversationId);
  const isBlocked = conversation?.blockedBy?.includes(myId || "");
  const otherId = conversation?.participants.find((p) => p !== myId);
  const otherData = otherId
    ? (liveProfiles[otherId] ?? conversation?.participantData[otherId])
    : null;

  // Check if chat is locked (no approved interest between users)
  useEffect(() => {
    if (!myId || !otherId) {
      setChatLocked(false);
      setCheckingLock(false);
      return;
    }
    setCheckingLock(true);
    const checkApprovedInterest = async () => {
      try {
        const q1 = query(
          collection(db, "interests"),
          where("senderId", "==", myId),
          where("receiverId", "==", otherId),
          where("status", "==", "approved")
        );
        const q2 = query(
          collection(db, "interests"),
          where("senderId", "==", otherId),
          where("receiverId", "==", myId),
          where("status", "==", "approved")
        );
        const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        setChatLocked(s1.empty && s2.empty);
      } catch {
        setChatLocked(true);
      } finally {
        setCheckingLock(false);
      }
    };
    checkApprovedInterest();
  }, [myId, otherId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim()) setTyping();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || isBlocked || chatLocked) return;
    if (editingMessageId) {
      editMessage(editingMessageId, input);
      setEditingMessageId(null);
    } else {
      sendMessage(input);
    }
    setInput("");
  };

  const handleEditInit = (id: string, text: string) => {
    setEditingMessageId(id);
    setInput(text);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setInput("");
  };

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
        {t("chat.select")}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white/30 dark:bg-dark-950/30">
      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-dark-800/50 flex items-center justify-between bg-white/50 dark:bg-dark-900/50 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1 mr-1 text-slate-400 hover:text-maroon-700 dark:hover:text-gold-400 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 flex-shrink-0">
            {otherData?.photo ? (
              <img src={otherData.photo} alt={otherData.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-500">
                {otherData?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{otherData?.name || "Unknown"}</h4>
          </div>
        </div>
        
        {/* Header Options */}
        <div className="relative">
          <button
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showHeaderMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-dark-850 rounded-xl shadow-lg border border-slate-200 dark:border-dark-800 py-1 z-20">
              <button
                onClick={() => { toggleBlockChat(activeConversationId, !isBlocked); setShowHeaderMenu(false); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 flex items-center gap-2"
              >
                <Ban className="h-3.5 w-3.5" />
                {isBlocked ? "Unblock Chat" : "Block Chat"}
              </button>
              <button
                onClick={() => { clearChat(activeConversationId); setShowHeaderMenu(false); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Chat
              </button>
              {otherId && (
                <button
                  onClick={() => { unmatchUser(otherId); setShowHeaderMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-slate-100 dark:border-dark-800 mt-1 pt-2"
                >
                  <UserX className="h-3.5 w-3.5" />
                  Unmatch
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.filter((m) => !m.deleted && !m.deletedForEveryone).length === 0 ? (
          <p className="text-[10px] text-slate-400 italic text-center py-10">{t("chat.nomessages")}</p>
        ) : (
          messages.map((msg, index) => {
            const mySentMessages = messages.filter(m => m.senderId === myId);
            const isLastTwoSent = mySentMessages.slice(-2).some(m => m.id === msg.id);
            
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                onDelete={deleteMessage}
                onEdit={handleEditInit}
                isMine={msg.senderId === myId}
                canEdit={isLastTwoSent}
                otherPhoto={otherData?.photo}
                otherName={otherData?.name}
              />
            );
          })
        )}
        {otherTyping && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-maroon-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-maroon-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-maroon-600 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[10px] text-slate-400 italic">{otherData?.name || "User"} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isBlocked ? (
        <div className="p-4 border-t border-slate-200/50 dark:border-dark-800/50 bg-slate-50 dark:bg-dark-900 flex justify-center text-xs font-bold text-slate-500 shrink-0">
          This chat is currently blocked.
        </div>
      ) : chatLocked && !checkingLock ? (
        <div className="p-4 border-t border-slate-200/50 dark:border-dark-800/50 bg-slate-50 dark:bg-dark-900 flex flex-col items-center gap-2 shrink-0">
          <Lock className="h-4 w-4 text-slate-400" />
          <p className="text-[11px] text-slate-500 font-semibold text-center">
            Send an interest to {otherData?.name || "this user"} to start chatting
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200/50 dark:border-dark-800/50 bg-white/50 dark:bg-dark-900/50 flex flex-col gap-2 shrink-0">
          {editingMessageId && (
            <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-semibold">
              <span>Editing message...</span>
              <button type="button" onClick={cancelEdit} className="hover:text-red-500 cursor-pointer p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={t("chat.placeholder")}
              className="flex-1 text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 bg-white dark:bg-dark-950 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 dark:focus:ring-gold-500/20"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2.5 bg-maroon-700 text-white rounded-xl shadow-sm hover:bg-maroon-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatThread;
