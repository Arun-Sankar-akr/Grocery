import React from 'react';
import { useGrocery } from '../../context/GroceryContext';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import './MyOrdersPage.css';

export default function MyOrdersPage({ onSelectOrder }) {
    const { orders = [], cancelOrder } = useGrocery();
    const { currentUser } = useAuth();

    const userOrders = orders.filter((ord) => {
        if (!currentUser) return true; // Show all for guest testing
        const ordUserId = ord.userId || ord.user?.uid;
        const ordEmail = ord.userEmail || ord.customerEmail || ord.user?.email;
        return ordUserId === currentUser.uid || ordEmail === currentUser.email;
    });

    return (
        <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
                My Orders
            </h2>

            {userOrders.length === 0 ? (
                <p style={{ color: '#64748b' }}>No orders found.</p>
            ) : (
                userOrders.map((ord) => {
                    const orderTotal = Number(ord.total || ord.totalAmount || 0);

                    return (
                        <div key={ord.id} className="order-history-card">
                            <div className="order-card-header">
                                <div>
                                    <span style={{ fontWeight: 800 }}>#{String(ord.id).slice(0, 8)}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '12px' }}>
                                        {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <OrderStatusBadge status={ord.status || 'Order Placed'} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                                        {ord.items && ord.items.length > 0
                                            ? ord.items.map((i) => `${i.name} (${i.quantity || 1})`).join(', ')
                                            : 'Grocery Items'}
                                    </p>
                                    <p style={{ fontWeight: 800, marginTop: '4px' }}>₹{orderTotal.toFixed(2)}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                                        <button
                                            onClick={() => cancelOrder(ord.id)}
                                            style={{
                                                color: '#dc2626',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                background: '#fee2e2',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel Order
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onSelectOrder && onSelectOrder(ord)}
                                        style={{
                                            color: '#059669',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Track Order →
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}