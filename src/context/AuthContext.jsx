import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../service/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const fullUser = {
                            uid: firebaseUser.uid,
                            id: firebaseUser.uid,
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
                // Keep local state if logged in via custom delivery partner session
                const saved = localStorage.getItem('earthbasket_user');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (!parsed.isFirebaseAuth) {
                        return;
                    }
                }
                setCurrentUser(null);
                localStorage.removeItem('earthbasket_user');
            }
        });

        return () => unsubscribe();
    }, []);

    // 1. Sign In / Login (Supports Email or Username for Delivery Partners)
    const loginWithFirebase = async (identifier, password, requestedRole = 'user') => {
        const cleanIdentifier = identifier.toLowerCase().trim();

        // Admin email validation check
        if (requestedRole === 'admin' && cleanIdentifier !== ADMIN_EMAIL.toLowerCase()) {
            throw new Error('Unauthorized: This email address is not permitted for Admin login.');
        }

        let targetEmail = cleanIdentifier;

        // --- DELIVERY PARTNER / USERNAME RESOLUTION LOGIC ---
        if (requestedRole === 'delivery' || !cleanIdentifier.includes('@')) {
            const usersRef = collection(db, 'users');

            // Strategy A: Query Firestore by 'username'
            const usernameQuery = query(usersRef, where('username', '==', cleanIdentifier));
            let querySnapshot = await getDocs(usernameQuery);

            if (!querySnapshot.empty) {
                const partnerDoc = querySnapshot.docs[0].data();

                // If created with direct custom credentials (without Firebase Auth)
                if (partnerDoc.password && partnerDoc.password === password) {
                    const partnerUser = {
                        uid: partnerDoc.id || partnerDoc.uid || `DP-${Date.now()}`,
                        id: partnerDoc.id || partnerDoc.uid,
                        name: partnerDoc.name || cleanIdentifier,
                        username: partnerDoc.username,
                        email: partnerDoc.email || `${cleanIdentifier}@earthbasket.com`,
                        role: 'delivery',
                        isFirebase: false
                    };
                    setCurrentUser(partnerUser);
                    localStorage.setItem('earthbasket_user', JSON.stringify(partnerUser));
                    return partnerUser;
                }

                // If partner doc has an associated email for Firebase Auth
                if (partnerDoc.email) {
                    targetEmail = partnerDoc.email.toLowerCase();
                }
            } else {
                // Strategy B: Fallback check for email generated format (username@earthbasket.com)
                if (!cleanIdentifier.includes('@')) {
                    targetEmail = `${cleanIdentifier}@earthbasket.com`;
                }
            }
        }

        // --- FIREBASE AUTHENTICATION ---
        try {
            const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
            const fbUser = userCredential.user;

            // Fetch stored profile & role from Firestore
            const userDocRef = doc(db, 'users', fbUser.uid);
            let userDoc = await getDoc(userDocRef);

            let userRole = requestedRole;
            let displayName = fbUser.displayName || 'User';

            if (cleanIdentifier === ADMIN_EMAIL.toLowerCase()) {
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
                isFirebase: true,
                isFirebaseAuth: true
            };

            // Sync user record in Firestore
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
        } catch (error) {
            // Secondary Fallback: Direct Firestore lookup by username & password if Firebase Auth fails
            if (!cleanIdentifier.includes('@')) {
                const usersRef = collection(db, 'users');
                const directQuery = query(
                    usersRef,
                    where('username', '==', cleanIdentifier),
                    where('password', '==', password)
                );
                const directSnap = await getDocs(directQuery);

                if (!directSnap.empty) {
                    const docData = directSnap.docs[0].data();
                    const partnerUser = {
                        uid: docData.id || docData.uid,
                        id: docData.id || docData.uid,
                        name: docData.name,
                        username: docData.username,
                        role: 'delivery',
                        isFirebase: false
                    };
                    setCurrentUser(partnerUser);
                    localStorage.setItem('earthbasket_user', JSON.stringify(partnerUser));
                    return partnerUser;
                }
            }
            throw error;
        }
    };

    // 2. Register / Sign Up
    const registerWithFirebase = async (fullName, email, password, role = 'user', phone = '') => {
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
            phone: phone,
            role: role,
            isFirebase: true,
            isFirebaseAuth: true
        };

        // Save profile to Firestore 'users' collection
        await setDoc(doc(db, 'users', fbUser.uid), {
            uid: fbUser.uid,
            name: fullName,
            email: fbUser.email,
            phone: phone,
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