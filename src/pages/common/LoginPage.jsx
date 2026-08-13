import React, { useState, useEffect } from 'react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ onClose, redirectTo = '/' }) {
    const { loginWithFirebase, registerWithFirebase } = useAuth();
    const [role, setRole] = useState('user');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [popup, setPopup] = useState({ visible: false, type: '', title: '', message: '' });
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        let timer;
        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            if (onClose) onClose();
            window.location.href = redirectTo;
        }
        return () => clearTimeout(timer);
    }, [countdown, onClose, redirectTo]);

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
        if (newRole === 'admin') {
            setIsRegistering(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering && (role === 'user' || role === 'delivery')) {
                if (!name.trim()) {
                    showNotification('error', 'Registration Failed', 'Please enter your full name.');
                    setLoading(false);
                    return;
                }
                await registerWithFirebase(name, email, password, role);
                showNotification(
                    'success',
                    'Account Created!',
                    `Welcome, ${name}! Your ${role === 'delivery' ? 'Delivery Partner' : 'Customer'} account is ready.`,
                    true
                );
            } else {
                await loginWithFirebase(email, password, role);
                showNotification(
                    'success',
                    'Login Successful!',
                    `Welcome back! Logged in as ${role === 'admin' ? 'Admin' : role === 'delivery' ? 'Delivery Partner' : 'Customer'}.`,
                    true
                );
            }
        } catch (err) {
            let errorMsg = 'Authentication failed. Please check your credentials.';

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                errorMsg = 'Invalid email or password. Please try again.';
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
                                ? isRegistering
                                    ? 'Register New Delivery Partner'
                                    : 'Delivery Partner Portal'
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
                    {isRegistering && (role === 'user' || role === 'delivery') && (
                        <div className="login-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder={role === 'delivery' ? "e.g. Rahul Sharma" : "Enter your full name"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder={
                                role === 'admin'
                                    ? ADMIN_EMAIL
                                    : role === 'delivery'
                                        ? 'driver@earthbasket.com'
                                        : 'your@email.com'
                            }
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                ? `Register as ${role === 'delivery' ? 'Delivery Partner' : 'Customer'}`
                                : `Login as ${role === 'admin' ? 'Admin' : role === 'delivery' ? 'Delivery Partner' : 'Customer'}`
                        }
                    </button>
                </form>

                {(role === 'user' || role === 'delivery') && (
                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: '#64748b' }}>
                        {isRegistering ? 'Already registered?' : "New Delivery Partner or Customer?"}{' '}
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
            </div>
        </div>
    );
}