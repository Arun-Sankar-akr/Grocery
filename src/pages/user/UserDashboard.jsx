import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import UserSidebar from '../../components/user/UserSidebar';
import MyOrdersPage from './MyOrdersPage';
import ProfileDetails from './ProfileDetails';
import SavedAddresses from './SavedAddresses';
import AccountSettings from './AccountSettings';
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
                    {activeTab === 'profile' && <ProfileDetails />}
                    {activeTab === 'addresses' && <SavedAddresses />}
                    {activeTab === 'settings' && <AccountSettings />}
                </section>
            </main>

            <Footer />
        </div>
    );
}