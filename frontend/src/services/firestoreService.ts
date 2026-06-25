import {
  doc, updateDoc, setDoc, getDoc, collection, query, where, getDocs,
  writeBatch, getCountFromServer, serverTimestamp, addDoc, deleteDoc,
  onSnapshot, orderBy, limit, increment, arrayUnion, arrayRemove, collectionGroup
} from "firebase/firestore";
import type { Unsubscribe, DocumentSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "../config/firebase";

export const fsHelpers = {
  docRef: (path: string, ...segments: string[]) => doc(db, path, ...segments),
  collectionRef: (path: string) => collection(db, path),
  getDoc: (path: string, ...segments: string[]) => getDoc(doc(db, path, ...segments)),
  setDoc: (path: string, id: string, data: any) => setDoc(doc(db, path, id), data, { merge: false }),
  setDocMerge: (path: string, id: string, data: any) => setDoc(doc(db, path, id), data, { merge: true }),
  updateDoc: (path: string, id: string, data: any) => updateDoc(doc(db, path, id), data),
  deleteDoc: (path: string, id: string) => deleteDoc(doc(db, path, id)),
  addDoc: (path: string, data: any) => addDoc(collection(db, path), data),
  getDocs: (path: string) => getDocs(collection(db, path)),
  queryByField: (path: string, field: string, value: any) => getDocs(query(collection(db, path), where(field, "==", value))),
  queryByFields: (path: string, ...conditions: [string, any][]) => {
    const constraints = conditions.map(([f, v]) => where(f, "==", v));
    return getDocs(query(collection(db, path), ...constraints));
  },
  onSnapshot: (path: string, id: string, callback: (doc: DocumentSnapshot) => void): Unsubscribe => {
    return onSnapshot(doc(db, path, id), callback);
  },
  onCollectionSnapshot: (path: string, callback: (snap: QuerySnapshot) => void): Unsubscribe => {
    return onSnapshot(collection(db, path), callback);
  },
  onQuerySnapshot: (path: string, field: string, value: any, callback: (snap: QuerySnapshot) => void): Unsubscribe => {
    return onSnapshot(query(collection(db, path), where(field, "==", value)), callback);
  },
  batch: () => writeBatch(db),
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
};

export const docToData = (snap: DocumentSnapshot): any => {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const collectionToArray = (snap: QuerySnapshot): any[] => {
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
