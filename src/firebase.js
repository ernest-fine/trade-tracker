// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAE700ZVuvygfyCsb_KMb4lcYGsKeWdFmw",
  authDomain: "trade-tracker-e79fe.firebaseapp.com",
  projectId: "trade-tracker-e79fe",
  storageBucket: "trade-tracker-e79fe.firebasestorage.app",
  messagingSenderId: "7025264467",
  appId: "1:7025264467:web:92b027386c3a0624ae43a6",
  measurementId: "G-HC3DYE5Z4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);