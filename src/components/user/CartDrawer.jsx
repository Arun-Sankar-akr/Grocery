import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CustomAlertModal from '../common/CustomAlertModal';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose, onGoToCart, onOpenLogin }) {
    const { cartItems = [], updateQuantity, removeFromCart, cartTotal = 0 } = useCart();
    const { currentUser } = useAuth();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    if (!isOpen) return null;

    const handleProceed = () => {
        if (!currentUser) {
            setShowLoginPrompt(true);
            return;
        }
        onClose();
        onGoToCart();
    };

    return (
        <>
            <div className="cart-drawer-overlay" onClick={onClose}>
                <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
                    <div className="cart-drawer-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShoppingBag size={20} color="#4f46e5" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                Your Shopping Cart
                            </h3>
                        </div>
                        <button className="cart-drawer-close-btn" onClick={onClose} type="button" title="Close">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="cart-items-list">
                        {cartItems.length === 0 ? (
                            <div className="empty-cart-drawer">
                                <ShoppingBag size={42} strokeWidth={1.5} />
                                <p>Your cart is currently empty.</p>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="cart-item-card">
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-title">{item.name}</h4>
                                        <p className="cart-item-price">
                                            ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="cart-quantity-controls">
                                        <button 
                                            onClick={() => updateQuantity(item.id, -1)} 
                                            type="button" 
                                            title="Decrease"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', padding: '0 4px' }}>
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, 1)} 
                                            type="button" 
                                            title="Increase"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        className="cart-item-delete-btn"
                                        type="button"
                                        title="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="cart-drawer-footer">
                            <div className="cart-total-row">
                                <span>Total Amount</span>
                                <span>₹{Number(cartTotal || 0).toFixed(2)}</span>
                            </div>
                            <button onClick={handleProceed} className="checkout-btn" type="button">
                                Proceed to Checkout <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <CustomAlertModal
                isOpen={showLoginPrompt}
                type="warning"
                title="Sign In Required"
                message="Please log in to your account before proceeding to checkout."
                primaryBtnText="Login Now"
                onPrimaryAction={() => {
                    setShowLoginPrompt(false);
                    onClose();
                    onOpenLogin();
                }}
                onCancel={() => setShowLoginPrompt(false)}
            />
        </>
    );
}