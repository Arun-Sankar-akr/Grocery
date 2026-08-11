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
        // 1. Create the new order
        const createdOrder = await createOrder(orderData);

        // 2. Reduce stock for each item in the placed order
        if (orderData.items && orderData.items.length > 0) {
            const stockUpdates = orderData.items.map(async (orderedItem) => {
                // Find matching product in state to compute remaining stock
                const existingProduct = products.find(p => p.id === orderedItem.id);

                if (existingProduct) {
                    const currentStock = Number(existingProduct.stock) || 0;
                    const purchasedQty = Number(orderedItem.quantity) || 0;
                    const newStock = Math.max(0, currentStock - purchasedQty);

                    // Update product stock via API
                    await saveProduct({
                        ...existingProduct,
                        stock: newStock
                    });
                }
            });

            await Promise.all(stockUpdates);
        }

        return createdOrder;
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