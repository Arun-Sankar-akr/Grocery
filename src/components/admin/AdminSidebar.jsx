import React from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, LogOut, Sparkles, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminSideBar.css';

export default function AdminSideBar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Top Header with Brand & Sign Out */}
      <header className="admin-mobile-topbar">
        <div className="admin-brand-mobile">
          <div className="logo-icon-sm">
            <Sparkles size={16} />
          </div>
          <span className="logo-text-sm">
            Earth<span>Basket</span>
          </span>
        </div>

        <button className="mobile-logout-btn" onClick={logout} type="button">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Sidebar / Mobile Bottom Dock */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-content">
          <div className="admin-brand">
            <div className="logo-icon">
              <Sparkles size={20} />
            </div>
            <span className="logo-text">
              Earth<span>Basket</span>
            </span>
          </div>
          <span className="admin-badge-tag">Admin Workspace</span>

          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('dashboard')}
              type="button"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('products')}
              type="button"
            >
              <ShoppingBag size={18} />
              <span>Products</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('orders')}
              type="button"
            >
              <ShoppingCart size={18} />
              <span>Orders</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'deliveryPartners' ? 'active' : ''}`}
              onClick={() => setActiveTab && setActiveTab('deliveryPartners')}
              type="button"
            >
              <Truck size={18} />
              <span>Manage Delivery</span>
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
    </>
  );
}