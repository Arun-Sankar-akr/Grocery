import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, ShoppingCart } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { useGrocery } from '../../context/GroceryContext';
import { useCart } from '../../context/CartContext';
import './AllProductsPage.css';

export default function AllProductsPage({ onBackToHome, onOpenCart }) {
    const { products } = useGrocery();
    const { cartItems } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Calculate total quantity of items in cart
    const cartCount = useMemo(() => {
        if (!cartItems) return 0;
        return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [cartItems]);

    const categories = useMemo(() => {
        if (!products) return ['All'];
        const uniqueCats = Array.from(new Set(products.map(p => p.category)));
        return ['All', ...uniqueCats];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'All' ||
                product.category?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="all-products-container">
            <div className="all-products-header">
                <div className="header-actions-left">
                    <button className="btn-back" onClick={onBackToHome} type="button">
                        <ArrowLeft size={18} /> Back to Home
                    </button>
                    <button className="btn-cart" onClick={onOpenCart} type="button" aria-label="Open Cart">
                        <ShoppingCart size={18} />
                        <span>Cart</span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>

                <div className="header-title-box">
                    <h2>Explore All Products</h2>
                    <p>{filteredProducts.length} items found</p>
                </div>
            </div>

            <div className="filter-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="category-filter-chips">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                            type="button"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="no-products-view">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or category filter.</p>
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}