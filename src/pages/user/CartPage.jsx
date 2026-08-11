import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CustomAlertModal from '../../components/common/CustomAlertModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useGrocery } from '../../context/GroceryContext';
import { Trash2 } from 'lucide-react';
import './CartPage.css';

export default function CartPage({ onOpenCart, onOpenLogin, onOrderPlaced }) {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const { products, createOrder } = useGrocery();

    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        type: 'warning',
        title: '',
        message: '',
        primaryBtnText: '',
        onPrimaryAction: null
    });

    const handlePlaceOrder = async () => {
        // 1. Check if user is logged in
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

        // 2. Validate Inventory Stock before checkout
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
                message: `Sorry! Only ${availableStock} unit(s) of "${insufficientStockItem.name}" are currently in stock. Please adjust your cart quantity.`,
                primaryBtnText: 'Okay',
                onPrimaryAction: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        // 3. Build the standardized order payload
        const newOrder = {
            userId: currentUser?.uid || 'guest-id',
            user: {
                name: currentUser?.name || 'Customer',
                email: currentUser?.email || ''
            },
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
            // 4. Save order & trigger stock reduction in GroceryContext
            await createOrder(newOrder);

            // 5. Clear the cart
            clearCart();

            // 6. Show success alert modal
            setAlertConfig({
                isOpen: true,
                type: 'success',
                title: 'Order Placed!',
                message: 'Your fresh groceries have been ordered successfully and inventory has been updated.',
                primaryBtnText: 'View Orders',
                onPrimaryAction: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    if (onOrderPlaced) onOrderPlaced();
                }
            });
        } catch (error) {
            console.error("Failed to save order to database:", error);
            setAlertConfig({
                isOpen: true,
                type: 'error',
                title: 'Order Failed',
                message: 'Something went wrong while placing your order. Please try again.',
                primaryBtnText: 'Try Again',
                onPrimaryAction: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
            });
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
                                        <p className="cart-item-price">₹{item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Remove item"
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
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Fee</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />
                            <div className="summary-row" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button onClick={handlePlaceOrder} className="place-order-btn" style={{ border: 'none', cursor: 'pointer' }}>
                                Place Order
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {/* Custom Alert Modal */}
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