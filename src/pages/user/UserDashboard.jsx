import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import UserSidebar from '../../components/user/UserSidebar';
import MyOrdersPage from './MyOrdersPage';
import './UserDashboard.css';

export default function UserDashboard({ onOpenCart, onOpenLogin, onOpenDashboard, onTrackOrder }) {
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <div className="dashboard-page-wrapper">
            <Navbar
                onOpenCart={onOpenCart}
                onOpenLogin={onOpenLogin}
                onOpenDashboard={onOpenDashboard}
            />

            <main className="user-layout">
                <UserSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

                <section className="user-main-panel">
                    {activeTab === 'orders' && <MyOrdersPage onSelectOrder={onTrackOrder} />}
                    {activeTab === 'profile' && (
                        <div className="dashboard-placeholder-card">
                            <h2>Profile Details</h2>
                            <p>Manage your account personal info and details.</p>
                        </div>
                    )}
                    {activeTab === 'addresses' && (
                        <div className="dashboard-placeholder-card">
                            <h2>Saved Addresses</h2>
                            <p>Add and manage your delivery addresses.</p>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="dashboard-placeholder-card">
                            <h2>Account Settings</h2>
                            <p>Manage your passwords and notifications preferences.</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}