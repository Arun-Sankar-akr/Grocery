import React, { useState } from 'react';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
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
        <a href="#" className="navbar-logo">
          <img src="/favicon.png" alt="EarthBasket Logo" className="logo" />
          <span className="logo-text">
            Earth<span>Basket</span>
          </span>
        </a>

        {/* Navigation Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="/" className="active" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#explore" onClick={() => setIsMobileMenuOpen(false)}>Categories</a>
          <a href="#products" onClick={() => setIsMobileMenuOpen(false)}>Products</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Support</a>
        </div>

        {/* Actions Bar */}
        <div className="navbar-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="user-greeting">
                Hi, {currentUser.name?.split(' ')[0] || 'User'}
              </span>

              <button
                onClick={onOpenDashboard}
                className="role-btn active-user"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Go to User Dashboard"
                type="button"
              >
                <LayoutDashboard size={14} />
                <span className="btn-label-desktop">Dashboard</span>
              </button>

              <button
                onClick={logout}
                className="role-btn logout-btn"
                title="Sign Out"
                type="button"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="role-btn active-user"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              type="button"
            >
              <User size={14} /> Login
            </button>
          )}

          {/* Cart Icon */}
          <button onClick={onOpenCart} className="cart-btn" type="button" aria-label="Open Shopping Cart">
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            type="button"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}