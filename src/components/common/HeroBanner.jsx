import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import './HeroBanner.css';

export default function HeroBanner() {
    return (
        <section className="hero-banner-section">
            <div className="hero-ambient-glow" />

            <div className="hero-banner-container">
                {/* Left Side: Copy, CTAs, Quick Categories */}
                <div className="hero-content-wrapper">
                    <div className="hero-status-pill">
                        <Sparkles size={14} /> 100% Certified Organic Harvest
                    </div>

                    <h1 className="hero-title-text">
                        Farm Fresh Essentials <br />
                        <span className="highlight">Delivered in 15 Mins.</span>
                    </h1>

                    <p className="hero-sub-text">
                        Handpicked organic vegetables, fresh fruits, and artisan dairy delivered straight from local partner farms to your door.
                    </p>

                    <div className="hero-cta-group">
                        <a href="#products" className="btn-emerald-primary">
                            Explore Fresh Products <ArrowRight size={18} />
                        </a>
                        <a href="#categories" className="btn-outline-secondary">
                            View Categories
                        </a>
                    </div>

                    {/* Interactive Category Chips */}
                    <div className="hero-categories-grid">
                        <a href="#products" className="hero-cat-chip">
                            <span>🥬</span> Organic Greens
                        </a>
                        <a href="#products" className="hero-cat-chip">
                            <span>🍎</span> Fresh Fruits
                        </a>
                        <a href="#products" className="hero-cat-chip">
                            <span>🥛</span> Farm Dairy
                        </a>
                        <a href="#products" className="hero-cat-chip">
                            <span>🥖</span> Bakery
                        </a>
                    </div>
                </div>

                {/* Right Side: Media Showcase & Floating Stat Cards */}
                <div className="hero-media-wrapper">
                    <div className="media-card-main">
                        <img
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
                            alt="Fresh Organic Groceries"
                            className="media-card-img"
                        />
                    </div>

                    {/* Top Left Floating Speed Badge */}
                    <div className="floating-stat-card">
                        <div className="stat-icon-box">
                            <Clock size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Express Delivery</span>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>~12 Mins Avg.</h4>
                        </div>
                    </div>

                    {/* Bottom Right Floating Offer Card */}
                    <div className="floating-deal-card">
                        <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 800, textTransform: 'uppercase' }}>Special Offer</span>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>Organic Fruit Baskets</h4>
                        </div>
                        <span className="deal-tag-badge">20% OFF</span>
                    </div>
                </div>
            </div>
        </section>
    );
}