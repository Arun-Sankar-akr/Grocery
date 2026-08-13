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

// Set the ONLY email allowed to act as Admin
export const ADMIN_EMAIL = 'arunsankarram@gmail.com';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('earthbasket_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser && currentUser?.isFirebase) {
                setCurrentUser(null);
                localStorage.removeItem('earthbasket_user');
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 1. Sign In / Login Function
    const loginWithFirebase = async (email, password, requestedRole = 'user') => {
        // Enforce single-admin policy
        if (requestedRole === 'admin' && email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            throw new Error('Unauthorized: This email address is not permitted for Admin login.');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Auto-assign role based on email check
        const finalRole = fbUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

        const userObj = {
            uid: fbUser.uid,
            name: fbUser.displayName || (finalRole === 'admin' ? 'System Administrator' : 'Customer'),
            email: fbUser.email,
            role: finalRole,
            isFirebase: true
        };

        setCurrentUser(userObj);
        localStorage.setItem('earthbasket_user', JSON.stringify(userObj));
        return userObj;
    };

    // 2. Register / Sign Up Function
    const registerWithFirebase = async (fullName, email, password) => {
        // Prevent anyone from registering as an admin
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            throw new Error('Admin account already exists and cannot be re-registered.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        await updateProfile(fbUser, { displayName: fullName });

        const userObj = {
            uid: fbUser.uid,
            name: fullName,
            email: fbUser.email,
            role: 'user', // Always register as 'user'
            isFirebase: true
        };

        setCurrentUser(userObj);
        localStorage.setItem('earthbasket_user', JSON.stringify(userObj));
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
        localStorage.removeItem('earthbasket_user');
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