import type { Timestamp } from "firebase/firestore";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
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
    timestamp: Timestamp | null;
    status: MessageStatus;
  } | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  blockedBy?: string[];
  clearedAt?: Record<string, Timestamp>;
  unmatchedBy?: string[];
}

export interface Conversation extends ConversationData {
  unreadCount: number;
}
