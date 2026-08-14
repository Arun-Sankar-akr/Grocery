import React, { useState, useEffect } from 'react';
import { db } from '../../service/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trash2, Edit2, CheckCircle, X, Save } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('delivery'); // 'delivery' or 'applications'
    const [partners, setPartners] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State for Editing Partner
    const [editingPartner, setEditingPartner] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        email: '',
        username: '',
        tempPassword: ''
    });

    // Real-time listener for Delivery Partners & Applications
    useEffect(() => {
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(
            usersRef,
            (snapshot) => {
                const partnerList = [];
                const appList = [];

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const item = { id: docSnap.id, ...data };

                    const isDeliveryOrApplicant =
                        ['delivery', 'delivery-partner', 'applicant'].includes(data.role) ||
                        data.status === 'pending';

                    if (isDeliveryOrApplicant) {
                        const isPending =
                            data.status === 'pending' ||
                            data.role === 'applicant' ||
                            (!data.status && !data.username);

                        if (isPending) {
                            appList.push(item);
                        } else {
                            partnerList.push(item);
                        }
                    }
                });

                setPartners(partnerList);
                setApplications(appList);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading delivery partners:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Delete Partner from Firebase Firestore
    const handleDeletePartner = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete delivery partner "${name || 'Partner'}"?`)) {
            try {
                await deleteDoc(doc(db, 'users', id));
                alert('Delivery partner deleted successfully.');
            } catch (error) {
                console.error('Failed to delete partner:', error);
                alert('Failed to delete delivery partner. Please try again.');
            }
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (partner) => {
        setEditingPartner(partner);
        setEditForm({
            name: partner.name || '',
            phone: partner.phone || '',
            email: partner.email || '',
            username: partner.username || '',
            tempPassword: partner.tempPassword || ''
        });
    };

    // Save Edit Changes to Firebase Firestore
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingPartner) return;

        try {
            const partnerRef = doc(db, 'users', editingPartner.id);
            await updateDoc(partnerRef, {
                name: editForm.name,
                phone: editForm.phone,
                email: editForm.email,
                username: editForm.username,
                tempPassword: editForm.tempPassword
            });
            setEditingPartner(null);
            alert('Partner credentials updated successfully.');
        } catch (error) {
            console.error('Failed to update partner:', error);
            alert('Failed to update delivery partner.');
        }
    };

    // Approve Pending Application & Generate Login Credentials
    const handleApprove = async (app) => {
        const cleanName = (app.name || 'driver').toLowerCase().replace(/\s+/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);

        // Generate Username & Temp Password
        const generatedUsername = app.username || `driver_${cleanName}`;
        const generatedTempPassword = app.tempPassword || `Pass@${randomNum}`;

        try {
            const partnerRef = doc(db, 'users', app.id);
            await updateDoc(partnerRef, {
                role: 'delivery',
                status: 'approved',
                username: generatedUsername,
                tempPassword: generatedTempPassword
            });
            alert(`Application approved!\n\nCredentials Generated:\nUsername: ${generatedUsername}\nPassword: ${generatedTempPassword}`);
        } catch (error) {
            console.error('Failed to approve application:', error);
            alert('Failed to approve application.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                    Manage Delivery Partners
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    View active partners, review incoming applications, and update credentials.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <button
                    onClick={() => setActiveTab('delivery')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'delivery' ? '#059669' : '#f1f5f9',
                        color: activeTab === 'delivery' ? '#ffffff' : '#64748b'
                    }}
                >
                    Active Partners ({partners.length})
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'applications' ? '#059669' : '#f1f5f9',
                        color: activeTab === 'applications' ? '#ffffff' : '#64748b'
                    }}
                >
                    Applications ({applications.length})
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading delivery partners...</div>
            ) : (
                <>
                    {/* Active Partners View */}
                    {activeTab === 'delivery' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {partners.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>No active delivery partners found.</p>
                            ) : (
                                partners.map((partner) => (
                                    <div
                                        key={partner.id}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                                {partner.name || 'Unnamed Partner'}
                                            </h3>
                                            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700 }}>
                                                Active
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div><strong>Phone:</strong> {partner.phone || 'N/A'}</div>
                                            <div><strong>Email:</strong> {partner.email || 'N/A'}</div>
                                            <div><strong>Username:</strong> {partner.username || 'N/A'}</div>
                                            <div><strong>Password:</strong> {partner.tempPassword || '••••••••'}</div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                            <button
                                                onClick={() => handleOpenEdit(partner)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #bae6fd',
                                                    backgroundColor: '#f0f9ff',
                                                    color: '#0284c7',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Edit2 size={16} /> Edit Credentials
                                            </button>
                                            <button
                                                onClick={() => handleDeletePartner(partner.id, partner.name)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #fecdd3',
                                                    backgroundColor: '#fff1f2',
                                                    color: '#e11d48',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Pending Applications View */}
                    {activeTab === 'applications' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {applications.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>No pending applications.</p>
                            ) : (
                                applications.map((app) => (
                                    <div
                                        key={app.id}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                                            {app.name || 'Applicant'}
                                        </h3>
                                        <div style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div><strong>Phone:</strong> {app.phone || 'N/A'}</div>
                                            <div><strong>Email:</strong> {app.email || 'N/A'}</div>
                                            <div><strong>Vehicle:</strong> {app.vehicleType || 'N/A'}</div>
                                            <div><strong>Status:</strong> <span style={{ color: '#d97706', fontWeight: 600 }}>{app.status || 'Pending'}</span></div>
                                        </div>

                                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                            <button
                                                onClick={() => handleApprove(app)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#059669',
                                                    color: '#ffffff',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <CheckCircle size={16} /> Approve & Generate Login
                                            </button>
                                            <button
                                                onClick={() => handleDeletePartner(app.id, app.name)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #fecdd3',
                                                    backgroundColor: '#fff1f2',
                                                    color: '#e11d48',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={16} /> Reject & Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Edit Partner Modal */}
            {editingPartner && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 200,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '20px',
                        padding: '28px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setEditingPartner(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 800 }}>
                            Edit Credentials: {editingPartner.name}
                        </h3>

                        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Phone Number</label>
                                <input
                                    required
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Password</label>
                                <input
                                    type="text"
                                    value={editForm.tempPassword}
                                    onChange={(e) => setEditForm({ ...editForm, tempPassword: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingPartner(null)}
                                    style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}