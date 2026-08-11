import React from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminSideBar.css';

export default function AdminSideBar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="logo-icon">
          <Sparkles size={20} />
        </div>
        <span className="logo-text">
          Fresh<span>Admin</span>
        </span>
      </div>

      <nav className="admin-nav">
        <button 
          className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('products')}
        >
          <ShoppingBag size={18} />
          <span>Products</span>
        </button>

        <button 
          className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('orders')}
        >
          <ShoppingCart size={18} />
          <span>Orders</span>
        </button>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Exit / Sign Out</span>
        </button>
      </div>
    </aside>
  );
}