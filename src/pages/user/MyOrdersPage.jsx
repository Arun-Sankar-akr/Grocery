import React from 'react';
import { useGrocery } from '../../context/GroceryContext';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import './MyOrdersPage.css';

export default function MyOrdersPage({ onSelectOrder }) {
    const { orders = [], cancelOrder } = useGrocery();
    const { currentUser } = useAuth();

    const userOrders = orders.filter((ord) => {
        if (!currentUser) return true;
        const ordUserId = ord.userId || ord.user?.uid;
        const ordEmail = ord.userEmail || ord.customerEmail || ord.user?.email;
        return ordUserId === currentUser.uid || ordEmail === currentUser.email;
    });

    return (
        <div>
            <div className="orders-page-header">
                <h2 className="orders-page-title">My Orders</h2>
                <p className="orders-page-subtitle">View and track all your grocery orders</p>
            </div>

            {userOrders.length === 0 ? (
                <div className="order-history-card" style={{ textAlign: 'center', color: '#64748b' }}>
                    <p>No orders found yet.</p>
                </div>
            ) : (
                userOrders.map((ord) => {
                    const orderTotal = Number(ord.total || ord.totalAmount || 0);

                    return (
                        <div key={ord.id} className="order-history-card">
                            <div className="order-card-header">
                                <div>
                                    <span className="order-id-tag">#{String(ord.id).slice(0, 8)}</span>
                                    <span className="order-date-tag">
                                        {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <OrderStatusBadge status={ord.status || 'Order Placed'} />
                            </div>

                            <div className="order-card-body">
                                <div>
                                    <p className="order-items-summary">
                                        {ord.items && ord.items.length > 0
                                            ? ord.items.map((i) => `${i.name} (${i.quantity || 1})`).join(', ')
                                            : 'Grocery Items'}
                                    </p>
                                    <p className="order-price-summary">₹{orderTotal.toFixed(2)}</p>
                                </div>

                                <div className="order-actions-group">
                                    {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                                        <button
                                            onClick={() => cancelOrder(ord.id)}
                                            className="btn-cancel-order"
                                            type="button"
                                        >
                                            Cancel Order
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onSelectOrder && onSelectOrder(ord)}
                                        className="btn-track-order"
                                        type="button"
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