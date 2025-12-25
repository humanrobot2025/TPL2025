import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDoc, onSnapshot, type Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function init() {
  if (db) return { app, db };
  try {
    const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
    const authDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
    const storageBucket = (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID;
    const appId = (import.meta as any).env?.VITE_FIREBASE_APP_ID;
    if (!apiKey || !projectId) return null;
    const cfg = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };
    app = initializeApp(cfg as any);
    db = getFirestore(app);
    return { app, db };
  } catch (err) {
    console.warn('Failed to initialize Firebase', err);
    return null;
  }
}

export async function setActiveFirebase(payload: any) {
  const ok = init(); if (!ok) return;
  try {
    const ACTIVE_DOC = doc(db!, 'live', 'active');
    await setDoc(ACTIVE_DOC, payload || {});
  } catch (e) {
    console.warn('Failed to set active in Firestore', e);
  }
}

export async function clearActiveFirebase() {
  const ok = init(); if (!ok) return;
  try {
    const ACTIVE_DOC = doc(db!, 'live', 'active');
    await deleteDoc(ACTIVE_DOC);
  } catch (e) {
    console.warn('Failed to clear active in Firestore', e);
  }
}

export async function getActiveFirebase() {
  const ok = init(); if (!ok) return null;
  try {
    const ACTIVE_DOC = doc(db!, 'live', 'active');
    const snap = await getDoc(ACTIVE_DOC);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
}

export function listenActiveFirebase(handler: (payload: any | null) => void) {
  const ok = init(); if (!ok) return { close: () => {} };
  const ACTIVE_DOC = doc(db!, 'live', 'active');
  const unsub = onSnapshot(ACTIVE_DOC, (snap) => {
    if (!snap.exists()) handler(null);
    else handler(snap.data());
  }, (err) => { console.warn('Firestore snapshot error', err); });
  return { close: unsub } as any;
}
