import React, { useState } from 'react';
import { createDeliveryPartner } from '../../service/firebase';
import { X, Check, Copy } from 'lucide-react';
import './AddDeliveryPartnerModal.css';

export default function AddDeliveryPartnerModal({ onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdPartner, setCreatedPartner] = useState(null);
    const [copied, setCopied] = useState(false);

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
        <div className="add-partner-overlay">
            <div className="add-partner-card">
                <button className="add-partner-close-btn" onClick={onClose} type="button">
                    <X size={18} color="#64748b" />
                </button>

                <h3 className="add-partner-title">Add Delivery Partner</h3>
                <p className="add-partner-subtitle">Generate login credentials and store them in Firestore.</p>

                {!createdPartner ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-input"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                className="form-input"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div className="credentials-header">
                            <label className="form-label">Generated Credentials</label>
                            <button
                                type="button"
                                className="auto-gen-btn"
                                onClick={handleGenerateCredentials}
                            >
                                Auto-Generate
                            </button>
                        </div>

                        <div className="form-group">
                            <input
                                className="form-input"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username (e.g. driver_rahul)"
                                style={{ marginBottom: '8px' }}
                            />
                            <input
                                className="form-input"
                                type="text"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password (e.g. Eb@492)"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit-primary"
                        >
                            {loading ? 'Saving to Firebase...' : 'Save & Register Delivery Partner'}
                        </button>
                    </form>
                ) : (
                    <div>
                        <div className="success-credentials-box">
                            <p className="success-title">Partner Saved to Firebase!</p>
                            <p className="success-detail">
                                <strong>Username:</strong> {createdPartner.username}
                            </p>
                            <p className="success-detail">
                                <strong>Password:</strong> {createdPartner.password}
                            </p>
                        </div>

                        <button onClick={handleCopy} className="btn-copy" type="button">
                            {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                            {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                        </button>

                        <button onClick={onClose} className="btn-done" type="button">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}