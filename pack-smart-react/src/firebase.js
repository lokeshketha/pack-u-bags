import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYOePbhiKK3AC2xDpAapdCwFJze4NHyuU",
  authDomain: "pack-u-bag.firebaseapp.com",
  projectId: "pack-u-bag",
  storageBucket: "pack-u-bag.firebasestorage.app",
  messagingSenderId: "2452492503",
  appId: "1:2452492503:web:be7425e1c5e61eeabf6092",
  measurementId: "G-7FR4L15Z7Z"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
