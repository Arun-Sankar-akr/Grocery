import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../service/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const ADMIN_EMAIL = 'arunsankarram@gmail.com';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('earthbasket_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch full profile from Firestore users collection
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const fullUser = {
                            uid: firebaseUser.uid,
                            id: firebaseUser.uid, // Unified ID field for delivery assignedToId
                            name: userData.name || firebaseUser.displayName || 'Delivery Partner',
                            email: firebaseUser.email,
                            role: userData.role || 'user',
                            isFirebase: true
                        };
                        setCurrentUser(fullUser);
                        localStorage.setItem('earthbasket_user', JSON.stringify(fullUser));
                    }
                } catch (err) {
                    console.error("Error fetching user profile from Firestore:", err);
                }
            } else {
                setCurrentUser(null);
                localStorage.removeItem('earthbasket_user');
            }
        });

        return () => unsubscribe();
    }, []);

    // 1. Sign In / Login
    const loginWithFirebase = async (email, password, requestedRole = 'user') => {
        const cleanEmail = email.toLowerCase().trim();

        // Security check for Admin role only
        if (requestedRole === 'admin' && cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
            throw new Error('Unauthorized: This email address is not permitted for Admin login.');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Fetch stored role from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        let userDoc = await getDoc(userDocRef);

        let userRole = requestedRole;
        let displayName = fbUser.displayName || 'User';

        if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
            userRole = 'admin';
        } else if (userDoc.exists()) {
            const data = userDoc.data();
            userRole = data.role || requestedRole;
            displayName = data.name || displayName;
        }

        const userObj = {
            uid: fbUser.uid,
            id: fbUser.uid,
            name: displayName,
            email: fbUser.email,
            role: userRole,
            isFirebase: true
        };

        // Sync or create user record in Firestore
        await setDoc(userDocRef, {
            uid: fbUser.uid,
            name: userObj.name,
            email: userObj.email,
            role: userRole,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        setCurrentUser(userObj);
        localStorage.setItem('earthbasket_user', JSON.stringify(userObj));
        return userObj;
    };

    // 2. Register / Sign Up (Supports registering N Delivery Partners)
    const registerWithFirebase = async (fullName, email, password, role = 'user') => {
        const cleanEmail = email.toLowerCase().trim();

        if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
            throw new Error('Admin account already exists and cannot be re-registered.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        await updateProfile(fbUser, { displayName: fullName });

        const userObj = {
            uid: fbUser.uid,
            id: fbUser.uid,
            name: fullName,
            email: fbUser.email,
            role: role, // 'delivery' or 'user'
            isFirebase: true
        };

        // Save profile to Firestore 'users' collection
        await setDoc(doc(db, 'users', fbUser.uid), {
            uid: fbUser.uid,
            name: fullName,
            email: fbUser.email,
            role: role,
            createdAt: new Date().toISOString()
        });

        setCurrentUser(userObj);
        localStorage.setItem('earthbasket_user', JSON.stringify(userObj));
        return userObj;
    };

    // 3. Logout
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