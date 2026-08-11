import React from 'react';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserSidebar.css';

export default function UserSidebar({ activeTab, setActiveTab }) {
    const { user } = useAuth();

    return (
        <aside className="user-sidebar">
            <div className="user-profile-summary">
                <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                <h3 className="user-name">{user?.name || 'User'}</h3>
                <p className="user-email">{user?.email || 'user@example.com'}</p>
            </div>

            <nav className="user-nav">
                <button
                    type="button"
                    onClick={() => setActiveTab && setActiveTab('dashboard')}
                    className={`user-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                    <LayoutDashboard size={18} /> Dashboard Overview
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab && setActiveTab('orders')}
                    className={`user-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                >
                    <ShoppingBag size={18} /> My Orders
                </button>
            </nav>
        </aside>
    );
}