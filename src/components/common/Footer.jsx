import React from 'react';
import { Sparkles } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div>
                    <div className="footer-brand">
                        <Sparkles size={20} color="var(--primary-color)" />
                        Fresh<span>Cart</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                        Delivering farm-fresh organic produce directly to urban homes with guaranteed quality and speed.
                    </p>
                </div>

                <div>
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-links">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#explore">Categories</a></li>
                        <li><a href="#products">Daily Offers</a></li>
                        <li><a href="#contact">Support</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer-heading">Categories</h4>
                    <ul className="footer-links">
                        <li><a href="#">Fresh Vegetables</a></li>
                        <li><a href="#">Organic Fruits</a></li>
                        <li><a href="#">Dairy & Eggs</a></li>
                        <li><a href="#">Snacks & Drinks</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer-heading">Newsletter</h4>
                    <p style={{ fontSize: '0.8rem' }}>Get 15% off your first order.</p>
                    <div className="newsletter-box">
                        <input type="email" placeholder="Your email" className="newsletter-input" />
                        <button className="newsletter-btn">Join</button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 FreshCart Store. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}