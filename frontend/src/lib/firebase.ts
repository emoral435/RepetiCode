import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfq1uBQtepiGiIMLDAW5u48mKJ_FVL3Ag",
  authDomain: "repeticode.firebaseapp.com",
  projectId: "repeticode",
  storageBucket: "repeticode.firebasestorage.app",
  messagingSenderId: "703738252578",
  appId: "1:703738252578:web:f5a50deb1824befdc6697b",
  measurementId: "G-2J23N58T0R"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);