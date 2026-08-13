import React, { useState } from 'react';
import {
    MapPin,
    Phone,
    User,
    Truck,
    CheckCircle2,
    Navigation2,
    PhoneCall,
    Route,
    Wallet,
    Compass
} from 'lucide-react';

export default function DeliveryOrderCard({
    order = {},
    onUpdateStatus,
    onViewDetails,
    currentDriverId,
    currentDriverName
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- BASIC ORDER METRICS ---
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

    const customerMobile = order.shippingDetails?.mobile || order.user?.mobile || '';

    // --- LOCATION & COORDINATES RESOLUTION ---
    const rawDetected = order.detectedLocation || order.shippingDetails?.detectedLocation;
    const locationCoords = order.coordinates || order.shippingDetails?.coordinates || null;

    // Resolve lat/lng supporting flexible key variants (lat/lng vs latitude/longitude)
    const lat = locationCoords?.latitude || locationCoords?.lat;
    const lng = locationCoords?.longitude || locationCoords?.lng;
    const hasCoordinates = Boolean(lat && lng);

    // Resolve actual printable address (ignoring fallback placeholder strings)
    const rawAddress =
        (typeof rawDetected === 'string' ? rawDetected : rawDetected?.address) ||
        order.shippingDetails?.address ||
        order.address;

    // Only set customerAddress if it's a valid address string
    const customerAddress = rawAddress && rawAddress !== 'Location Detected on Cart' ? rawAddress : null;

    // Check if valid coordinates or address exist for Google Maps navigation
    const hasNavigableLocation = hasCoordinates || Boolean(customerAddress);

    // Calculate Driver Profit & Travel distance
    const distanceKm = order.deliveryDistanceKm || order.breakdown?.distanceKm || 3;
    const deliveryFee = order.deliveryFee || order.breakdown?.deliveryFee || 30;
    const driverEarnings = order.driverEarnings || Math.round((deliveryFee * 0.8) + 15);

    // --- NAVIGATION HANDLER ---
    const handleOpenNavigation = (e) => {
        e.stopPropagation();

        // 1. Prioritize exact GPS latitude/longitude from cart detection
        if (hasCoordinates) {
            window.open(
                `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                '_blank'
            );
            return;
        }

        // 2. Fallback to searching exact address query if available
        if (customerAddress) {
            const encodedAddress = encodeURIComponent(customerAddress);
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
            return;
        }
    };

    // --- STATUS ACTIONS ---
    const handlePickOrder = async (e) => {
        e.stopPropagation();
        if (isSubmitting || !onUpdateStatus) return;

        setIsSubmitting(true);
        try {
            await onUpdateStatus(orderId, {
                status: 'Out for Delivery',
                assignedTo: currentDriverName,
                assignedToId: currentDriverId,
                driverEarnings: driverEarnings,
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
        if (isSubmitting || !onUpdateStatus) return;

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
                justify: 'space-between',
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

            {/* Distance & Driver Pay Badge */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '8px 12px',
                    borderRadius: '8px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                    <Route size={15} color="#16a34a" />
                    <span>Travel: <strong>{typeof distanceKm === 'number' ? distanceKm.toFixed(1) : distanceKm} km</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#15803d', fontWeight: 800 }}>
                    <Wallet size={15} color="#16a34a" />
                    <span>Earnings: ₹{driverEarnings}</span>
                </div>
            </div>

            {/* Customer Info & Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={15} color="#64748b" />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {order.shippingDetails?.name || order.user?.name || 'Customer'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={15} color="#64748b" />
                        <span>{customerMobile || 'N/A'}</span>
                    </div>
                    {customerMobile && (
                        <a
                            href={`tel:${customerMobile}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textDecoration: 'none'
                            }}
                        >
                            <PhoneCall size={12} /> Call
                        </a>
                    )}
                </div>

                {/* Detected Location Highlight Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        marginTop: '2px'
                    }}
                >
                    <Compass size={14} color="#2563eb" />
                    <span>Cart Auto-Detected Location</span>
                </div>

                {/* Display Location & Navigation Button */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                        <MapPin size={15} color="#059669" style={{ flexShrink: 0 }} />
                        <span
                            title={customerAddress || 'Location set on Cart'}
                            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600, color: '#0f172a' }}
                        >
                            {customerAddress || 'Location Detected on Cart'}
                        </span>
                    </div>

                    {/* NAVIGATE BUTTON WITH DISABLING AND TOOLTIP */}
                    <button
                        type="button"
                        onClick={handleOpenNavigation}
                        disabled={!hasNavigableLocation}
                        title={
                            hasNavigableLocation
                                ? "Open location in Google Maps"
                                : "No valid location or coordinates available for navigation"
                        }
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 9px',
                            borderRadius: '6px',
                            backgroundColor: hasNavigableLocation ? '#2563eb' : '#cbd5e1',
                            color: hasNavigableLocation ? '#ffffff' : '#64748b',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: hasNavigableLocation ? 'pointer' : 'not-allowed',
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Navigation2 size={12} /> Navigate
                    </button>
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
                {onViewDetails && (
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
                )}

                {isOrderPlaced && !assignedToId && (
                    <button
                        onClick={handlePickOrder}
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isSubmitting ? '#94a3b8' : '#059669',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Truck size={15} /> {isSubmitting ? 'Picking...' : 'Pick Order'}
                    </button>
                )}

                {isOutForDelivery && isAssignedToMe && (
                    <button
                        onClick={handleMarkDelivered}
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isSubmitting ? '#94a3b8' : '#2563eb',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
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