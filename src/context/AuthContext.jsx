// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../service/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('freshcart_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser && currentUser?.isFirebase) {
                setCurrentUser(null);
                localStorage.removeItem('freshcart_user');
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 1. Sign In / Login Function
    const loginWithFirebase = async (email, password, role = 'user') => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        const userObj = {
            uid: fbUser.uid,
            name: fbUser.displayName || (role === 'admin' ? 'System Administrator' : 'Customer'),
            email: fbUser.email,
            role: role,
            isFirebase: true
        };

        setCurrentUser(userObj);
        localStorage.setItem('freshcart_user', JSON.stringify(userObj));
        return userObj;
    };

    // 2. Register / Sign Up Function
    const registerWithFirebase = async (fullName, email, password, role = 'user') => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Attach user display name to Firebase profile
        await updateProfile(fbUser, { displayName: fullName });

        const userObj = {
            uid: fbUser.uid,
            name: fullName,
            email: fbUser.email,
            role: role,
            isFirebase: true
        };

        setCurrentUser(userObj);
        localStorage.setItem('freshcart_user', JSON.stringify(userObj));
        return userObj;
    };

    // 3. Logout Function
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error("Signout error:", e);
        }
        setCurrentUser(null);
        localStorage.removeItem('freshcart_user');
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            user: currentUser,
            loginWithFirebase,
            login: loginWithFirebase,
            registerWithFirebase,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);