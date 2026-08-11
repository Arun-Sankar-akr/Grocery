import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GroceryProvider } from './context/GroceryContext';

import HomePage from './pages/common/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import LoginPage from './pages/common/LoginPage';
import CartDrawer from './components/user/CartDrawer';
import CartPage from './pages/user/CartPage';
import AllProductsPage from './components/common/AllProductsPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';

function AppContent() {
  const { currentUser } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'cart', 'orders', 'all-products', 'track-order'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 1. If an Admin is logged in, route directly to Admin Dashboard
  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  }

  // 2. Login Page
  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={() => setCurrentPage('home')} />;
  }

  // 3. Cart / Checkout Page
  if (currentPage === 'cart') {
    return (
      <CartPage
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setCurrentPage('login')}
        onOrderPlaced={() => setCurrentPage('orders')}
      />
    );
  }

  // 4. User Dashboard / Orders Page
  if (currentPage === 'orders') {
    return (
      <UserDashboard
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setCurrentPage('login')}
        onOpenDashboard={() => setCurrentPage('orders')}
        onTrackOrder={(order) => {
          setSelectedOrder(order);
          setCurrentPage('track-order');
        }}
      />
    );
  }

  // 5. Track Order Page
  if (currentPage === 'track-order') {
    return (
      <>
        <OrderTrackingPage
          order={selectedOrder}
          onOpenCart={() => setIsCartOpen(true)}
          onBackToOrders={() => setCurrentPage('orders')}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onGoToCart={() => setCurrentPage('cart')}
          onOpenLogin={() => setCurrentPage('login')}
        />
      </>
    );
  }

  // 6. All Products Page (View All Route)
  if (currentPage === 'all-products') {
    return (
      <>
        <AllProductsPage onBackToHome={() => setCurrentPage('home')} />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onGoToCart={() => setCurrentPage('cart')}
          onOpenLogin={() => setCurrentPage('login')}
        />
      </>
    );
  }

  // 7. Default Customer Homepage
  return (
    <>
      <HomePage
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setCurrentPage('login')}
        onOpenDashboard={() => setCurrentPage('orders')}
        onViewAllProducts={() => setCurrentPage('all-products')}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onGoToCart={() => setCurrentPage('cart')}
        onOpenLogin={() => setCurrentPage('login')}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GroceryProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </GroceryProvider>
    </AuthProvider>
  );
}