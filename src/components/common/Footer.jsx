import React from 'react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div>
                    <div className="footer-brand">
                        <img
                            src="/favicon.png"
                            alt="EarthBasket Logo"
                            className="footer-logo-img"
                        />
                        <span>Earth</span>Basket
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.5' }}>
                        Farm-Fresh Organic. Delivered in Minutes.
                    </p>
                </div>

                <div>
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#explore">Categories</a></li>
                        <li><a href="#products">Products</a></li>
                        <li><a href="#contact">Support</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer-heading">Categories</h4>
                    <ul className="footer-links">
                        <li><a href="#products">Fresh Vegetables</a></li>
                        <li><a href="#products">Organic Fruits</a></li>
                        <li><a href="#products">Dairy & Eggs</a></li>
                        <li><a href="#products">Daily Essentials</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer-heading">Newsletter</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
                        Subscribe to get updates on daily discounts and organic produce arrivals.
                    </p>
                    <div className="newsletter-box">
                        <input type="email" placeholder="Your email address" className="newsletter-input" />
                        <button type="button" className="newsletter-btn">Subscribe</button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} EarthBasket. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a href="#" style={{ color: '#64748b' }}>Privacy Policy</a>
                    <a href="#" style={{ color: '#64748b' }}>Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}