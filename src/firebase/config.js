import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK3N2q4vqovdp6iYq91x_XbgabnEfPV48",
  authDomain: "all-my-app-8e0fc.firebaseapp.com",
  projectId: "all-my-app-8e0fc",
  storageBucket: "all-my-app-8e0fc.firebasestorage.app",
  messagingSenderId: "419415963549",
  appId: "1:419415963549:web:25ebee4d1c058de69b2174",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
