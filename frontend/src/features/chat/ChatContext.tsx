import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { database, auth, realtimeHelpers, db } from "../../config/firebase";
import { collection, getDocs, query, where, doc, getDoc, onSnapshot, deleteDoc, addDoc } from "firebase/firestore";
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
    const q = query(collection(db, "profiles"), where("email", "==", email.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }
    // Fallback: check uid field matching
    return null;
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

    const conversationsRef = realtimeHelpers.ref(database, "conversations");
    const unsub = realtimeHelpers.onValue(conversationsRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const list: Conversation[] = Object.entries(raw)
        .map(([id, val]: [string, any]) => {
          const lastMsg = val.lastMessage ?? null;
          const hasUnread = lastMsg && lastMsg.senderId !== myProfileIdState && lastMsg.status !== "read";
          
          return {
            id,
            participants: val.participants ?? [],
            participantData: val.participantData ?? {},
            lastMessage: lastMsg,
            createdAt: val.createdAt ?? null,
            updatedAt: val.updatedAt ?? null,
            blockedBy: val.blockedBy ?? [],
            clearedAt: val.clearedAt ?? {},
            unmatchedBy: val.unmatchedBy ?? [],
            unreadCount: hasUnread ? 1 : 0,
          };
        })
        .filter(c => c.participants.includes(myProfileIdState));

      const filteredList = list.filter(c => {
        if (c.unmatchedBy?.includes(myProfileIdState || "")) return false;
        
        const clearedAt = c.clearedAt?.[myProfileIdState || ""] || 0;
        const lastMsgTime = c.lastMessage?.timestamp || 0;
        if (lastMsgTime > 0 && lastMsgTime <= clearedAt) {
          return false;
        }
        
        return true;
      });

      filteredList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

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

  useEffect(() => {
    const current = profileUnsubs.current;
    const activeIds = new Set<string>();
    conversations.forEach((c) =>
      c.participants.forEach((p) => {
        if (p !== myProfileIdState) activeIds.add(p);
      })
    );

    current.forEach((unsub, pid) => {
      if (!activeIds.has(pid)) {
        unsub();
        current.delete(pid);
      }
    });

    activeIds.forEach((pid) => {
      if (current.has(pid)) return;
      const unsub = onSnapshot(doc(db, "profiles", pid), (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        const fn = d.firstName || "";
        const ln = d.lastName || "";
        const name = [fn, ln].filter(Boolean).join(" ") || d.name || "";
        const photo = (d.photos && d.photos[0]) || d.photo || "";
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

    const messagesRef = realtimeHelpers.ref(database, `messages/${activeConversationId}`);
    
    unsubMessages.current = realtimeHelpers.onValue(messagesRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const list: ChatMessage[] = Object.entries(raw).map(([id, val]: [string, any]) => {
        return {
          id,
          senderId: val.senderId ?? "",
          text: val.text ?? "",
          timestamp: val.timestamp ?? null,
          status: val.status ?? "sent",
          deleted: val.deleted ?? false,
          deletedForEveryone: val.deletedForEveryone ?? false,
          deletedForMe: val.deletedForMe ?? [],
          edited: val.edited ?? false,
        };
      });

      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      const conv = conversations.find(c => c.id === activeConversationId);
      const myId = myProfileIdRef.current;
      const clearedAt = conv?.clearedAt?.[myId || ""] || 0;
      
      const filteredList = list.filter(m => {
        if (m.deletedForMe?.includes(myId || "")) return false;
        if (m.timestamp && m.timestamp < clearedAt) return false;
        return true;
      });

      setMessages(filteredList);
      if (prevActiveId.current !== activeConversationId) {
        prevActiveId.current = activeConversationId;
      }

      Object.entries(raw).forEach(([id, val]: [string, any]) => {
        if (
          val.senderId !== myProfileIdRef.current &&
          !val.deleted &&
          !val.deletedForEveryone &&
          val.status === "sent"
        ) {
          const msgRef = realtimeHelpers.ref(database, `messages/${activeConversationId}/${id}`);
          realtimeHelpers.update(msgRef, { status: "delivered" }).catch(err => console.error("Failed to update status", err));
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
  }, [currentUser, activeConversationId, conversations]);

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

      const messagesRef = realtimeHelpers.ref(database, `messages/${activeConversationId}`);
      const messagesSnap = await realtimeHelpers.get(messagesRef);
      if (messagesSnap.exists()) {
        const raw = messagesSnap.val() || {};
        const updates: Record<string, any> = {};
        Object.entries(raw).forEach(([msgId, val]: [string, any]) => {
          if (val.senderId !== uid && (val.status === "sent" || val.status === "delivered")) {
            updates[`${msgId}/status`] = "read";
          }
        });
        if (Object.keys(updates).length > 0) {
          await realtimeHelpers.update(messagesRef, updates);
        }
      }

      const convRef = realtimeHelpers.ref(database, `conversations/${activeConversationId}`);
      const convSnap = await realtimeHelpers.get(convRef);
      if (convSnap.exists()) {
        const convData = convSnap.val();
        if (convData.lastMessage && convData.lastMessage.senderId !== uid && convData.lastMessage.status !== "read") {
          await realtimeHelpers.update(convRef, {
            "lastMessage/status": "read"
          });
        }
      }
    } catch (err) {
      // silently ignore
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
      const timestamp = Date.now();
      const messagesRef = realtimeHelpers.ref(database, `messages/${activeConversationId}`);
      const newMsgRef = realtimeHelpers.push(messagesRef);
      await realtimeHelpers.set(newMsgRef, {
        senderId: uid,
        text: text.trim(),
        timestamp: timestamp,
        status: "sent",
        deleted: false,
        deletedForEveryone: false,
        deletedForMe: [],
        edited: false,
      });

      const conv = conversations.find(c => c.id === activeConversationId);
      const receiverId = conv?.participants.find(p => p !== uid);

      const convRef = realtimeHelpers.ref(database, `conversations/${activeConversationId}`);
      await realtimeHelpers.update(convRef, {
        lastMessage: {
          text: text.trim(),
          senderId: uid,
          timestamp: timestamp,
          status: "sent",
        },
        updatedAt: timestamp,
      });

      if (receiverId) {
        const senderData = conv?.participantData?.[uid] || liveProfiles?.[uid];
        const senderName = senderData?.name || "Someone";
        await addDoc(collection(db, "notifications"), {
          receiverId,
          text: `${senderName}: ${text.trim().substring(0, 80)}`,
          type: "chat_message",
          read: false,
          createdAt: timestamp,
        });
      }
    } catch (err) {
      console.error("sendMessage error:", err);
    } finally {
      setSending(false);
    }
  }, [activeConversationId, conversations, liveProfiles]);

  const deleteMessage = useCallback(async (messageId: string, forEveryone: boolean) => {
    if (!activeConversationId) return;
    try {
      const myId = getUid();
      const msgRef = realtimeHelpers.ref(database, `messages/${activeConversationId}/${messageId}`);
      
      if (forEveryone) {
        await realtimeHelpers.update(msgRef, { deletedForEveryone: true });
      } else {
        const snap = await realtimeHelpers.get(msgRef);
        if (snap.exists()) {
          const val = snap.val();
          const deletedForMe = val.deletedForMe || [];
          if (!deletedForMe.includes(myId)) {
            deletedForMe.push(myId);
            await realtimeHelpers.update(msgRef, { deletedForMe });
          }
        }
      }
    } catch (err) {
      console.error("deleteMessage error:", err);
    }
  }, [activeConversationId]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!activeConversationId || !newText.trim()) return;
    try {
      const msgRef = realtimeHelpers.ref(database, `messages/${activeConversationId}/${messageId}`);
      await realtimeHelpers.update(msgRef, { text: newText.trim(), edited: true });
    } catch (err) {
      console.error("editMessage error:", err);
    }
  }, [activeConversationId]);

  const toggleBlockChat = useCallback(async (conversationId: string, block: boolean) => {
    try {
      const myId = getUid();
      const convRef = realtimeHelpers.ref(database, `conversations/${conversationId}`);
      const snap = await realtimeHelpers.get(convRef);
      if (snap.exists()) {
        const val = snap.val();
        let blockedBy = val.blockedBy || [];
        if (block) {
          if (!blockedBy.includes(myId)) blockedBy.push(myId);
        } else {
          blockedBy = blockedBy.filter((b: string) => b !== myId);
        }
        await realtimeHelpers.update(convRef, { blockedBy });
      }
    } catch (err) {
      console.error("toggleBlockChat error:", err);
    }
  }, []);

  const clearChat = useCallback(async (conversationId: string) => {
    try {
      const myId = getUid();
      const convRef = realtimeHelpers.ref(database, `conversations/${conversationId}`);
      await realtimeHelpers.update(convRef, {
        [`clearedAt/${myId}`]: Date.now()
      });
    } catch (err) {
      console.error("clearChat error:", err);
    }
  }, []);

  const unmatchUser = useCallback(async (otherUserId: string) => {
    try {
      const myId = getUid();
      // Delete interests from Firestore
      const iq1 = query(collection(db, "interests"), where("senderId", "==", myId), where("receiverId", "==", otherUserId));
      const iSnap1 = await getDocs(iq1);
      iSnap1.forEach(async (d) => { await deleteDoc(doc(db, "interests", d.id)); });
      const iq2 = query(collection(db, "interests"), where("senderId", "==", otherUserId), where("receiverId", "==", myId));
      const iSnap2 = await getDocs(iq2);
      iSnap2.forEach(async (d) => { await deleteDoc(doc(db, "interests", d.id)); });
      
      const convId = getConversationId(myId, otherUserId);
      const convRef = realtimeHelpers.ref(database, `conversations/${convId}`);
      const convSnap = await realtimeHelpers.get(convRef);
      if (convSnap.exists()) {
        const val = convSnap.val();
        const unmatchedBy = val.unmatchedBy || [];
        if (!unmatchedBy.includes(myId)) unmatchedBy.push(myId);
        await realtimeHelpers.update(convRef, { unmatchedBy });
      }
    } catch (err) {
      console.error("unmatchUser error:", err);
    }
  }, []);

  const startConversation = useCallback(async (userId: string, name: string, photo: string): Promise<string> => {
    const uid = getUid();
    const convId = getConversationId(uid, userId);
    const convRef = realtimeHelpers.ref(database, `conversations/${convId}`);
    const convSnap = await realtimeHelpers.get(convRef);

    if (!convSnap.exists()) {
      const u = auth.currentUser!;
      const participantData: Record<string, { name: string; photo: string }> = {
        [uid]: { name: u.displayName || "You", photo: u.photoURL || "" },
        [userId]: { name, photo },
      };

      const timestamp = Date.now();
      await realtimeHelpers.set(convRef, {
        participants: [uid, userId],
        participantData,
        lastMessage: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return convId;
  }, []);

  const startAndMessageConversation = useCallback(async (userId: string, name: string, photo: string, initialMessage: string): Promise<string> => {
    const convId = await startConversation(userId, name, photo);
    const uid = getUid();
    
    const messagesRef = realtimeHelpers.ref(database, `messages/${convId}`);
    const snap = await realtimeHelpers.get(messagesRef);
    const raw = snap.val() || {};
    const hasInitial = Object.values(raw).some((m: any) => m.text === initialMessage);
    if (!hasInitial) {
      const timestamp = Date.now();
      const newMsgRef = realtimeHelpers.push(messagesRef);
      await realtimeHelpers.set(newMsgRef, {
        senderId: uid,
        text: initialMessage,
        timestamp: timestamp,
        status: "sent",
        deleted: false,
        deletedForEveryone: false,
        deletedForMe: [],
        edited: false,
      });

      const convRef = realtimeHelpers.ref(database, `conversations/${convId}`);
      await realtimeHelpers.update(convRef, {
        lastMessage: {
          text: initialMessage,
          senderId: uid,
          timestamp: timestamp,
          status: "sent",
        },
        updatedAt: timestamp,
      });

      const u = auth.currentUser!;
      await addDoc(collection(db, "notifications"), {
        receiverId: userId,
        text: `${u.displayName || "You"}: ${initialMessage.substring(0, 80)}`,
        type: "chat_message",
        read: false,
        createdAt: timestamp,
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
