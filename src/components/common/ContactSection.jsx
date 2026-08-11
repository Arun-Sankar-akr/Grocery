import React from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import './ContactSection.css';

export default function ContactSection() {
    return (
        <section id="contact" className="contact-section">
            <div className="contact-container">
                <div>
                    <span className="section-subtitle">24/7 Customer Support</span>
                    <h2 className="section-title">We're Here To Help You Eat Fresh</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Have questions regarding delivery times, product sourcing, or order status? Drop us a line anytime.
                    </p>

                    <div className="contact-info-list">
                        <div className="contact-info-item">
                            <div className="contact-icon-box"><Phone size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Helpline</p>
                                <p style={{ fontWeight: 700 }}>+91 9047638853</p>
                            </div>
                        </div>

                        <div className="contact-info-item">
                            <div className="contact-icon-box"><Mail size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email Support</p>
                                <p style={{ fontWeight: 700 }}>supportakr@gmail.com</p>
                            </div>
                        </div>

                        <div className="contact-info-item">
                            <div className="contact-icon-box"><MapPin size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Main Hub</p>
                                <p style={{ fontWeight: 700 }}>Tamil Nadu, India 620018</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form-card">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>Send Message</h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" placeholder="John Doe" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" placeholder="john@example.com" className="form-input" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea rows="4" placeholder="How can we help?" className="form-textarea" />
                        </div>

                        <button type="submit" className="submit-btn">
                            <Send size={16} /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}