
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyDOgZWKRxI0JG4CFLilxLIonfjt-veNBjo",
  authDomain: "bookingwebsite-343a5.firebaseapp.com",
  projectId: "bookingwebsite-343a5",
  storageBucket: "bookingwebsite-343a5.appspot.com",
  messagingSenderId: "121840937290",
  appId: "1:121840937290:web:1ba5723cdc737b42e1f9b3",
  measurementId: "G-FPZZDS27RM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); 
const db = getFirestore(app);

export { auth, db };
