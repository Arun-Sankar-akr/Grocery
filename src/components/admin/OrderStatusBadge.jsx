import React from 'react';
import './OrderStatusBadge.css';

export default function OrderStatusBadge({ status }) {
    const getStatusClass = (statusStr) => {
        switch (statusStr?.toLowerCase()) {
            case 'order placed':
            case 'placed':
                return 'placed';
            case 'packing':
            case 'packed & ready':
                return 'packing';
            case 'out for delivery':
                return 'out-for-delivery';
            case 'delivered':
                return 'delivered';
            default:
                return 'cancelled';
        }
    };

    return (
        <span className={`status-badge ${getStatusClass(status)}`}>
            <span className="badge-dot" />
            {status || 'Unknown'}
        </span>
    );
}