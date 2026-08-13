import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CustomAlertModal from '../../components/common/CustomAlertModal';
import ShippingModal from './ShippingModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useGrocery } from '../../context/GroceryContext';
import { Trash2 } from 'lucide-react';
import './CartPage.css';

export default function CartPage({ onOpenCart, onOpenLogin, onOrderPlaced }) {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const { products, createOrder, placeOrder } = useGrocery();

    const saveOrderToContext = createOrder || placeOrder;

    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        type: 'warning',
        title: '',
        message: '',
        primaryBtnText: '',
        onPrimaryAction: null
    });

    const handleInitiateOrder = () => {
        if (!currentUser) {
            setAlertConfig({
                isOpen: true,
                type: 'warning',
                title: 'Login Required',
                message: 'Please log in to your account to place your order.',
                primaryBtnText: 'Login Now',
                onPrimaryAction: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    onOpenLogin();
                }
            });
            return;
        }

        const insufficientStockItem = cartItems.find(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            return product && cartItem.quantity > product.stock;
        });

        if (insufficientStockItem) {
            const matchingProduct = products.find(p => p.id === insufficientStockItem.id);
            const availableStock = matchingProduct ? matchingProduct.stock : 0;

            setAlertConfig({
                isOpen: true,
                type: 'warning',
                title: 'Stock Limit Exceeded',
                message: `Sorry! Only ${availableStock} unit(s) of "${insufficientStockItem.name}" are currently in stock.`,
                primaryBtnText: 'Okay',
                onPrimaryAction: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        setIsShippingModalOpen(true);
    };

    const handleConfirmOrder = async (shippingDetails) => {
        const newOrder = {
            id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            userId: currentUser?.uid || 'guest-id',
            user: {
                name: shippingDetails.name,
                email: currentUser?.email || ''
            },
            shippingDetails,
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity
            })),
            total: Number(cartTotal),
            status: 'Order Placed',
            createdAt: new Date().toISOString()
        };

        try {
            setIsShippingModalOpen(false);

            // 1. Save directly into Context (Handles local state & API)
            if (saveOrderToContext) {
                await saveOrderToContext(newOrder);
            }

            // 2. Backup to unified LocalStorage key
            const existing = JSON.parse(localStorage.getItem('earthbasket_orders') || '[]');
            const updated = [newOrder, ...existing.filter(o => o.id !== newOrder.id)];
            localStorage.setItem('earthbasket_orders', JSON.stringify(updated));

            clearCart();

            if (onOrderPlaced) {
                onOrderPlaced();
            } else {
                window.location.href = '/orders';
            }
        } catch (error) {
            console.error("Failed to save order:", error);
        }
    };

    return (
        <div>
            <Navbar onOpenCart={onOpenCart} onOpenLogin={onOpenLogin} />

            <div className="cart-page-container">
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Shopping Checkout</h1>

                {cartItems.length === 0 ? (
                    <p style={{ marginTop: '20px', color: '#64748b' }}>Your cart is empty.</p>
                ) : (
                    <div className="cart-layout-grid">
                        <div>
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item-card">
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-title">{item.name}</h4>
                                        <p className="cart-item-price">₹{Number(item.price).toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{Number(cartTotal).toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Fee</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />
                            <div className="summary-row" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                <span>Total</span>
                                <span>₹{Number(cartTotal).toFixed(2)}</span>
                            </div>
                            <button onClick={handleInitiateOrder} className="place-order-btn">
                                Place Order
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ShippingModal
                isOpen={isShippingModalOpen}
                onClose={() => setIsShippingModalOpen(false)}
                onConfirm={handleConfirmOrder}
                cartTotal={cartTotal}
                initialName={currentUser?.name || ''}
            />

            <Footer />

            <CustomAlertModal
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                primaryBtnText={alertConfig.primaryBtnText}
                onPrimaryAction={alertConfig.onPrimaryAction}
                onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}