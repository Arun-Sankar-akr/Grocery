import React from 'react';
import { ArrowRight, ShieldCheck, Clock, Truck } from 'lucide-react';
import './HeroBanner.css';

export default function HeroBanner() {
    return (
        <section className="hero-section">
            <div className="hero-glow-1" />
            <div className="hero-glow-2" />

            <div className="hero-container">
                <div>
                    <div className="hero-tag">
                        <Clock size={14} /> 15-Minute Express Grocery Delivery
                    </div>

                    <h1 className="hero-title">
                        Farm Fresh Organic Essentials <br />
                        <span className="hero-title-highlight">Delivered Daily.</span>
                    </h1>

                    <p className="hero-description">
                        Handpicked organic vegetables, premium fruits, and dairy delivered straight from local artisan farms to your kitchen doorstep.
                    </p>

                    <div className="hero-buttons">
                        <a href="#products" className="btn-primary">
                            Shop Fresh Products <ArrowRight size={18} />
                        </a>
                        <a href="#explore" className="btn-secondary">
                            Explore Categories
                        </a>
                    </div>

                    <div className="hero-badges">
                        <div className="badge-item"><ShieldCheck size={16} color="#34d399" /> 100% Organic</div>
                        <div className="badge-item"><Truck size={16} color="#34d399" /> Free Shipping</div>
                        <div className="badge-item"><Clock size={16} color="#34d399" /> Fresh Guarantee</div>
                    </div>
                </div>

                <div className="hero-image-wrapper">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
                        alt="Fresh Groceries"
                        className="hero-img"
                    />
                    <div className="hero-floating-card">
                        <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', fontWeight: 700 }}>TODAY'S SPECIAL</p>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Organic Fruit Baskets</h4>
                        </div>
                        <span className="deal-discount">20% OFF</span>
                    </div>
                </div>
            </div>
        </section>
    );
}