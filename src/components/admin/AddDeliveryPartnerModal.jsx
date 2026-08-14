import React, { useState } from 'react';
import { createDeliveryPartner } from '../../service/firebase';
import { User, Key, Phone, Mail, X, Check, Copy } from 'lucide-react';

export default function AddDeliveryPartnerModal({ onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdPartner, setCreatedPartner] = useState(null);
    const [copied, setCopied] = useState(false);

    // Auto-generate credentials based on partner's name
    const handleGenerateCredentials = () => {
        if (!name.trim()) return;
        const cleanName = name.toLowerCase().replace(/\s+/g, '');
        const randomNum = Math.floor(100 + Math.random() * 900);

        const genUsername = `driver_${cleanName}`;
        const genPassword = `Eb@${randomNum}`;

        setUsername(genUsername);
        setPassword(genPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const partnerData = await createDeliveryPartner({
                name,
                phone,
                username: username || `driver_${name.toLowerCase().replace(/\s+/g, '')}`,
                password: password || 'Eb@12345',
            });

            setCreatedPartner(partnerData);
            if (onSuccess) onSuccess(partnerData);
        } catch (err) {
            alert(`Failed to save delivery partner: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        const text = `Delivery Partner Credentials:\nUsername: ${createdPartner.username}\nPassword: ${createdPartner.password}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#ffffff', borderRadius: '16px', padding: '28px',
                width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '16px', right: '16px', border: 'none',
                    background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <X size={18} color="#64748b" />
                </button>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Add Delivery Partner
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.825rem', color: '#64748b' }}>
                    Generate login credentials and store them in Firestore.
                </p>

                {!createdPartner ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                placeholder="e.g. Rahul Sharma"
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 9876543210"
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                Generated Credentials
                            </label>
                            <button
                                type="button"
                                onClick={handleGenerateCredentials}
                                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Auto-Generate
                            </button>
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username (e.g. driver_rahul)"
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '8px' }}
                            />
                            <input
                                type="text"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password (e.g. Eb@492)"
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px', backgroundColor: '#059669', color: '#ffffff',
                                border: 'none', borderRadius: '8px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Saving to Firebase...' : 'Save & Register Delivery Partner'}
                        </button>
                    </form>
                ) : (
                    <div>
                        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>
                                Partner Saved to Firebase!
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '0.825rem', color: '#065f46' }}>
                                <strong>Username:</strong> {createdPartner.username}
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '0.825rem', color: '#065f46' }}>
                                <strong>Password:</strong> {createdPartner.password}
                            </p>
                        </div>

                        <button
                            onClick={handleCopy}
                            style={{
                                width: '100%', padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a',
                                border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                cursor: 'pointer', marginBottom: '10px'
                            }}
                        >
                            {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                            {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                        </button>

                        <button
                            onClick={onClose}
                            style={{
                                width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#ffffff',
                                border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}