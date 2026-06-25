import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import {
  collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  onSnapshot, orderBy, limit, writeBatch, startAfter,
} from "firebase/firestore";
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
  otherTyping: boolean;
  hasOlderMessages: boolean;
  loadingOlderMessages: boolean;
  loadOlderMessages: () => Promise<void>;
  setTyping: () => void;
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
    if (!snap.empty) return snap.docs[0].id;
    return null;
  } catch (err) {
    console.error("lookupMyProfileId error:", err);
    return null;
  }
};

const PAGE_SIZE = 20;

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
  const [otherTyping, setOtherTyping] = useState(false);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);
  const profileUnsubs = useRef<Map<string, () => void>>(new Map());
  const unsubNewMessages = useRef<(() => void) | null>(null);
  const unsubTyping = useRef<(() => void) | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);
  const newestTimestampRef = useRef<number>(0);
  const oldestTimestampRef = useRef<number>(0);

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
        setHasOlderMessages(true);
        if (!initialLoadDone.current) { setLoading(false); initialLoadDone.current = true; }
      }
    });
    return () => unsub();
  }, []);

  // Listen for conversations from Firestore
  useEffect(() => {
    if (!myProfileIdState) {
      if (!currentUser && !initialLoadDone.current) { setLoading(false); initialLoadDone.current = true; }
      if (!currentUser) { setConversations([]); setMessages([]); }
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", myProfileIdState)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Conversation[] = snapshot.docs.map((d) => {
        const data = d.data();
        const lastMsg = data.lastMessage ?? null;
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
          unreadCount: data.unreadCount?.[myProfileIdState] || 0,
        };
      });

      const filteredList = list.filter((c) => {
        if (c.unmatchedBy?.includes(myProfileIdState || "")) return false;
        const clearedAt = c.clearedAt?.[myProfileIdState || ""] || 0;
        const lastMsgTime = c.lastMessage?.timestamp || 0;
        if (lastMsgTime > 0 && lastMsgTime <= clearedAt) return false;
        return true;
      });

      filteredList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      setConversations(filteredList);
      const totalUnread = filteredList.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setGlobalUnreadCount(totalUnread);
      if (!initialLoadDone.current) { setLoading(false); initialLoadDone.current = true; }
    }, (error) => {
      console.error("Conversations listener error:", error);
      if (!initialLoadDone.current) { setLoading(false); initialLoadDone.current = true; }
    });

    return () => unsub();
  }, [myProfileIdState, currentUser]);

  // Live profiles listener
  useEffect(() => {
    const current = profileUnsubs.current;
    const activeIds = new Set<string>();
    conversations.forEach((c) =>
      c.participants.forEach((p) => { if (p !== myProfileIdState) activeIds.add(p); })
    );

    current.forEach((unsub, pid) => {
      if (!activeIds.has(pid)) { unsub(); current.delete(pid); }
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

    return () => { current.forEach((unsub) => unsub()); current.clear(); };
  }, [conversations, myProfileIdState]);

  // Mark messages as "read" when active conversation changes and messages are loaded
  const markMessagesAsRead = useCallback(async () => {
    if (!activeConversationId) return;
    const myId = myProfileIdRef.current;
    if (!myId) return;
    const conv = conversations.find(c => c.id === activeConversationId);
    const otherId = conv?.participants.find(p => p !== myId);
    if (!otherId) return;
    try {
      const messagesRef = collection(db, "conversations", activeConversationId, "messages");
      const q = query(messagesRef, where("senderId", "==", otherId), where("status", "in", ["sent", "delivered"]));
      const snap = await getDocs(q);
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { status: "read" }));
      await batch.commit();
    } catch {}
  }, [activeConversationId, conversations]);

  // Load initial messages (last PAGE_SIZE) + listen for new messages
  useEffect(() => {
    if (!currentUser || !activeConversationId) {
      if (unsubNewMessages.current) { unsubNewMessages.current(); unsubNewMessages.current = null; }
      setMessages([]);
      setHasOlderMessages(true);
      setInitialMessagesLoaded(false);
      newestTimestampRef.current = 0;
      oldestTimestampRef.current = 0;
      return;
    }

    const cid = activeConversationId;

    (async () => {
      try {
        const messagesRef = collection(db, "conversations", cid, "messages");
        const qLast = query(messagesRef, orderBy("timestamp", "desc"), limit(PAGE_SIZE));
        const snap = await getDocs(qLast);

        const list: ChatMessage[] = [];
        snap.docs.forEach((d) => {
          const val = d.data();
          list.unshift({
            id: d.id,
            senderId: val.senderId ?? "",
            text: val.text ?? "",
            timestamp: val.timestamp ?? null,
            status: val.status ?? "sent",
            deleted: val.deleted ?? false,
            deletedForEveryone: val.deletedForEveryone ?? false,
            deletedForMe: val.deletedForMe ?? [],
            edited: val.edited ?? false,
          });
        });

        // Mark received messages as delivered
        const delBatch = writeBatch(db);
        snap.docs.forEach((d) => {
          const val = d.data();
          if (val.senderId !== myProfileIdRef.current && !val.deleted && !val.deletedForEveryone && val.status === "sent") {
            delBatch.update(d.ref, { status: "delivered" });
          }
        });
        await delBatch.commit().catch(() => {});

        const conv = conversations.find((c) => c.id === cid);
        const clearedAt = conv?.clearedAt?.[myProfileIdRef.current || ""] || 0;
        const filtered = list.filter((m) => {
          if (m.deletedForMe?.includes(myProfileIdRef.current || "")) return false;
          if (m.timestamp && m.timestamp < clearedAt) return false;
          return true;
        });

        setMessages(filtered);
        setInitialMessagesLoaded(true);

        if (filtered.length > 0) {
          newestTimestampRef.current = filtered[filtered.length - 1].timestamp || 0;
          oldestTimestampRef.current = filtered[0].timestamp || 0;
        } else {
          newestTimestampRef.current = 0;
          oldestTimestampRef.current = 0;
        }

        setHasOlderMessages(filtered.length >= PAGE_SIZE);

        // Mark other user's messages as read
        markMessagesAsRead();

        // Set up listener for new messages after newestTimestamp
        if (unsubNewMessages.current) unsubNewMessages.current();

        const qNew = newestTimestampRef.current > 0
          ? query(messagesRef, orderBy("timestamp", "asc"), startAfter(newestTimestampRef.current))
          : query(messagesRef, orderBy("timestamp", "asc"));

        unsubNewMessages.current = onSnapshot(qNew, (newSnap) => {
          newSnap.docChanges().forEach((change) => {
            if (change.type === "added") {
              const val = change.doc.data();
              const msg: ChatMessage = {
                id: change.doc.id,
                senderId: val.senderId ?? "",
                text: val.text ?? "",
                timestamp: val.timestamp ?? null,
                status: val.status ?? "sent",
                deleted: val.deleted ?? false,
                deletedForEveryone: val.deletedForEveryone ?? false,
                deletedForMe: val.deletedForMe ?? [],
                edited: val.edited ?? false,
              };

              if (msg.senderId !== myProfileIdRef.current && !msg.deleted && !msg.deletedForEveryone) {
                updateDoc(change.doc.ref, { status: "read" }).catch(() => {});
              }

              setMessages((prev) => {
                if (prev.some((p) => p.id === msg.id)) return prev;
                const copy = [...prev, msg];
                if (newestTimestampRef.current < (msg.timestamp || 0)) {
                  newestTimestampRef.current = msg.timestamp || 0;
                }
                return copy;
              });
            }
          });
        });
      } catch (err) {
        console.error("Error loading initial messages:", err);
        setInitialMessagesLoaded(true);
      }
    })();

    return () => {
      if (unsubNewMessages.current) { unsubNewMessages.current(); unsubNewMessages.current = null; }
    };
  }, [currentUser, activeConversationId, conversations, markMessagesAsRead]);

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(async () => {
    if (loadingOlderMessages || !hasOlderMessages || !activeConversationId || !oldestTimestampRef.current) return;
    setLoadingOlderMessages(true);
    try {
      const messagesRef = collection(db, "conversations", activeConversationId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "desc"), startAfter(oldestTimestampRef.current), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      if (snap.empty) {
        setHasOlderMessages(false);
      } else {
        const older: ChatMessage[] = [];
        snap.docs.forEach((d) => {
          const val = d.data();
          older.unshift({
            id: d.id,
            senderId: val.senderId ?? "",
            text: val.text ?? "",
            timestamp: val.timestamp ?? null,
            status: val.status ?? "sent",
            deleted: val.deleted ?? false,
            deletedForEveryone: val.deletedForEveryone ?? false,
            deletedForMe: val.deletedForMe ?? [],
            edited: val.edited ?? false,
          });
        });

        const conv = conversations.find((c) => c.id === activeConversationId);
        const clearedAt = conv?.clearedAt?.[myProfileIdRef.current || ""] || 0;
        const filteredOlder = older.filter((m) => {
          if (m.deletedForMe?.includes(myProfileIdRef.current || "")) return false;
          if (m.timestamp && m.timestamp < clearedAt) return false;
          return true;
        });

        setMessages((prev) => [...filteredOlder, ...prev]);
        if (older.length > 0) {
          oldestTimestampRef.current = older[0].timestamp || 0;
        }
        setHasOlderMessages(older.length >= PAGE_SIZE);
      }
    } catch (err) {
      console.error("loadOlderMessages error:", err);
    } finally {
      setLoadingOlderMessages(false);
    }
  }, [activeConversationId, conversations, hasOlderMessages, loadingOlderMessages]);

  // Typing indicator listener
  useEffect(() => {
    if (!myProfileIdState || !activeConversationId) {
      if (unsubTyping.current) { unsubTyping.current(); unsubTyping.current = null; }
      setOtherTyping(false);
      return;
    }

    const typingRef = doc(db, "conversations", activeConversationId);
    unsubTyping.current = onSnapshot(typingRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const typing = data.typing || {};
      const isOtherTyping = Object.keys(typing).some(
        (key) => key !== myProfileIdState && typing[key] === true
      );
      setOtherTyping(isOtherTyping);
    });

    return () => {
      if (unsubTyping.current) { unsubTyping.current(); unsubTyping.current = null; }
      setOtherTyping(false);
    };
  }, [myProfileIdState, activeConversationId]);

  const setTyping = useCallback(() => {
    if (!activeConversationId) return;
    const uid = getUid();
    const convRef = doc(db, "conversations", activeConversationId);

    updateDoc(convRef, { [`typing.${uid}`]: true }).catch(() => {});

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      updateDoc(convRef, { [`typing.${uid}`]: false }).catch(() => {});
    }, 3000);
  }, [activeConversationId]);

  // Reset unread count when opening a conversation
  const resetUnreadCount = useCallback(async () => {
    if (!activeConversationId) return;
    const uid = getUid();
    const convRef = doc(db, "conversations", activeConversationId);
    await updateDoc(convRef, { [`unreadCount.${uid}`]: 0 }).catch(() => {});

    setConversations((prev) =>
      prev.map((c) => c.id === activeConversationId ? { ...c, unreadCount: 0 } : c)
    );
    setGlobalUnreadCount((prev) => Math.max(0, prev - (conversations.find(c => c.id === activeConversationId)?.unreadCount || 0)));
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      resetUnreadCount();
    }
  }, [activeConversationId, messages.length, resetUnreadCount]);

  const sendMessage = useCallback(async (text: string) => {
    if (!activeConversationId || !text.trim()) return;
    setSending(true);
    try {
      const uid = getUid();
      const timestamp = Date.now();
      const messagesRef = collection(db, "conversations", activeConversationId, "messages");
      const newMsgRef = doc(messagesRef);
      await setDoc(newMsgRef, {
        senderId: uid,
        text: text.trim(),
        timestamp: timestamp,
        status: "sent",
        deleted: false,
        deletedForEveryone: false,
        deletedForMe: [],
        edited: false,
      });

      const conv = conversations.find((c) => c.id === activeConversationId);
      const receiverId = conv?.participants.find((p) => p !== uid);

      const convRef = doc(db, "conversations", activeConversationId);
      const convSnap = await getDoc(convRef);
      const updateData: any = {
        lastMessage: { text: text.trim(), senderId: uid, timestamp, status: "sent" },
        updatedAt: timestamp,
        [`typing.${uid}`]: false,
      };
      if (receiverId) {
        const receiverUnread = convSnap.exists() ? (convSnap.data().unreadCount?.[receiverId] || 0) : 0;
        updateData[`unreadCount.${receiverId}`] = receiverUnread + 1;
      }
      await updateDoc(convRef, updateData);
    } catch (err) {
      console.error("sendMessage error:", err);
    } finally {
      setSending(false);
    }
  }, [activeConversationId, conversations]);

  const deleteMessage = useCallback(async (messageId: string, forEveryone: boolean) => {
    if (!activeConversationId) return;
    try {
      const myId = getUid();
      const msgRef = doc(db, "conversations", activeConversationId, "messages", messageId);
      if (forEveryone) {
        await updateDoc(msgRef, { deletedForEveryone: true });
      } else {
        const snap = await getDoc(msgRef);
        if (snap.exists()) {
          const val = snap.data();
          const deletedForMe = val.deletedForMe || [];
          if (!deletedForMe.includes(myId)) deletedForMe.push(myId);
          await updateDoc(msgRef, { deletedForMe });
        }
      }
    } catch (err) { console.error("deleteMessage error:", err); }
  }, [activeConversationId]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!activeConversationId || !newText.trim()) return;
    try {
      const msgRef = doc(db, "conversations", activeConversationId, "messages", messageId);
      await updateDoc(msgRef, { text: newText.trim(), edited: true });
    } catch (err) { console.error("editMessage error:", err); }
  }, [activeConversationId]);

  const toggleBlockChat = useCallback(async (conversationId: string, block: boolean) => {
    try {
      const myId = getUid();
      const convRef = doc(db, "conversations", conversationId);
      const snap = await getDoc(convRef);
      if (snap.exists()) {
        const val = snap.data();
        let blockedBy = val.blockedBy || [];
        if (block) { if (!blockedBy.includes(myId)) blockedBy.push(myId); }
        else { blockedBy = blockedBy.filter((b: string) => b !== myId); }
        await updateDoc(convRef, { blockedBy });
      }
    } catch (err) { console.error("toggleBlockChat error:", err); }
  }, []);

  const clearChat = useCallback(async (conversationId: string) => {
    try {
      const myId = getUid();
      const convRef = doc(db, "conversations", conversationId);
      await updateDoc(convRef, { [`clearedAt.${myId}`]: Date.now() });
    } catch (err) { console.error("clearChat error:", err); }
  }, []);

  const unmatchUser = useCallback(async (otherUserId: string) => {
    try {
      const myId = getUid();
      const convId = getConversationId(myId, otherUserId);

      const [iSnap1, iSnap2, nSnap1, nSnap2] = await Promise.all([
        getDocs(query(collection(db, "interests"), where("senderId", "==", myId), where("receiverId", "==", otherUserId))),
        getDocs(query(collection(db, "interests"), where("senderId", "==", otherUserId), where("receiverId", "==", myId))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", myId), where("receiverId", "==", otherUserId))),
        getDocs(query(collection(db, "notifications"), where("senderId", "==", otherUserId), where("receiverId", "==", myId))),
      ]);

      const batch = writeBatch(db);
      iSnap1.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      iSnap2.docs.forEach(d => batch.delete(doc(db, "interests", d.id)));
      nSnap1.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));
      nSnap2.docs.forEach(d => batch.delete(doc(db, "notifications", d.id)));
      batch.delete(doc(db, "conversations", convId));

      const msgSnap = await getDocs(collection(db, "conversations", convId, "messages"));
      msgSnap.docs.forEach(d => batch.delete(doc(db, "conversations", convId, "messages", d.id)));

      await batch.commit();
    } catch (err) { console.error("unmatchUser error:", err); }
  }, []);

  const startConversation = useCallback(async (userId: string, name: string, photo: string): Promise<string> => {
    const uid = getUid();
    const convId = getConversationId(uid, userId);
    const convRef = doc(db, "conversations", convId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      let myName = auth.currentUser?.displayName || "You";
      let myPhoto = auth.currentUser?.photoURL || "";
      const myLive = liveProfiles[uid];
      if (myLive) { myName = myLive.name; myPhoto = myLive.photo; }
      const participantData: Record<string, { name: string; photo: string }> = {
        [uid]: { name: myName, photo: myPhoto },
        [userId]: { name, photo },
      };
      const timestamp = Date.now();
      await setDoc(convRef, {
        participants: [uid, userId],
        participantData,
        lastMessage: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        blockedBy: [],
        clearedAt: {},
        unmatchedBy: [],
        unreadCount: { [uid]: 0, [userId]: 0 },
        typing: {},
      });
    }
    return convId;
  }, [liveProfiles]);

  const startAndMessageConversation = useCallback(async (userId: string, name: string, photo: string, initialMessage: string): Promise<string> => {
    const convId = await startConversation(userId, name, photo);
    const uid = getUid();
    const timestamp = Date.now();

    const messagesRef = collection(db, "conversations", convId, "messages");
    const newMsgRef = doc(messagesRef);
    await setDoc(newMsgRef, {
      senderId: uid,
      text: initialMessage,
      timestamp,
      status: "sent",
      deleted: false, deletedForEveryone: false, deletedForMe: [], edited: false,
    });

    const convRef = doc(db, "conversations", convId);
    await updateDoc(convRef, {
      lastMessage: { text: initialMessage, senderId: uid, timestamp, status: "sent" },
      updatedAt: timestamp,
      [`unreadCount.${userId}`]: 1,
      [`typing.${uid}`]: false,
    });

    const mySenderData = liveProfiles[uid];
    const mySenderName = mySenderData?.name || auth.currentUser?.displayName || "Someone";
    await addDoc(collection(db, "notifications"), {
      receiverId: userId,
      text: `${mySenderName}: ${initialMessage.substring(0, 80)}`,
      type: "chat_message", read: false, createdAt: timestamp,
    }).catch(() => {});
    return convId;
  }, [startConversation, liveProfiles]);

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
        otherTyping,
        hasOlderMessages,
        loadingOlderMessages,
        loadOlderMessages,
        setTyping,
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
