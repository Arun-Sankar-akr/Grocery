import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
    const { cartItems = [], addToCart, updateQuantity } = useCart();

    // Find product in cart to get current quantity
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = (e) => {
        e.stopPropagation();
        addToCart(product);
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        updateQuantity(product.id, 1); // Pass +1 as the delta
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        updateQuantity(product.id, -1); // Pass -1 as the delta
    };

    return (
        <div className="product-card">
            <div>
                <div className="product-img-box">
                    <img src={product.image} alt={product.name} className="product-img" />
                    <span className="category-pill">{product.category}</span>
                </div>

                <h3 className="product-title">{product.name}</h3>
                <p className="product-unit">{product.unit}</p>
            </div>

            <div className="product-footer">
                <div>
                    <span className="product-price-label">Price</span>
                    <div className="product-price">₹{Number(product.price || 0).toFixed(2)}</div>
                </div>

                {quantity > 0 ? (
                    <div className="qty-control" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="qty-btn"
                            onClick={handleDecrement}
                            aria-label="Decrease quantity"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="qty-count">{quantity}</span>
                        <button
                            type="button"
                            className="qty-btn"
                            onClick={handleIncrement}
                            aria-label="Increase quantity"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAdd}
                        className="add-btn"
                        type="button"
                        title="Add to Cart"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}