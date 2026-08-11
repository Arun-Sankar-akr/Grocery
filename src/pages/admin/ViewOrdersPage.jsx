import React, { useState } from 'react';
import { useGrocery } from '../../context/GroceryContext';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import './ViewOrdersPage.css';

export default function ViewOrdersPage() {
    const { orders = [], updateOrderStatus } = useGrocery();
    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <div>
            <div className="orders-page-header">
                <h2 className="orders-page-title">
                    Customer Orders ({orders.length})
                </h2>
            </div>

            <div className="orders-table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!orders || orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                    No orders placed yet.
                                </td>
                            </tr>
                        ) : (
                            orders.map((ord) => {
                                const customerName = ord.user?.name || ord.customerName || ord.userName || 'Guest Customer';
                                const customerEmail = ord.user?.email || ord.customerEmail || ord.userEmail || '';
                                const orderTotal = Number(ord.total || ord.totalAmount || 0);
                                const orderDate = ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today');

                                return (
                                    <tr key={ord.id}>
                                        <td>
                                            <button
                                                className="order-id-btn"
                                                onClick={() => setSelectedOrder(ord)}
                                                title="Click to view ordered items"
                                            >
                                                #{ord.id.slice(0, 8)}
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{customerName}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customerEmail}</div>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{orderDate}</td>
                                        <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{orderTotal.toFixed(2)}</td>
                                        <td><OrderStatusBadge status={ord.status || 'Order Placed'} /></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <select
                                                value={ord.status || 'Order Placed'}
                                                onChange={(e) => updateOrderStatus && updateOrderStatus(ord.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="Order Placed">Order Placed</option>
                                                <option value="Packed & Ready">Packed & Ready</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal to view client's ordered list */}
            <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}