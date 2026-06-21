import React from "react";
import { Send, ChevronRight } from "lucide-react";

interface ChatMessage {
  sender: string;
  text: string;
}

interface Chat {
  id: string;
  name: string;
  photo: string;
  isOnline: boolean;
  lastMessage: string;
  messages: ChatMessage[];
}

interface ChatPanelProps {
  chats: Chat[];
  activeChatId: string;
  typingMessage: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSelectChat: (id: string) => void;
  onTypingMessageChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onViewProfile: (tab: string, id: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  chats,
  activeChatId,
  typingMessage,
  messagesEndRef,
  onSelectChat,
  onTypingMessageChange,
  onSendMessage,
  onViewProfile,
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl overflow-hidden shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Directory List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/50 dark:border-dark-800/50 flex flex-col bg-white/50 dark:bg-dark-900/50 ${activeChatId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-slate-200/50 dark:border-dark-800/50">
            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Recent Chats</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-850">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${chat.id === activeChatId
                  ? "bg-maroon-700/5 dark:bg-gold-500/5 border-l-4 border-maroon-700 dark:border-gold-500"
                  : "hover:bg-slate-50 dark:hover:bg-dark-850/50"
                  }`}
              >
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 flex-shrink-0 relative">
                  <img src={chat.photo} alt={chat.name} className="h-full w-full object-cover" />
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-dark-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{chat.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Thread Panel */}
        <div className={`flex-1 flex flex-col bg-white/30 dark:bg-dark-950/30 ${activeChatId ? "flex" : "hidden md:flex"}`}>
          {(() => {
            const currentChat = chats.find(c => c.id === activeChatId);
            if (!currentChat) {
              return (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                  Select a conversation to start chatting.
                </div>
              );
            }

            return (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-slate-200/50 dark:border-dark-800/50 flex items-center justify-between bg-white/50 dark:bg-dark-900/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectChat("")}
                      className="md:hidden p-1 mr-1 text-slate-400 hover:text-maroon-700 dark:hover:text-gold-400 cursor-pointer"
                      aria-label="Back"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180 text-maroon-700 dark:text-gold-400" />
                    </button>
                    <img src={currentChat.photo} alt={currentChat.name} className="h-9 w-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{currentChat.name}</h4>
                      <span className="text-[9px] text-emerald-500 font-bold">{currentChat.isOnline ? "Online" : "Away"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProfile("view-profile", currentChat.id)}
                    className="text-[10px] font-bold text-maroon-700 dark:text-gold-400 hover:underline cursor-pointer"
                  >
                    View Profile <ChevronRight className="h-3 w-3 inline" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {currentChat.messages.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-10">No messages yet. Say hello!</p>
                  ) : (
                    currentChat.messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === "me"
                          ? "bg-maroon-700 text-white rounded-br-sm shadow-sm"
                          : "bg-white dark:bg-dark-850 text-slate-800 dark:text-slate-205 rounded-bl-sm border border-slate-100 dark:border-dark-800 shadow-sm"
                          }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={onSendMessage} className="p-3 border-t border-slate-200/50 dark:border-dark-800/50 bg-white/50 dark:bg-dark-900/50 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={typingMessage}
                    onChange={(e) => onTypingMessageChange(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 text-xs border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 bg-white dark:bg-dark-950 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 dark:focus:ring-gold-500/20"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-maroon-700 text-white rounded-xl shadow-sm hover:bg-maroon-800 transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
