import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GroceryProvider } from './context/GroceryContext';

import HomePage from './pages/common/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProductsPage from './pages/admin/ManageProductsPage';
import ViewOrdersPage from './pages/admin/ViewOrdersPage';
import AdminSideBar from './components/admin/AdminSidebar';

import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import UserDashboard from './pages/user/UserDashboard';
import LoginPage from './pages/common/LoginPage';
import CartDrawer from './components/user/CartDrawer';
import CartPage from './pages/user/CartPage';
import AllProductsPage from './components/common/AllProductsPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';

// Complete Admin Workspace Layout with Sidebar Navigation
function AdminLayout() {
  const [activeTab, setActiveTab] = useState('deliveryPartners');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {activeTab === 'products' && <ManageProductsPage />}
        {activeTab === 'orders' && <ViewOrdersPage />}
        {(activeTab === 'deliveryPartners' || activeTab === 'dashboard') && <AdminDashboard />}
      </main>
    </div>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Check LocalStorage session directly in case state update/reload hasn't settled yet
  const savedDeliveryUser = JSON.parse(localStorage.getItem('deliveryUser') || 'null');
  const effectiveUser = currentUser || savedDeliveryUser;

  // 1. Admin Role Route (Renders Layout with Sidebar + Dynamic Tabs)
  if (effectiveUser?.role === 'admin') {
    return <AdminLayout />;
  }

  // 2. Delivery Partner Role Route
  if (
    effectiveUser?.role === 'delivery' ||
    effectiveUser?.role === 'delivery-partner'
  ) {
    return <DeliveryDashboard />;
  }

  // 3. Login Page
  if (currentPage === 'login') {
    return <LoginPage onClose={() => setCurrentPage('home')} onLoginSuccess={() => setCurrentPage('home')} />;
  }

  // 4. Cart / Checkout Page
  if (currentPage === 'cart') {
    return (
      <CartPage
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setCurrentPage('login')}
        onOrderPlaced={() => setCurrentPage('orders')}
      />
    );
  }

  // 5. User Dashboard / Orders Page
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

  // 6. Track Order Page
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

  // 7. All Products Page
  if (currentPage === 'all-products') {
    return (
      <>
        <AllProductsPage
          onBackToHome={() => setCurrentPage('home')}
          onOpenCart={() => setIsCartOpen(true)}
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

  // 8. Default Customer Homepage
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
    <BrowserRouter>
      <AuthProvider>
        <GroceryProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </GroceryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}