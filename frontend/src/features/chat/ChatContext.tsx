import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  setDoc,
  getDoc,
  writeBatch,
  limit,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { db, auth } from "../../config/firebase";
import type { ChatMessage, Conversation } from "./chatTypes";

interface ChatContextType {
  myId: string | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  globalUnreadCount: number;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  authResolved: boolean;
  liveProfiles: Record<string, { name: string; photo: string }>;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string, forEveryone: boolean) => Promise<void>;
  startConversation: (userId: string, name: string, photo: string) => Promise<string>;
  startAndMessageConversation: (userId: string, name: string, photo: string, initialMessage: string) => Promise<string>;
  toggleBlockChat: (conversationId: string, block: boolean) => Promise<void>;
  clearChat: (conversationId: string) => Promise<void>;
  unmatchUser: (otherUserId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

const MESSAGES_COLLECTION = "messages";

const getConversationId = (id1: string, id2: string) =>
  [id1, id2].sort().join("_");

const myProfileIdRef: { current: string | null } = { current: null };

const getUid = () => {
  const id = myProfileIdRef.current;
  if (!id) throw new Error("Not authenticated");
  return id;
};

const lookupMyProfileId = async (email: string): Promise<string | null> => {
  try {
    const q = query(collection(db, "profiles"), where("email", "==", email), limit(1));
    const snap = await getDocs(q);
    return snap.docs[0]?.id || null;
  } catch (err) {
    console.error("lookupMyProfileId error:", err);
    return null;
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authResolved, setAuthResolved] = useState(false);
  const [myProfileIdState, setMyProfileIdState] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [liveProfiles, setLiveProfiles] = useState<Record<string, { name: string; photo: string }>>({});
  const profileUnsubs = useRef<Map<string, () => void>>(new Map());
  const unsubMessages = useRef<(() => void) | null>(null);
  const prevActiveId = useRef<string | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthResolved(true);
      if (user && user.email) {
        // Retry lookup to handle Firestore eventual consistency
        // (profile doc may have been created milliseconds before auth fires)
        let pid: string | null = null;
        for (let i = 0; i < 5; i++) {
          pid = await lookupMyProfileId(user.email);
          if (pid) break;
          await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        }
        myProfileIdRef.current = pid;
        setMyProfileIdState(pid);
      } else {
        myProfileIdRef.current = null;
        setMyProfileIdState(null);
        setConversations([]);
        setMessages([]);
        if (!initialLoadDone.current) {
          setLoading(false);
          initialLoadDone.current = true;
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!myProfileIdState) {
      if (!currentUser && !initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
      if (!currentUser) {
        setConversations([]);
        setMessages([]);
      }
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", myProfileIdState),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Conversation[] = snapshot.docs.map((d) => {
        const data = d.data();
        const lastMsg = data.lastMessage ?? null;
        const hasUnread = lastMsg && lastMsg.senderId !== myProfileIdState && lastMsg.status !== "read";
        
        return {
          id: d.id,
          participants: data.participants ?? [],
          participantData: data.participantData ?? {},
          lastMessage: lastMsg,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
          blockedBy: data.blockedBy ?? [],
          clearedAt: data.clearedAt ?? {},
          unmatchedBy: data.unmatchedBy ?? [],
          unreadCount: hasUnread ? 1 : 0,
        };
      });

      const filteredList = list.filter(c => {
        if (c.unmatchedBy?.includes(myProfileIdState || "")) return false;
        
        const clearedAt = c.clearedAt?.[myProfileIdState || ""]?.toMillis() || 0;
        const lastMsgTime = c.lastMessage?.timestamp?.toMillis() || 0;
        if (lastMsgTime > 0 && lastMsgTime <= clearedAt) {
          return false;
        }
        
        return true;
      });

      setConversations(filteredList);
      if (!initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }, (error) => {
      console.error("Conversations listener error:", error);
      if (!initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    });

    return () => unsub();
  }, [myProfileIdState, currentUser]);

  // Real-time profile subscriptions for conversation participants
  useEffect(() => {
    const current = profileUnsubs.current;
    const activeIds = new Set<string>();
    conversations.forEach((c) =>
      c.participants.forEach((p) => {
        if (p !== myProfileIdState) activeIds.add(p);
      })
    );

    // Unsubscribe from profiles no longer in any conversation
    current.forEach((unsub, pid) => {
      if (!activeIds.has(pid)) {
        unsub();
        current.delete(pid);
      }
    });

    // Subscribe to new profiles
    activeIds.forEach((pid) => {
      if (current.has(pid)) return;
      const unsub = onSnapshot(doc(db, "profiles", pid), (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        const fn = d.firstName || "";
        const ln = d.lastName || "";
        const name = [fn, ln].filter(Boolean).join(" ") || d.name || "";
        const photo = d.photos?.[0] || d.photo || "";
        setLiveProfiles((prev) => ({ ...prev, [pid]: { name, photo } }));
      });
      current.set(pid, unsub);
    });

    return () => {
      current.forEach((unsub) => unsub());
      current.clear();
    };
  }, [conversations, myProfileIdState]);

  useEffect(() => {
    if (!currentUser || !activeConversationId) {
      if (unsubMessages.current) {
        unsubMessages.current();
        unsubMessages.current = null;
      }
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "conversations", activeConversationId, MESSAGES_COLLECTION),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    unsubMessages.current = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId ?? "",
          text: data.text ?? "",
          timestamp: data.timestamp ?? null,
          status: data.status ?? "sent",
          deleted: data.deleted ?? false, // Keep for backward compatibility
          deletedForEveryone: data.deletedForEveryone ?? false,
          deletedForMe: data.deletedForMe ?? [],
          edited: data.edited ?? false,
        };
      });

      // Filter messages client-side based on clearedAt and deletedForMe
      const conv = conversations.find(c => c.id === activeConversationId);
      const myId = myProfileIdRef.current;
      const clearedAt = conv?.clearedAt?.[myId || ""]?.toMillis() || 0;
      
      const filteredList = list.filter(m => {
        if (m.deletedForMe?.includes(myId || "")) return false;
        if (m.timestamp && m.timestamp.toMillis() < clearedAt) return false;
        return true;
      });

      if (prevActiveId.current !== activeConversationId) {
        setMessages(filteredList);
        prevActiveId.current = activeConversationId;
      } else {
        setMessages(filteredList);
      }

      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (
          change.type === "added" &&
          data.senderId !== myProfileIdRef.current &&
          !data.deleted &&
          !data.deletedForEveryone &&
          data.status === "sent"
        ) {
          const msgRef = doc(db, "conversations", activeConversationId, MESSAGES_COLLECTION, change.doc.id);
          updateDoc(msgRef, { status: "delivered" }).catch(err => console.error("Failed to update status", err));
        }
      });
    }, (error) => {
      console.error("Messages listener error:", error);
    });

    return () => {
      if (unsubMessages.current) {
        unsubMessages.current();
        unsubMessages.current = null;
      }
    };
  }, [currentUser, activeConversationId]);

  const markAsRead = useCallback(async () => {
    if (!activeConversationId) return;
    try {
      const uid = getUid();
      
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId && c.unreadCount > 0) {
           return { ...c, lastMessage: c.lastMessage ? { ...c.lastMessage, status: "read" } : c.lastMessage, unreadCount: 0 };
        }
        return c;
      }));

      const q = query(
        collection(db, "conversations", activeConversationId, MESSAGES_COLLECTION),
        where("senderId", "!=", uid),
        where("status", "in", ["sent", "delivered"])
      );
      const snap = await getDocs(q);
      
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.update(d.ref, { status: "read" });
      });

      const convRef = doc(db, "conversations", activeConversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        const convData = convSnap.data();
        const updates: any = {};
        
        if (convData.lastMessage && convData.lastMessage.senderId !== uid && convData.lastMessage.status !== "read") {
           updates["lastMessage.status"] = "read";
        }

        if (Object.keys(updates).length > 0) {
           batch.update(convRef, updates);
        }
      }

      await batch.commit();
    } catch (err) {
      // silently ignore - auth might not be ready
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      markAsRead();
    }
  }, [activeConversationId, messages.length, markAsRead]);

  const sendMessage = useCallback(async (text: string) => {
    if (!activeConversationId || !text.trim()) return;
    setSending(true);
    try {
      const uid = getUid();
      await addDoc(
        collection(db, "conversations", activeConversationId, MESSAGES_COLLECTION),
        {
          senderId: uid,
          text: text.trim(),
          timestamp: serverTimestamp(),
          status: "sent",
          deleted: false,
          deletedForEveryone: false,
          deletedForMe: [],
          edited: false,
        }
      );

      const conv = conversations.find(c => c.id === activeConversationId);
      const receiverId = conv?.participants.find(p => p !== uid);

      await updateDoc(doc(db, "conversations", activeConversationId), {
        lastMessage: {
          text: text.trim(),
          senderId: uid,
          timestamp: serverTimestamp(),
          status: "sent",
        },
        updatedAt: serverTimestamp(),
      });

      // Create a notification document so the recipient gets a toast
      if (receiverId) {
        const senderData = conv?.participantData?.[uid] || liveProfiles?.[uid];
        const senderName = senderData?.name || "Someone";
        addDoc(collection(db, "notifications"), {
          receiverId,
          text: `${senderName}: ${text.trim().substring(0, 80)}`,
          type: "chat_message",
          read: false,
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("sendMessage error:", err);
    } finally {
      setSending(false);
    }
  }, [activeConversationId]);

  const deleteMessage = useCallback(async (messageId: string, forEveryone: boolean) => {
    if (!activeConversationId) return;
    try {
      const myId = getUid();
      const updateData = forEveryone 
        ? { deletedForEveryone: true }
        : { deletedForMe: arrayUnion(myId) };
      
      await updateDoc(
        doc(db, "conversations", activeConversationId, MESSAGES_COLLECTION, messageId),
        updateData
      );
    } catch (err) {
      console.error("deleteMessage error:", err);
    }
  }, [activeConversationId]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!activeConversationId || !newText.trim()) return;
    try {
      await updateDoc(
        doc(db, "conversations", activeConversationId, MESSAGES_COLLECTION, messageId),
        { text: newText.trim(), edited: true }
      );
    } catch (err) {
      console.error("editMessage error:", err);
    }
  }, [activeConversationId]);

  const toggleBlockChat = useCallback(async (conversationId: string, block: boolean) => {
    try {
      const myId = getUid();
      await updateDoc(doc(db, "conversations", conversationId), {
        blockedBy: block ? arrayUnion(myId) : arrayRemove(myId)
      });
    } catch (err) {
      console.error("toggleBlockChat error:", err);
    }
  }, []);

  const clearChat = useCallback(async (conversationId: string) => {
    try {
      const myId = getUid();
      await updateDoc(doc(db, "conversations", conversationId), {
        [`clearedAt.${myId}`]: serverTimestamp()
      });
    } catch (err) {
      console.error("clearChat error:", err);
    }
  }, []);

  const unmatchUser = useCallback(async (otherUserId: string) => {
    try {
      const myId = getUid();
      // Remove interest where I am sender or receiver
      const q1 = query(collection(db, "interests"), where("senderId", "==", myId), where("receiverId", "==", otherUserId));
      const q2 = query(collection(db, "interests"), where("senderId", "==", otherUserId), where("receiverId", "==", myId));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const batch = writeBatch(db);
      snap1.forEach(d => batch.delete(d.ref));
      snap2.forEach(d => batch.delete(d.ref));
      
      const convId = getConversationId(myId, otherUserId);
      const convRef = doc(db, "conversations", convId);
      batch.update(convRef, { unmatchedBy: arrayUnion(myId) });
      
      await batch.commit();
    } catch (err) {
      console.error("unmatchUser error:", err);
    }
  }, []);

  const startConversation = useCallback(async (userId: string, name: string, photo: string): Promise<string> => {
    const uid = getUid();
    const convId = getConversationId(uid, userId);
    const convRef = doc(db, "conversations", convId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      const u = auth.currentUser!;
      const participantData: Record<string, { name: string; photo: string }> = {
        [uid]: { name: u.displayName || "You", photo: u.photoURL || "" },
        [userId]: { name, photo },
      };

      await setDoc(convRef, {
        participants: [uid, userId],
        participantData,
        lastMessage: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return convId;
  }, []);

  const startAndMessageConversation = useCallback(async (userId: string, name: string, photo: string, initialMessage: string): Promise<string> => {
    const convId = await startConversation(userId, name, photo);
    const uid = getUid();
    
    // Check if the automated message already exists to avoid duplicates
    const q = query(
      collection(db, "conversations", convId, MESSAGES_COLLECTION),
      where("text", "==", initialMessage),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      await addDoc(
        collection(db, "conversations", convId, MESSAGES_COLLECTION),
        {
          senderId: uid,
          text: initialMessage,
          timestamp: serverTimestamp(),
          status: "sent",
          deleted: false,
          deletedForEveryone: false,
          deletedForMe: [],
          edited: false,
        }
      );
      await updateDoc(doc(db, "conversations", convId), {
        lastMessage: {
          text: initialMessage,
          senderId: uid,
          timestamp: serverTimestamp(),
          status: "sent",
        },
        updatedAt: serverTimestamp(),
      });

      // Notify recipient
      const u = auth.currentUser!;
      addDoc(collection(db, "notifications"), {
        receiverId: userId,
        text: `${u.displayName || "You"}: ${initialMessage.substring(0, 80)}`,
        type: "chat_message",
        read: false,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }
    return convId;
  }, [startConversation]);

  const globalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        myId: myProfileIdState,
        conversations,
        activeConversationId,
        globalUnreadCount,
        messages,
        loading,
        sending,
        authResolved,
        liveProfiles,
        setActiveConversation: setActiveConversationId,
        sendMessage,
        editMessage,
        deleteMessage,
        startConversation,
        startAndMessageConversation,
        toggleBlockChat,
        clearChat,
        unmatchUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
