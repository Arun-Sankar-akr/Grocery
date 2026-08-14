import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import OrderTimeline from '../../components/user/OrderTimeline';
import { ArrowLeft, Clock } from 'lucide-react';
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
                    className="back-to-orders-btn"
                    type="button"
                >
                    <ArrowLeft size={16} /> Back to My Orders
                </button>

                <div className="tracking-header">
                    <h1 className="tracking-title">
                        Track Order #{orderId}
                    </h1>
                    <p className="tracking-subtitle">
                        Status: <strong style={{ color: '#059669' }}>{trackingOrder.status || 'Order Placed'}</strong>
                    </p>
                </div>

                <div className="tracking-card">
                    <OrderTimeline currentStatus={trackingOrder.status || 'Order Placed'} />
                </div>
            </div>
            <Footer />
        </div>
    );
}