// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// We will add Firebase Auth and Firestore here later when needed!

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYOePbhiKK3AC2xDpAapdCwFJze4NHyuU",
  authDomain: "pack-u-bag.firebaseapp.com",
  projectId: "pack-u-bag",
  storageBucket: "pack-u-bag.firebasestorage.app",
  messagingSenderId: "2452492503",
  appId: "1:2452492503:web:be7425e1c5e61eeabf6092",
  measurementId: "G-7FR4L15Z7Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Export the app and auth instances
export { app, auth };
