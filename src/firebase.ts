import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  increment,
  writeBatch
} from "firebase/firestore";

// Config from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBLGypBF-bB08oWTo54KQwrhgRlmDbqq-A",
  authDomain: "industrious-camera-h8gvj.firebaseapp.com",
  projectId: "industrious-camera-h8gvj",
  storageBucket: "industrious-camera-h8gvj.firebasestorage.app",
  messagingSenderId: "541840650751",
  appId: "1:541840650751:web:6aca26e014930057d1f7ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Firestore capabilities
export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  writeBatch
};

export type { FirebaseUser };
