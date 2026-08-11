import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
    const { addToCart, cartItems = [] } = useCart();
    const isInCart = cartItems.some(item => item.id === product.id);

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

                <button
                    onClick={() => addToCart(product)}
                    className={`add-btn ${isInCart ? 'in-cart' : ''}`}
                    type="button"
                    title={isInCart ? 'In Cart' : 'Add to Cart'}
                >
                    {isInCart ? <Check size={18} /> : <Plus size={18} />}
                </button>
            </div>
        </div>
    );
}