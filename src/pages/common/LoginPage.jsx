// src/pages/common/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, ShieldCheck, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess }) {
    const { loginWithFirebase, registerWithFirebase } = useAuth();

    // State toggles
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'admin'

    // Form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Feedback states
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Form validations
        if (authMode === 'register') {
            if (!fullName.trim()) {
                setError('Please enter your full name.');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }

        setLoading(true);

        try {
            if (authMode === 'register') {
                await registerWithFirebase(fullName, email, password, selectedRole);
            } else {
                await loginWithFirebase(email, password, selectedRole);
            }

            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            // Clean up common Firebase Auth error messages
            let msg = err.message || 'Authentication failed.';
            if (msg.includes('auth/email-already-in-use')) {
                msg = 'This email is already registered. Please log in.';
            } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
                msg = 'Invalid email or password.';
            } else if (msg.includes('auth/weak-password')) {
                msg = 'Password should be at least 6 characters.';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode) => {
        setAuthMode(mode);
        setError('');
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card-container">

                {/* Header */}
                <div className="login-header">
                    <div className="login-brand-logo">
                        Fresh<span>Cart</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {authMode === 'login' ? 'Sign in to continue shopping' : 'Create an account to start ordering'}
                    </p>
                </div>

                {/* Mode Switcher Tabs (Login vs Register) */}
                <div className="auth-mode-switch" style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                    <button
                        type="button"
                        onClick={() => switchMode('login')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            background: authMode === 'login' ? '#ffffff' : 'transparent',
                            color: authMode === 'login' ? '#1e293b' : '#64748b',
                            boxShadow: authMode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogIn size={14} style={{ display: 'inline', marginRight: '6px' }} /> Log In
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('register')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            background: authMode === 'register' ? '#ffffff' : 'transparent',
                            color: authMode === 'register' ? '#1e293b' : '#64748b',
                            boxShadow: authMode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <UserPlus size={14} style={{ display: 'inline', marginRight: '6px' }} /> Register
                    </button>
                </div>

                {/* Role Selector */}
                <div className="role-tab-group">
                    <button
                        type="button"
                        onClick={() => { setSelectedRole('user'); setError(''); }}
                        className={`role-tab-btn ${selectedRole === 'user' ? 'active' : ''}`}
                    >
                        <User size={14} style={{ display: 'inline', marginRight: 4 }} /> Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSelectedRole('admin'); setError(''); }}
                        className={`role-tab-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                    >
                        <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Administrator
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {authMode === 'register' && (
                        <div className="login-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={selectedRole === 'admin' ? 'admin@freshcart.com' : 'user@example.com'}
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {authMode === 'register' && (
                        <div className="login-field">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="login-submit-btn" style={{ marginTop: '12px' }}>
                        {loading ? 'Please wait...' : authMode === 'login' ? `Log In as ${selectedRole === 'admin' ? 'Admin' : 'Customer'}` : `Create ${selectedRole === 'admin' ? 'Admin' : 'Customer'} Account`}
                    </button>
                </form>

                {/* Bottom Switch Link */}
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>
                    {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
                        style={{ color: '#16a34a', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {authMode === 'login' ? 'Register now' : 'Log in'}
                    </span>
                </p>

            </div>
        </div>
    );
}