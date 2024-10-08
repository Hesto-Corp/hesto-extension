import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3xPczmlYnD9cTqrcbbF8GmDB1MGq-OgQ",
  authDomain: "hesto-af9e3.firebaseapp.com",
  projectId: "hesto-af9e3",
  storageBucket: "hesto-af9e3.appspot.com",
  messagingSenderId: "1026127770435",
  appId: "1:1026127770435:web:64cf3e733d4c8fcb2675f6",
  measurementId: "G-XE7SVWCX91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
