import React, { useState } from 'react';
import { MapPin, Phone, User, Truck, CheckCircle2 } from 'lucide-react';

export default function DeliveryOrderCard({ 
    order, 
    onUpdateStatus, 
    onViewDetails, 
    currentDriverId, 
    currentDriverName 
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const orderId = String(order.id || order._id || '');
    const status = String(order.status || 'Order Placed').trim();

    const isOrderPlaced =
        status.toLowerCase() === 'order placed' ||
        status.toLowerCase() === 'placed' ||
        status.toLowerCase() === 'pending';
    const isOutForDelivery = status.toLowerCase() === 'out for delivery';
    const isDelivered =
        status.toLowerCase() === 'delivered' || status.toLowerCase() === 'completed';

    const assignedToId = order.assignedToId || null;
    const isAssignedToMe = String(assignedToId) === String(currentDriverId);

    const handlePickOrder = async (e) => {
        e.stopPropagation();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onUpdateStatus(orderId, {
                status: 'Out for Delivery',
                assignedTo: currentDriverName,
                assignedToId: currentDriverId, // Store current driver ID
                pickedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Failed to pick order:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkDelivered = async (e) => {
        e.stopPropagation();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onUpdateStatus(orderId, {
                status: 'Delivered',
                deliveredAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Failed to mark order delivered:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="delivery-order-card"
            style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '18px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
            }}
        >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    #{orderId}
                </h3>
                <span
                    style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: isDelivered ? '#dcfce7' : isOutForDelivery ? '#dbeafe' : '#fef3c7',
                        color: isDelivered ? '#15803d' : isOutForDelivery ? '#1d4ed8' : '#b45309',
                        textTransform: 'uppercase'
                    }}
                >
                    {status}
                </span>
            </div>

            {/* Customer Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={15} color="#64748b" />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {order.shippingDetails?.name || order.user?.name || 'Customer'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#64748b" />
                    <span>{order.shippingDetails?.mobile || order.user?.mobile || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} color="#64748b" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.shippingDetails?.address || 'Address not specified'}
                    </span>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '2px 0' }} />

            {/* Order Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>
                    {order.items?.length || 1} Item(s)
                </span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    ₹{Number(order.total || order.totalAmount || 0).toFixed(2)}
                </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                    onClick={onViewDetails}
                    style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.825rem',
                        cursor: 'pointer'
                    }}
                >
                    View Details
                </button>

                {/* Unassigned order button */}
                {isOrderPlaced && !assignedToId && (
                    <button
                        onClick={handlePickOrder}
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#059669',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Truck size={15} /> {isSubmitting ? 'Picking...' : 'Pick Order'}
                    </button>
                )}

                {/* Assigned to current driver button */}
                {isOutForDelivery && isAssignedToMe && (
                    <button
                        onClick={handleMarkDelivered}
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <CheckCircle2 size={15} /> {isSubmitting ? 'Updating...' : 'Mark Delivered'}
                    </button>
                )}
            </div>
        </div>
    );
}