import React, { useState } from 'react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage({ onClose }) {
    const { loginWithFirebase, registerWithFirebase } = useAuth();
    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [isRegistering, setIsRegistering] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setErrorMsg('');
        if (newRole === 'admin') {
            setIsRegistering(false); // Force Login view for Admin
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            if (isRegistering) {
                await registerWithFirebase(name, email, password);
            } else {
                await loginWithFirebase(email, password, role);
            }
            if (onClose) onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Authentication failed. Please try again.');
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card-container">
                <div className="login-header">
                    <div className="login-brand-logo">
                        Earth<span>Basket</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {role === 'admin' ? 'Administrator Portal' : 'Customer Account Access'}
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="role-tab-group">
                    <button
                        type="button"
                        className={`role-tab-btn ${role === 'user' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('user')}
                    >
                        Customer
                    </button>
                    <button
                        type="button"
                        className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('admin')}
                    >
                        Admin
                    </button>
                </div>

                {errorMsg && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegistering && role === 'user' && (
                        <div className="login-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder={role === 'admin' ? ADMIN_EMAIL : 'your@email.com'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            required
                        />
                    </div>

                    <button type="submit" className="login-submit-btn">
                        {isRegistering ? 'Create Account' : `Login as ${role === 'admin' ? 'Admin' : 'Customer'}`}
                    </button>
                </form>

                {/* Hide registration toggle for Admin mode */}
                {role === 'user' && (
                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setErrorMsg('');
                            }}
                            style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                        >
                            {isRegistering ? 'Login' : 'Register'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}