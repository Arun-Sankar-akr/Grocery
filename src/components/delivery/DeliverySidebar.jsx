import React from 'react';
import { Truck, CheckSquare, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../admin/AdminSideBar.css';

export default function DeliverySidebar({ activeTab, setActiveTab }) {
    const { logout } = useAuth();

    return (
        <aside className="admin-sidebar">
            <div>
                <div className="admin-brand">
                    <div className="logo-icon">
                        <Sparkles size={20} />
                    </div>
                    <span className="logo-text">
                        Earth<span>Basket</span>
                    </span>
                </div>
                <span className="admin-badge-tag" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
                    Delivery Partner
                </span>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'active-deliveries' ? 'active' : ''}`}
                        onClick={() => setActiveTab && setActiveTab('active-deliveries')}
                        type="button"
                    >
                        <Truck size={18} />
                        <span>Active Deliveries</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab && setActiveTab('completed')}
                        type="button"
                    >
                        <CheckSquare size={18} />
                        <span>Completed</span>
                    </button>
                </nav>
            </div>

            <div className="admin-sidebar-footer">
                <button className="logout-btns" onClick={logout} type="button">
                    <LogOut size={18} />
                    <span>Exit / Sign Out</span>
                </button>
            </div>
        </aside>
    );
}