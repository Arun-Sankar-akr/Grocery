import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../service/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    saveProduct as apiSaveProduct,
    deleteProduct as apiDeleteProduct,
    createOrder as apiCreateOrder,
    updateOrderStatus as apiUpdateOrderStatus
} from '../service/apiService';

export const GroceryContext = createContext();

export const GroceryProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Modal State Management ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeProductModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    // 1. Real-time Listener for Products Collection
    useEffect(() => {
        const productsRef = collection(db, 'products');
        const unsubscribe = onSnapshot(
            productsRef,
            (snapshot) => {
                const liveProducts = [];
                snapshot.forEach((docSnap) => {
                    liveProducts.push({
                        id: docSnap.id,
                        ...docSnap.data()
                    });
                });
                setProducts(liveProducts);
                setLoading(false);
            },
            (error) => {
                console.error("Firestore Products Subscription Error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // 2. Real-time Listener for Orders Collection
    useEffect(() => {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const liveOrders = [];
                snapshot.forEach((docSnap) => {
                    liveOrders.push({
                        id: docSnap.id,
                        ...docSnap.data()
                    });
                });
                setOrders(liveOrders);
            },
            (error) => {
                console.error("Firestore Orders Subscription Error:", error);
            }
        );

        return () => unsubscribe();
    }, []);

    // --- Product Handlers ---
    const saveProduct = async (productData) => {
        try {
            const payload = editingProduct?.id
                ? { ...productData, id: editingProduct.id }
                : productData;
            await apiSaveProduct(payload);
        } catch (err) {
            console.error("Failed to save product:", err);
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            if (window.confirm("Are you sure you want to delete this product?")) {
                await apiDeleteProduct(id);
            }
        } catch (err) {
            console.error("Failed to delete product:", err);
            throw err;
        }
    };

    // --- Order Handlers ---
    const placeOrder = async (orderData) => {
        try {
            const generatedEarthId = orderData.id || `EARTH-${Math.floor(1000 + Math.random() * 9000)}`;

            const formattedOrder = {
                ...orderData,
                id: generatedEarthId,
                status: orderData.status || 'Order Placed',
                createdAt: new Date().toISOString()
            };

            const created = await apiCreateOrder(formattedOrder);
            setCart([]);
            return created || formattedOrder;
        } catch (err) {
            console.error("Failed to place order:", err);
            throw err;
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await apiUpdateOrderStatus(orderId, newStatus);
        } catch (err) {
            console.error("Failed to update status:", err);
            throw err;
        }
    };

    // --- Cart Handlers ---
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);

    return (
        <GroceryContext.Provider
            value={{
                products,
                orders,
                cart,
                loading,
                cartTotal,
                isModalOpen,
                editingProduct,
                openProductModal,
                closeProductModal,
                saveProduct,
                deleteProduct,
                addOrUpdateProduct: saveProduct,
                removeProduct: deleteProduct,
                placeOrder,
                updateOrderStatus,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                setOrders,
                setProducts
            }}
        >
            {children}
        </GroceryContext.Provider>
    );
};

// EXPORT THE HOOK HERE
export const useGrocery = () => useContext(GroceryContext);