// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALx_vLgECF5HU-fkhywaNbOt-fUQHwWJg",
    authDomain: "ny-food-2025.firebaseapp.com",
    databaseURL: "https://ny-food-2025-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ny-food-2025",
    storageBucket: "ny-food-2025.firebasestorage.app",
    messagingSenderId: "526479609016",
    appId: "1:526479609016:web:3f64f88e5ce30cc152784d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
