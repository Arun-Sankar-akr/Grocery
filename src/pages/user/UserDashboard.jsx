import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import MyOrdersPage from './MyOrdersPage';

export default function UserDashboard({ onOpenCart, onOpenLogin, onOpenDashboard, onTrackOrder }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar
                onOpenCart={onOpenCart}
                onOpenLogin={onOpenLogin}
                onOpenDashboard={onOpenDashboard}
            />

            <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
                <MyOrdersPage onSelectOrder={onTrackOrder} />
            </main>

            <Footer />
        </div>
    );
}