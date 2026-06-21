import React, { useState } from "react";
import type { ChatMessage } from "../chatTypes";

interface MessageBubbleProps {
  message: ChatMessage;
  onDelete: (id: string, forEveryone: boolean) => void;
  onEdit?: (id: string, text: string) => void;
  isMine: boolean;
  canEdit?: boolean;
  otherPhoto?: string;
  otherName?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  sending: (
    <svg className="h-3 w-3 text-slate-400" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  ),
  sent: (
    <svg className="h-3 w-3 text-slate-400" viewBox="0 0 12 12" fill="none">
      <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  delivered: (
    <svg className="h-3 w-3 text-slate-400" viewBox="0 0 14 12" fill="none">
      <path d="M1 5 L4 8 L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5 L8 8 L13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  read: (
    <svg className="h-3 w-3 text-blue-500" viewBox="0 0 14 12" fill="none">
      <path d="M1 5 L4 8 L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5 L8 8 L13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDelete, onEdit, isMine, canEdit, otherPhoto, otherName }) => {
  const [showMenu, setShowMenu] = useState(false);

  const timeStr = message.timestamp?.toDate
    ? message.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  if (message.deleted || message.deletedForEveryone) {
    return (
      <div className={`flex ${isMine ? "justify-end mr-11" : "justify-start ml-11"} opacity-50`}>
        <div className="max-w-[75%] px-4 py-2 rounded-2xl text-xs italic text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-800">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group/message items-end gap-2`}>
      {!isMine && (
        <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-100 dark:bg-dark-800 flex-shrink-0 mb-0.5">
          {otherPhoto ? (
            <img src={otherPhoto} alt={otherName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[9px] font-bold text-slate-500">
              {otherName?.charAt(0) || "?"}
            </div>
          )}
        </div>
      )}

      <div className="max-w-[75%] relative">
        <div
          className={`px-3.5 py-2 text-xs leading-relaxed ${
            isMine
              ? "bg-maroon-700 text-white rounded-2xl rounded-br-sm shadow-sm"
              : "bg-white dark:bg-dark-850 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-dark-800 shadow-sm"
          }`}
        >
          {message.text}
        </div>

        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
          <span className="text-[9px] text-slate-400 dark:text-slate-500">
            {timeStr} {message.edited && <span className="italic opacity-80 ml-0.5">(Edited)</span>}
          </span>
          {isMine && statusIcons[message.status]}
        </div>

        <div className="absolute top-0 right-0 hidden group-hover/message:block">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Message options"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute top-5 right-0 bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-800 rounded-lg shadow-xl py-1 min-w-[120px] z-10">
              {isMine && canEdit && onEdit && (
                <button
                  onClick={() => { onEdit(message.id, message.text); setShowMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              )}
              <button
                onClick={() => { onDelete(message.id, false); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Delete for me
              </button>
              {isMine && (
                <button
                  onClick={() => { onDelete(message.id, true); setShowMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  Delete for everyone
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
