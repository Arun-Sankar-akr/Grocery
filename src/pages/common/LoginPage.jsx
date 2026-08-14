import React, { useState, useEffect } from 'react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, X, FileText } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../service/firebase';
import DeliveryPartnerApplicationModal from '../../components/LoginPage/DeliveryPartnerApplicationModal';
import './LoginPage.css';

export default function LoginPage({ onClose, onLoginSuccess }) {
    const { loginWithFirebase, registerWithFirebase, setCurrentUser } = useAuth();
    const [role, setRole] = useState('user');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);

    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [popup, setPopup] = useState({ visible: false, type: '', title: '', message: '' });
    const [countdown, setCountdown] = useState(null);

    // Handles notification countdown and triggers close/login callbacks instead of page reloads
    useEffect(() => {
        let timer;
        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        } else if (countdown === 0) {
            if (onLoginSuccess) onLoginSuccess();
            if (onClose) onClose();
        }
        return () => clearTimeout(timer);
    }, [countdown, onClose, onLoginSuccess]);

    const showNotification = (type, title, message, startCountdown = false) => {
        setPopup({ visible: true, type, title, message });

        if (startCountdown) {
            setCountdown(3);
        } else {
            setTimeout(() => {
                setPopup({ visible: false, type: '', title: '', message: '' });
            }, 3500);
        }
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setPopup({ visible: false, type: '', title: '', message: '' });
        setCountdown(null);
        if (newRole !== 'user') {
            setIsRegistering(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering && role === 'user') {
                if (!name.trim()) {
                    showNotification('error', 'Registration Failed', 'Please enter your full name.');
                    setLoading(false);
                    return;
                }
                if (!phone.trim()) {
                    showNotification('error', 'Registration Failed', 'Please enter your contact number.');
                    setLoading(false);
                    return;
                }
                await registerWithFirebase(name, identifier, password, role, phone);
                showNotification(
                    'success',
                    'Account Created!',
                    `Welcome, ${name}! Your Customer account is ready.`,
                    true
                );
            } else if (role === 'delivery') {
                // Firestore Delivery Authentication for Username/TempPassword
                const usersRef = collection(db, 'users');
                const cleanIdentifier = identifier.trim();

                const qUsername = query(
                    usersRef,
                    where('username', '==', cleanIdentifier),
                    where('tempPassword', '==', password.trim())
                );

                const qEmail = query(
                    usersRef,
                    where('email', '==', cleanIdentifier),
                    where('tempPassword', '==', password.trim())
                );

                let querySnapshot = await getDocs(qUsername);
                if (querySnapshot.empty) {
                    querySnapshot = await getDocs(qEmail);
                }

                if (querySnapshot.empty) {
                    await loginWithFirebase(identifier, password, role);
                } else {
                    let deliveryUserData = null;
                    querySnapshot.forEach((docSnap) => {
                        deliveryUserData = { id: docSnap.id, ...docSnap.data() };
                    });

                    if (deliveryUserData.status !== 'approved') {
                        showNotification('error', 'Login Failed', 'Your delivery application is pending approval.');
                        setLoading(false);
                        return;
                    }

                    // Save session & set auth state
                    if (setCurrentUser) {
                        setCurrentUser(deliveryUserData);
                    }
                    localStorage.setItem('deliveryUser', JSON.stringify(deliveryUserData));
                }

                showNotification(
                    'success',
                    'Login Successful!',
                    'Welcome back, Delivery Partner!',
                    true
                );
            } else {
                await loginWithFirebase(identifier, password, role);

                showNotification(
                    'success',
                    'Login Successful!',
                    `Welcome back! Logged in as ${role === 'admin' ? 'Admin' : 'Customer'}.`,
                    true
                );
            }
        } catch (err) {
            let errorMsg = 'Authentication failed. Please check your credentials.';

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                errorMsg = 'Invalid credentials. Please check your username/email and password.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMsg = 'An account with this email address already exists.';
            } else if (err.code === 'auth/weak-password') {
                errorMsg = 'Password should be at least 6 characters long.';
            } else if (err.message) {
                errorMsg = err.message;
            }

            showNotification('error', isRegistering ? 'Registration Failed' : 'Login Failed', errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            {popup.visible && (
                <div className={`login-popup-toast ${popup.type}`}>
                    {popup.type === 'success' ? (
                        <CheckCircle2 size={24} color="#059669" />
                    ) : (
                        <AlertCircle size={24} color="#dc2626" />
                    )}
                    <div style={{ flex: 1 }}>
                        <h4 className="login-popup-title">{popup.title}</h4>
                        <p className="login-popup-desc">{popup.message}</p>

                        {countdown !== null && (
                            <div className="redirect-countdown-bar">
                                <span>Redirecting in <strong>{countdown}s</strong>...</span>
                                <div className="redirect-progress-track">
                                    <div
                                        className="redirect-progress-fill"
                                        style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="login-card-container">
                {onClose && (
                    <button className="login-close-btn" onClick={onClose} type="button" disabled={loading}>
                        <X size={18} />
                    </button>
                )}

                <div className="login-header">
                    <div className="login-brand-logo">
                        Earth<span>Basket</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {role === 'admin'
                            ? 'Administrator Portal'
                            : role === 'delivery'
                                ? 'Delivery Partner Portal'
                                : isRegistering
                                    ? 'Create Customer Account'
                                    : 'Customer Account Access'
                        }
                    </p>
                </div>

                <div className="role-tab-group">
                    <button
                        type="button"
                        className={`role-tab-btn ${role === 'user' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('user')}
                        disabled={loading}
                    >
                        Customer
                    </button>
                    <button
                        type="button"
                        className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('admin')}
                        disabled={loading}
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        className={`role-tab-btn ${role === 'delivery' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('delivery')}
                        disabled={loading}
                    >
                        Delivery
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {isRegistering && role === 'user' && (
                        <>
                            <div className="login-field">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label>Contact Number</label>
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="login-field">
                        <label>
                            {role === 'delivery' ? 'Username or Email Address' : 'Email Address'}
                        </label>
                        <input
                            type={role === 'delivery' ? "text" : "email"}
                            placeholder={
                                role === 'admin'
                                    ? ADMIN_EMAIL
                                    : role === 'delivery'
                                        ? 'driver_rahul'
                                        : 'your@email.com'
                            }
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading
                            ? (countdown !== null ? `Redirecting in ${countdown}s...` : 'Processing...')
                            : isRegistering
                                ? 'Register Account'
                                : `Login as ${role === 'admin' ? 'Admin' : role === 'delivery' ? 'Delivery Partner' : 'Customer'}`
                        }
                    </button>
                </form>

                {role === 'user' && (
                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: '#64748b' }}>
                        {isRegistering ? 'Already registered?' : 'New Customer?'}{' '}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setPopup({ visible: false, type: '', title: '', message: '' });
                                setCountdown(null);
                            }}
                            style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer' }}
                        >
                            {isRegistering ? 'Login Here' : 'Register Account'}
                        </button>
                    </p>
                )}

                {role === 'delivery' && (
                    <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '10px' }}>
                            Want to join our delivery team?
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowApplyModal(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#ecfdf5',
                                border: '1.5px solid #a7f3d0',
                                color: '#047857',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            <FileText size={16} />
                            Apply for Delivery Partner Role
                        </button>
                    </div>
                )}
            </div>

            {showApplyModal && (
                <DeliveryPartnerApplicationModal
                    onClose={() => setShowApplyModal(false)}
                    onSuccess={(msg) => {
                        setShowApplyModal(false);
                        showNotification('success', 'Application Submitted!', msg);
                    }}
                />
            )}
        </div>
    );
}