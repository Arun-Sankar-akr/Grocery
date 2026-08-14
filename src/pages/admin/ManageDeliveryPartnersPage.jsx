import React, { useState } from 'react';
import { Plus, UserCheck, Phone, Truck, Trash2, X } from 'lucide-react';
import './ManageDeliveryPartnersPage.css';

export default function ManageDeliveryPartnersPage() {
    const [partners, setPartners] = useState([
        { id: 'DP-01', name: 'Alex Johnson', phone: '+91 98765 43210', vehicle: 'Bike', status: 'Available' },
        { id: 'DP-02', name: 'Sarah Smith', phone: '+91 98765 12345', vehicle: 'Scooter', status: 'On Delivery' },
        { id: 'DP-03', name: 'Rahul Sharma', phone: '+91 98123 45678', vehicle: 'Bike', status: 'Available' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', vehicle: 'Bike', status: 'Available' });

    const handleAddPartner = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) return;

        const newPartner = {
            id: `DP-${String(partners.length + 1).padStart(2, '0')}`,
            ...formData
        };

        setPartners([newPartner, ...partners]);
        setFormData({ name: '', phone: '', vehicle: 'Bike', status: 'Available' });
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        setPartners(partners.filter(p => p.id !== id));
    };

    return (
        <div>
            <div className="page-action-header">
                <div>
                    <h2 className="page-title">Manage Delivery Partners</h2>
                    <p className="page-subtitle">Add, assign, and track active delivery agents.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-add-product">
                    <Plus size={18} /> Add Partner
                </button>
            </div>

            {/* Delivery Partners Table */}
            <div className="orders-table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Partner ID</th>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Vehicle</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                    No delivery partners found.
                                </td>
                            </tr>
                        ) : (
                            partners.map((partner) => (
                                <tr key={partner.id}>
                                    <td>
                                        <span className="order-id-btn">{partner.id}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <UserCheck size={16} color="#059669" />
                                            {partner.name}
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748b' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} /> {partner.phone}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <Truck size={14} /> {partner.vehicle}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${partner.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {partner.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn-delete-partner"
                                            onClick={() => handleDelete(partner.id)}
                                            title="Delete Partner"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Partner Modal */}
            {isModalOpen && (
                <div className="order-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h3 className="order-modal-title">Add New Delivery Partner</h3>
                            <button className="order-modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddPartner} className="dp-form">
                            <div className="dp-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alex Johnson"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="dp-form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="e.g. +91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="dp-form-group">
                                <label>Vehicle Type</label>
                                <select
                                    value={formData.vehicle}
                                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                                >
                                    <option value="Bike">Bike</option>
                                    <option value="Scooter">Scooter</option>
                                    <option value="Bicycle">Bicycle</option>
                                    <option value="Car / Van">Car / Van</option>
                                </select>
                            </div>
                            <div className="dp-form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-add-product">
                                    Save Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}