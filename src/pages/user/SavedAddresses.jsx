import React, { useState } from 'react';
import './UserDashboardPanels.css';

export default function SavedAddresses() {
    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', street: '123 Main Street, Srirangam', city: 'Trichy', zip: '620100', isDefault: true },
        { id: 2, type: 'Work', street: '456 Market St, Ghandi Nagar', city: 'Coimbatore', zip: '600028', isDefault: false },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ type: 'Home', street: '', city: '', zip: '' });

    const handleDelete = (id) => {
        setAddresses(addresses.filter((addr) => addr.id !== id));
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        setAddresses([...addresses, { ...newAddress, id: Date.now(), isDefault: addresses.length === 0 }]);
        setNewAddress({ type: 'Home', street: '', city: '', zip: '' });
        setShowForm(false);
    };

    return (
        <div className="dashboard-placeholder-card">
            <div className="card-header-flex">
                <div>
                    <h2>Saved Addresses</h2>
                    <p>Add and manage your delivery addresses.</p>
                </div>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Address'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAddAddress} className="dashboard-form">
                    <div className="form-group">
                        <label>Address Type</label>
                        <select
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                        >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Street Address</label>
                        <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="e.g. 123 Elm St, Apt 2B"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>ZIP / Postal Code</label>
                            <input
                                type="text"
                                value={newAddress.zip}
                                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="save-btn">Save Address</button>
                </form>
            )}

            <div className="address-grid">
                {addresses.map((addr) => (
                    <div key={addr.id} className="address-card">
                        <div>
                            <div className="address-badge">
                                <span>{addr.type}</span>
                                {addr.isDefault && <span>Default</span>}
                            </div>
                            <p className="address-text">{addr.street}</p>
                            <p className="address-text">{addr.city}, {addr.zip}</p>
                        </div>
                        <button className="delete-btn" onClick={() => handleDelete(addr.id)}>Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
}