import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqfiNPrFsAPDddr8K3N03GXdXETc1XBjk",
  authDomain: "drumstory-80a8d.firebaseapp.com",
  projectId: "drumstory-80a8d",
  storageBucket: "drumstory-80a8d.firebasestorage.app",
  messagingSenderId: "216965839",
  appId: "1:216965839:web:e2150b626cb357d0e78dba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
