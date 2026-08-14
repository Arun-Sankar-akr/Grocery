import React from 'react';
import { ShoppingBag, User, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserSidebar.css';

export default function UserSidebar({ activeTab = 'orders', onSelectTab }) {
    const { currentUser, logout } = useAuth();

    const menuItems = [
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'profile', label: 'Profile Details', icon: User },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        { id: 'settings', label: 'Account Settings', icon: Settings }
    ];

    return (
        <aside className="user-sidebar">
            <div className="sidebar-user-card">
                <div className="sidebar-avatar">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="sidebar-user-info">
                    <h4 className="sidebar-user-name">{currentUser?.name || 'Guest User'}</h4>
                    <p className="sidebar-user-email">{currentUser?.email || 'user@example.com'}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectTab && onSelectTab(item.id)}
                            type="button"
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {currentUser && (
                <button className="sidebar-logout-btn" onClick={logout} type="button">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            )}
        </aside>
    );
}