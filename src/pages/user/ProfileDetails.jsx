import React, { useState } from 'react';
import './UserDashboardPanels.css';

export default function ProfileDetails() {
    const [profile, setProfile] = useState({
        fullName: 'Name',
        email: 'gmail.doe@example.com',
        phone: '+91 98765 43210',
    });

    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="dashboard-placeholder-card">
            <h2>Profile Details</h2>
            <p>Manage your account personal info and details.</p>

            {isSaved && <div className="success-alert">Profile updated successfully!</div>}

            <form onSubmit={handleSubmit} className="dashboard-form">
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button type="submit" className="save-btn">Save Changes</button>
            </form>
        </div>
    );
}