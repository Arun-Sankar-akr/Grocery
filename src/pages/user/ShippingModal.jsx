import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import './ShippingModal.css';

export default function ShippingModal({
    isOpen,
    onClose,
    onConfirm,
    cartTotal = 0,
    initialName = ''
}) {
    const [shippingDetails, setShippingDetails] = useState({
        name: '',
        mobile: '',
        address: '',
        pincode: ''
    });

    useEffect(() => {
        if (initialName) {
            setShippingDetails(prev => ({ ...prev, name: initialName }));
        }
    }, [initialName]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(shippingDetails);
    };

    return (
        <div className="modal-overlay">
            <div className="shipping-modal-card">
                <button className="modal-close-btn" onClick={onClose} type="button">
                    <X size={20} />
                </button>

                <div className="shipping-modal-header">
                    <MapPin size={24} color="#059669" />
                    <h3>Delivery Details</h3>
                </div>
                <p className="shipping-modal-subtitle">
                    Please enter your delivery address to complete your order.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="shipping-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={shippingDetails.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="shipping-field">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="10-digit mobile number"
                            pattern="[0-9]{10}"
                            title="Please enter a valid 10-digit mobile number"
                            value={shippingDetails.mobile}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="shipping-field">
                        <label>Delivery Address</label>
                        <textarea
                            name="address"
                            placeholder="House No., Street Name, Area, Landmark"
                            rows="3"
                            value={shippingDetails.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="shipping-field">
                        <label>Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            placeholder="6-digit Pincode"
                            pattern="[0-9]{6}"
                            title="Please enter a valid 6-digit Pincode"
                            value={shippingDetails.pincode}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" className="confirm-order-btn">
                        Confirm & Pay ₹{Number(cartTotal).toFixed(2)}
                    </button>
                </form>
            </div>
        </div>
    );
}