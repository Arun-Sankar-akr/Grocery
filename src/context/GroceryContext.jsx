import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    subscribeToProducts,
    subscribeToOrders,
    saveProduct,
    deleteProduct,
    createOrder,
    updateOrderStatus,
    cancelOrder
} from '../service/apiService';

const GroceryContext = createContext();

export const GroceryProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        const unsubscribeProducts = subscribeToProducts(setProducts);
        const unsubscribeOrders = subscribeToOrders(setOrders);

        return () => {
            if (unsubscribeProducts) unsubscribeProducts();
            if (unsubscribeOrders) unsubscribeOrders();
        };
    }, []);

    const handleSaveProduct = async (product) => {
        await saveProduct(product);
        closeProductModal();
    };

    const handleDeleteProduct = async (id) => {
        await deleteProduct(id);
    };

    const handleCreateOrder = async (orderData) => {
        return await createOrder(orderData);
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        await updateOrderStatus(orderId, status);
    };

    const handleCancelOrder = async (orderId) => {
        await cancelOrder(orderId);
    };

    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeProductModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    return (
        <GroceryContext.Provider value={{
            products,
            orders,
            saveProduct: handleSaveProduct,
            deleteProduct: handleDeleteProduct,
            createOrder: handleCreateOrder,
            updateOrderStatus: handleUpdateOrderStatus,
            cancelOrder: handleCancelOrder,
            isModalOpen,
            editingProduct,
            openProductModal,
            closeProductModal
        }}>
            {children}
        </GroceryContext.Provider>
    );
};

export const useGrocery = () => useContext(GroceryContext);