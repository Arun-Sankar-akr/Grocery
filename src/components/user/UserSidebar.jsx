import React, { useState } from 'react';
import {
    ShoppingBag,
    User,
    MapPin,
    Settings,
    LogOut,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import './UserSidebar.css';

export default function UserSidebar({ activeTab, onSelectTab, onLogout }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'profile', label: 'Profile Details', icon: User },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        { id: 'settings', label: 'Account Settings', icon: Settings },
    ];

    const handleTabClick = (tabId) => {
        onSelectTab(tabId);
        setIsMobileOpen(false); // Close menu automatically on selection on mobile
    };

    const activeItem = menuItems.find(item => item.id === activeTab);

    return (
        <aside className="user-sidebar-card">
            {/* Header / User Info */}
            <div className="sidebar-user-info">
                <div className="avatar">A</div>
                <div className="user-details">
                    <h3 className="user-name">Arun</h3>
                    <p className="user-email">arunsanka@gmail.com</p>
                </div>

                {/* Mobile Toggle Button */}
                <button
                    className="mobile-toggle-btn"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle navigation"
                >
                    {activeItem ? activeItem.label : 'Menu'}
                    {isMobileOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Navigation List */}
            <nav className={`sidebar-nav ${isMobileOpen ? 'open' : ''}`}>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleTabClick(item.id)}
                        >
                            <IconComponent size={20} className="nav-icon" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <button className="nav-item logout-btn" onClick={onLogout}>
                    <LogOut size={20} className="nav-icon" />
                    <span>Logout</span>
                </button>
            </nav>
        </aside>
    );
}