import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyDYQEoW4OuFLeXfQwb1mKxJuWtuuHdqZYM",
  authDomain: "conecta-pecs.firebaseapp.com",
  projectId: "conecta-pecs",
  storageBucket: "conecta-pecs.firebasestorage.app",
  messagingSenderId: "942692339665",
  appId: "1:942692339665:web:335bb100b6fd5092ccdaf0",
  measurementId: "G-YKHCTWMRVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
