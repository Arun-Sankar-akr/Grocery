import React, { useState } from 'react';
import './UserDashboardPanels.css';

export default function AccountSettings() {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [notifications, setNotifications] = useState({ emailAlerts: true, smsAlerts: false });
    const [message, setMessage] = useState('');

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setMessage('Password updated successfully!');
        setPasswords({ currentPassword: '', newPassword: '' });
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="dashboard-placeholder-card">
            <h2>Account Settings</h2>
            <p>Manage your passwords and notifications preferences.</p>

            {message && <div className="success-alert">{message}</div>}

            {/* Password Section */}
            <form onSubmit={handlePasswordSubmit} className="dashboard-form">
                <h3>Change Password</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="save-btn">Update Password</button>
            </form>

            <hr className="divider" />

            {/* Notifications Section */}
            <div className="settings-section">
                <h3>Notification Preferences</h3>

                <label className="toggle-label">
                    <span>Receive order updates via Email</span>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={notifications.emailAlerts}
                            onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </div>
                </label>

                <label className="toggle-label">
                    <span>Receive promotional updates via SMS</span>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={notifications.smsAlerts}
                            onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </div>
                </label>
            </div>
        </div>
    );
}