// Chat types — uses number timestamps (Unix ms) for Realtime Database compatibility

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number | null;
  status: MessageStatus;
  deleted: boolean; // Keep for backward compatibility
  deletedForEveryone?: boolean;
  deletedForMe?: string[];
  edited?: boolean;
}

export interface ConversationData {
  id: string;
  participants: string[];
  participantData: Record<string, { name: string; photo: string }>;
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: number | null;
    status: MessageStatus;
  } | null;
  createdAt: number | null;
  updatedAt: number | null;
  blockedBy?: string[];
  clearedAt?: Record<string, number>;
  unmatchedBy?: string[];
}

export interface Conversation extends ConversationData {
  unreadCount: number;
}
