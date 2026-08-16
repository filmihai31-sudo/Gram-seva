import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  setLogLevel,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

// Suppress excessive connection debug warnings in offline/restricted network environments
try {
  setLogLevel('error');
} catch {
  // Ignore if unsupported
}

// Environment credentials or default fallback for dev/demo
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyOb2vW9ClhcsdQ8F4l6TtQKWReFGJf_10w",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "gram-seva-70.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "gram-seva-70",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "gram-seva-70.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "938644063975",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:938644063975:web:b62dbd3591d9f46ba60442",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-18KD8Y4M0S"
};

export function getActiveFirebaseConfig(): FirebaseCustomConfig {
  try {
    const saved = localStorage.getItem('gramseva_custom_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && !parsed.apiKey.includes('DemoKey') && parsed.projectId !== 'gram-seva-app') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to parse custom firebase config:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isFirebaseInitialized = false;

export function initOrUpdateFirebase(customConfig?: FirebaseCustomConfig): { success: boolean; error?: string } {
  const configToUse = customConfig || getActiveFirebaseConfig();
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp(configToUse);
    }
    
    // Initialize Firestore with force long polling & offline persistent local cache
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({})
      });
    } catch {
      try {
        db = getFirestore(app);
      } catch (innerErr) {
        console.warn("Firestore secondary init:", innerErr);
      }
    }

    isFirebaseInitialized = true;
    console.log("🔥 Firebase Firestore initialized with offline-resilient long polling!");
    return { success: true };
  } catch (error: any) {
    console.warn("⚠️ Firebase initializing in offline fallback mode:", error);
    isFirebaseInitialized = false;
    return { success: false, error: error?.message || String(error) };
  }
}

// Initial boot
initOrUpdateFirebase();

export { app, db, isFirebaseInitialized };

// Helper to safely execute Firestore operations with a timeout to prevent hanging UI
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 4000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout | number;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer as any);
      return res;
    }),
    timeoutPromise
  ]).catch((err) => {
    clearTimeout(timer as any);
    console.warn("Firestore operation timed out or failed gracefully:", err?.message || err);
    return fallback;
  });
}

export interface CloudWorker {
  id: string;
  name: string;
  shopName?: string;
  hindiName: string;
  category: string;
  customCategory?: string;
  phone: string;
  whatsapp: string;
  village: string;
  district: string;
  state: string;
  rating: number;
  jobsDone: number;
  experienceYears: number;
  isVerified: boolean;
  verificationStatus?: 'approved' | 'pending' | 'rejected';
  idNumber?: string;
  documentPhotoUrl?: string;
  avatarUrl: string;
  charges: string;
  skills: string[];
  mapAddress: string;
  lat?: number;
  lng?: number;
  createdAt?: string;
  reviewsCount?: number;
  userTags?: string[];
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

// Fetch workers from Firebase Firestore with graceful fallback
export async function fetchWorkersFromFirestore(): Promise<CloudWorker[]> {
  if (!db) {
    return [];
  }
  return withTimeout(
    (async () => {
      const workersRef = collection(db!, 'workers');
      const snapshot = await getDocs(workersRef);
      const result: CloudWorker[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CloudWorker;
        result.push({
          ...data,
          id: docSnap.id
        });
      });
      return result;
    })(),
    4000,
    []
  );
}

// Add worker to Firebase Firestore
export async function saveWorkerToFirestore(worker: Omit<CloudWorker, 'id'>): Promise<string> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const workersRef = collection(db, 'workers');
  const docRef = await addDoc(workersRef, {
    ...worker,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// Delete worker from Firestore
export async function deleteWorkerFromFirestore(workerId: string): Promise<void> {
  if (!db) return;
  try {
    const workerDocRef = doc(db, 'workers', workerId);
    await deleteDoc(workerDocRef);
  } catch (e) {
    console.warn("Could not delete from firestore:", e);
  }
}

// Update verification status in Firestore
export async function updateWorkerVerificationInFirestore(workerId: string, isVerified: boolean, status?: 'approved' | 'pending' | 'rejected'): Promise<void> {
  if (!db) return;
  try {
    const workerDocRef = doc(db, 'workers', workerId);
    await updateDoc(workerDocRef, { 
      isVerified, 
      verificationStatus: status || (isVerified ? 'approved' : 'pending') 
    });
  } catch (e) {
    console.warn("Could not update verification in firestore:", e);
  }
}

// Update worker rating & review count in Firestore
export async function updateWorkerRatingInFirestore(workerId: string, newRating: number, reviewsCount: number, userTags?: string[]): Promise<void> {
  if (!db) return;
  try {
    const workerDocRef = doc(db, 'workers', workerId);
    await updateDoc(workerDocRef, { 
      rating: newRating,
      reviewsCount: reviewsCount,
      userTags: userTags || []
    });
  } catch (e) {
    console.warn("Could not update rating in firestore:", e);
  }
}

// Update worker password in Firestore
export async function updateWorkerPasswordInFirestore(workerId: string, newPassword: string): Promise<void> {
  if (!db) return;
  try {
    const workerDocRef = doc(db, 'workers', workerId);
    await updateDoc(workerDocRef, { 
      password: newPassword
    });
  } catch (e) {
    console.warn("Could not update password in firestore:", e);
  }
}

// --- DYNAMIC CROWD-SOURCED DATA: Master Locations & Categories ---
export interface MasterLocation {
  id: string;
  state: string;
  district: string;
  village: string;
  status: 'approved' | 'pending_approval';
  createdAt?: string;
  requestedByPhone?: string;
}

export interface MasterCategory {
  id: string;
  categoryName: string;
  hindiName?: string;
  status: 'approved' | 'pending_approval';
  createdAt?: string;
}

// Fetch master locations from Firestore
export async function fetchMasterLocationsFromFirestore(): Promise<MasterLocation[]> {
  if (!db) {
    return [];
  }
  return withTimeout(
    (async () => {
      const ref = collection(db!, 'master_locations');
      const snapshot = await getDocs(ref);
      const result: MasterLocation[] = [];
      snapshot.forEach((docSnap) => {
        result.push({
          ...(docSnap.data() as Omit<MasterLocation, 'id'>),
          id: docSnap.id
        });
      });
      return result;
    })(),
    4000,
    []
  );
}

// Save master location to Firestore
export async function saveMasterLocationToFirestore(location: Omit<MasterLocation, 'id'>): Promise<string> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const ref = collection(db, 'master_locations');
  const docRef = await addDoc(ref, {
    ...location,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// Update master location full details in Firestore
export async function updateMasterLocationInFirestore(id: string, updates: Partial<Omit<MasterLocation, 'id'>>): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'master_locations', id);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.warn("Could not update location in firestore:", e);
  }
}

// Update master location status in Firestore
export async function updateMasterLocationStatusInFirestore(id: string, status: 'approved' | 'pending_approval'): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'master_locations', id);
    await updateDoc(docRef, { status });
  } catch (e) {
    console.warn("Could not update location status in firestore:", e);
  }
}

// Delete master location from Firestore
export async function deleteMasterLocationFromFirestore(id: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'master_locations', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn("Could not delete location from firestore:", e);
  }
}

// Fetch master categories from Firestore
export async function fetchMasterCategoriesFromFirestore(): Promise<MasterCategory[]> {
  if (!db) {
    return [];
  }
  return withTimeout(
    (async () => {
      const ref = collection(db!, 'master_categories');
      const snapshot = await getDocs(ref);
      const result: MasterCategory[] = [];
      snapshot.forEach((docSnap) => {
        result.push({
          ...(docSnap.data() as Omit<MasterCategory, 'id'>),
          id: docSnap.id
        });
      });
      return result;
    })(),
    4000,
    []
  );
}

// Save master category to Firestore
export async function saveMasterCategoryToFirestore(category: Omit<MasterCategory, 'id'>): Promise<string> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const ref = collection(db, 'master_categories');
  const docRef = await addDoc(ref, {
    ...category,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// Update master category status in Firestore
export async function updateMasterCategoryStatusInFirestore(id: string, status: 'approved' | 'pending_approval'): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'master_categories', id);
    await updateDoc(docRef, { status });
  } catch (e) {
    console.warn("Could not update category status in firestore:", e);
  }
}

// Delete master category from Firestore
export async function deleteMasterCategoryFromFirestore(id: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'master_categories', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn("Could not delete category from firestore:", e);
  }
}

