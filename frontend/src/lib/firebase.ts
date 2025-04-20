// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfq1uBQtepiGiIMLDAW5u48mKJ_FVL3Ag",
  authDomain: "repeticode.firebaseapp.com",
  projectId: "repeticode",
  storageBucket: "repeticode.firebasestorage.app",
  messagingSenderId: "703738252578",
  appId: "1:703738252578:web:f5a50deb1824befdc6697b",
  measurementId: "G-2J23N58T0R"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.onAuthStateChanged(user => {
  // if the user is not logged in, redirect back to login page
  if (!user) {
    window.location.pathname = "login";
  }
})

export {
  app,
  auth,
};
