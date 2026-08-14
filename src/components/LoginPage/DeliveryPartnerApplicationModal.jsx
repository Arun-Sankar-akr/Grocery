import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { db } from '../../service/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DeliveryPartnerApplicationModal({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        vehicleType: 'Bike / Scooter',
        licenseNumber: '',
        city: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Write directly to Firestore 'users' collection with status 'pending'
            await addDoc(collection(db, 'users'), {
                ...formData,
                role: 'applicant',
                status: 'pending',
                createdAt: serverTimestamp()
            });

            setLoading(false);
            if (onSuccess) {
                onSuccess('Your application has been submitted to the Admin team for review.');
            }
            onClose();
        } catch (err) {
            console.error('Submission Error:', err);
            alert('Failed to submit application. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '20px'
        }}>
            <div style={{
                background: '#ffffff',
                width: '100%',
                maxWidth: '520px',
                borderRadius: '20px',
                padding: '32px',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <button
                    onClick={onClose}
                    type="button"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: '#f1f5f9',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        cursor: 'pointer'
                    }}
                >
                    <X size={18} />
                </button>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    Delivery Partner Application
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
                    Fill out the form below. Once approved by our Admin, your login credentials will be generated.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="rahul@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                Vehicle Type *
                            </label>
                            <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box', background: '#fff' }}
                            >
                                <option value="Bike / Scooter">Bike / Scooter</option>
                                <option value="Bicycle">Bicycle</option>
                                <option value="Electric Vehicle">Electric Scooter / EV</option>
                                <option value="Four Wheeler">Four Wheeler / Van</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                                Driving License Number *
                            </label>
                            <input
                                type="text"
                                name="licenseNumber"
                                required
                                placeholder="DL-1234567890"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            City / Operating Area *
                        </label>
                        <input
                            type="text"
                            name="city"
                            required
                            placeholder="e.g. Bangalore South"
                            value={formData.city}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            Residential Address
                        </label>
                        <textarea
                            name="address"
                            rows="2"
                            placeholder="Enter full address..."
                            value={formData.address}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#ffffff',
                            padding: '14px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Send size={18} />
                        {loading ? 'Submitting Application...' : 'Submit Application to Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}