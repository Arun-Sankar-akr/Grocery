import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import OrderTimeline from '../../components/user/OrderTimeline';
import { ArrowLeft } from 'lucide-react';
import './OrderTrackingPage.css';

export default function OrderTrackingPage({ order, onOpenCart, onBackToOrders }) {
    const trackingOrder = order || { id: 'ORD-8942', status: 'Out for Delivery', total: 13.47 };
    const orderId = trackingOrder.id ? trackingOrder.id.slice(0, 8) : '8942';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar onOpenCart={onOpenCart} />
            <div className="tracking-container" style={{ flex: 1 }}>
                <button
                    onClick={onBackToOrders}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        marginBottom: '20px'
                    }}
                    type="button"
                >
                    <ArrowLeft size={16} /> Back to My Orders
                </button>

                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                    Track Order #{orderId}
                </h1>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>
                    Status: <strong style={{ color: '#059669' }}>{trackingOrder.status || 'Order Placed'}</strong>
                </p>

                <div className="tracking-card">
                    <OrderTimeline currentStatus={trackingOrder.status || 'Order Placed'} />
                </div>
            </div>
            <Footer />
        </div>
    );
}