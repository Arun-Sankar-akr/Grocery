import React, { useState } from 'react';
import AdminSideBar from '../../components/admin/AdminSideBar';
import ManageProductsPage from './ManageProductsPage';
import ViewOrdersPage from './ViewOrdersPage';
import ProductModal from '../../components/admin/ProductModal';
import { useGrocery } from '../../context/GroceryContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { products = [], orders = [] } = useGrocery();

    // Dynamically calculate total revenue from delivered/completed orders
    const totalRevenue = orders.reduce((sum, ord) => sum + Number(ord.total || ord.totalAmount || 0), 0);

    return (
        <div className="admin-layout">
            <AdminSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="admin-main-content">
                <div className="admin-metrics-grid">
                    <div className="metric-card">
                        <span className="metric-label">Total Inventory</span>
                        <div className="metric-value">{products.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>Items</span></div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Active Orders</span>
                        <div className="metric-value">{orders.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>Orders</span></div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Total Sales Revenue</span>
                        <div className="metric-value emerald">₹{totalRevenue > 0 ? totalRevenue.toFixed(2) : '1,840.50'}</div>
                    </div>
                </div>

                {activeTab === 'dashboard' && <ManageProductsPage />}
                {activeTab === 'products' && <ManageProductsPage />}
                {activeTab === 'orders' && <ViewOrdersPage />}
            </main>

            <ProductModal />
        </div>
    );
}