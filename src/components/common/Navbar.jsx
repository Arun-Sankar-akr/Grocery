import React, { useState } from 'react';
import { ShoppingBag, Sparkles, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onOpenCart, onOpenLogin, onOpenDashboard }) {
  const { cartItems } = useCart();
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <a href="#" className="navbar-logo">
          {/* <div className="logo-icon">
            {/* <Sparkles size={20} /> 
          </div> */}
          <span className="logo-text">
            Fresh<span>Cart</span>
          </span>
        </a>

        {/* Navigation Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#" className="active" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#explore" onClick={() => setIsMobileMenuOpen(false)}>Categories</a>
          <a href="#products" onClick={() => setIsMobileMenuOpen(false)}>Products</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Support</a>
          {currentUser && (
            <button
              onClick={() => {
                onOpenDashboard();
                setIsMobileMenuOpen(false);
              }}
              className="nav-link-btn"
            >
              My Dashboard
            </button>
          )}
        </div>

        {/* Actions Bar */}
        <div className="navbar-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="user-greeting" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                Hi, {currentUser.name?.split(' ')[0] || 'User'}
              </span>

              <button
                onClick={onOpenDashboard}
                className="role-btn active-user"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Go to User Dashboard"
              >
                <LayoutDashboard size={14} />
                <span className="btn-label-desktop">Dashboard</span>
              </button>

              <button
                onClick={logout}
                className="role-btn"
                title="Sign Out"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="role-btn active-user"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={14} /> Login
            </button>
          )}

          {/* Cart Icon */}
          <button onClick={onOpenCart} className="cart-btn">
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}