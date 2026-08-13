import React from 'react';
import Navbar from '../../components/common/Navbar';
import HeroBanner from '../../components/common/HeroBanner';
import CategoryExplore from '../../components/common/CategoryExplore';
import ProductCard from '../../components/common/ProductCard';
import ContactSection from '../../components/common/ContactSection';
import Footer from '../../components/common/Footer';
import { useGrocery } from '../../context/GroceryContext';
import './HomePage.css';

export default function HomePage({ onOpenCart, onOpenLogin, onOpenDashboard, onViewAllProducts }) {
    const { products } = useGrocery();

    // 1. Show only featured products (or fall back to first 6 if no featured flags exist)
    const featuredProducts = products?.filter(p => p.featured || p.isFeatured).length > 0
        ? products.filter(p => p.featured || p.isFeatured)
        : products?.slice(0, 6);

    const handleViewAllClick = (e) => {
        e.preventDefault();
        if (onViewAllProducts) onViewAllProducts();
    };

    return (
        <div className="home-container">
            <Navbar
                onOpenCart={onOpenCart}
                onOpenLogin={onOpenLogin}
                onOpenDashboard={onOpenDashboard}
            />
            <HeroBanner />

            <section id="explore" className="section-wrapper">
                <h2 className="section-main-title" style={{ marginBottom: '24px' }}>
                    Explore Categories
                </h2>
                <CategoryExplore />
            </section>

            <section id="products" className="section-wrapper">
                <div className="section-header">
                    <div>
                        <h2 className="section-main-title">Fresh Daily Pickings</h2>
                        <p className="section-sub-title">Farm-fresh groceries delivered to your door in 15 minutes.</p>
                    </div>
                    <button
                        onClick={handleViewAllClick}
                        className="view-all-link"
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                    >
                        View All →
                    </button>
                </div>

                <div className="products-grid">
                    {featuredProducts?.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            <ContactSection />
            <Footer />
        </div>
    );
}