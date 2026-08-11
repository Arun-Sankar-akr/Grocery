// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAF95Qs_te2uFIXg8fvU57TrVpupaG5Hug",
    authDomain: "grocery-app-2k26.firebaseapp.com",
    projectId: "grocery-app-2k26",
    storageBucket: "grocery-app-2k26.firebasestorage.app",
    messagingSenderId: "590290573090",
    appId: "1:590290573090:web:86ef35894f8efddc50b77b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);