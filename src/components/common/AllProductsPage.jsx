import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { useGrocery } from '../../context/GroceryContext';
import './AllProductsPage.css';

export default function AllProductsPage({ onBackToHome }) {
    const { products } = useGrocery();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Extract unique categories dynamically
    const categories = useMemo(() => {
        if (!products) return ['All'];
        const uniqueCats = Array.from(new Set(products.map(p => p.category)));
        return ['All', ...uniqueCats];
    }, [products]);

    // Filter products based on search and selected category
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
            {/* Top Navigation / Header */}
            <div className="all-products-header">
                <button className="btn-back" onClick={onBackToHome} type="button">
                    <ArrowLeft size={18} /> Back to Home
                </button>
                <div className="header-title-box">
                    <h2>Explore All Products</h2>
                    <p>{filteredProducts.length} items found</p>
                </div>
            </div>

            {/* Search and Category Filter Toolbar */}
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

            {/* Product Grid Listing */}
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