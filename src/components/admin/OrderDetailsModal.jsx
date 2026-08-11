import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import './OrderDetailsModal.css';

export default function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    const customerName = order.user?.name || order.customerName || order.userName || 'Guest Customer';
    const customerEmail = order.user?.email || order.customerEmail || order.userEmail || 'N/A';
    const items = order.items || order.cartItems || [];
    const orderTotal = Number(order.total || order.totalAmount || 0);

    return (
        <div className="order-modal-overlay" onClick={onClose}>
            <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="order-modal-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <ShoppingBag size={18} color="#4f46e5" />
                            <h3 className="order-modal-title">Order #{order.id.slice(0, 8)}</h3>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Placed on {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today')}
                        </span>
                    </div>
                    <button className="order-modal-close" onClick={onClose} type="button">
                        <X size={18} />
                    </button>
                </div>

                <div className="order-info-section">
                    <div className="order-info-item">
                        <label>Customer</label>
                        <span>{customerName}</span>
                    </div>
                    <div className="order-info-item">
                        <label>Email</label>
                        <span>{customerEmail}</span>
                    </div>
                    <div className="order-info-item">
                        <label>Status</label>
                        <div style={{ marginTop: '2px' }}>
                            <OrderStatusBadge status={order.status || 'Order Placed'} />
                        </div>
                    </div>
                    <div className="order-info-item">
                        <label>Total Items</label>
                        <span>{items.length} Product(s)</span>
                    </div>
                </div>

                <h4 className="order-items-title">Ordered Items</h4>

                <div className="order-items-list">
                    {items.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            No item details found for this order.
                        </p>
                    ) : (
                        items.map((item, index) => (
                            <div key={item.id || index} className="order-item-row">
                                {item.image && (
                                    <img src={item.image} alt={item.name} className="order-item-img" />
                                )}
                                <div className="order-item-details">
                                    <div className="order-item-name">{item.name}</div>
                                    <div className="order-item-qty">
                                        Qty: {item.quantity || 1} × ₹{Number(item.price || 0).toFixed(2)}
                                    </div>
                                </div>
                                <div className="order-item-price">
                                    ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="order-modal-footer">
                    <span>Total Amount</span>
                    <span className="order-modal-total">₹{orderTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}