import { db } from './firebase';
import {
    collection,
    setDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

/**
 * 1. Live subscription to Products collection
 */
export function subscribeToProducts(callback) {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    return onSnapshot(
        q,
        (snapshot) => {
            const products = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            callback(products);
        },
        (error) => {
            console.error("Error listening to products collection:", error);
        }
    );
}

/**
 * 2. Live subscription to Orders collection
 */
export function subscribeToOrders(callback) {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
        q,
        (snapshot) => {
            const orders = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            callback(orders);
        },
        (error) => {
            console.error("Error listening to orders collection:", error);
        }
    );
}

/**
 * 3. Save Product (Handles Create & Update safely)
 */
export async function saveProduct(product) {
    try {
        if (!product || typeof product !== 'object') {
            throw new Error("Invalid product data supplied.");
        }

        const stringId = product.id ? String(product.id) : doc(collection(db, PRODUCTS_COLLECTION)).id;

        const sanitizedData = {
            id: stringId,
            name: product.name || '',
            category: product.category || 'Fresh Vegetables',
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            unit: product.unit || '',
            image: product.image || '',
            updatedAt: new Date().toISOString()
        };

        if (!product.id) {
            sanitizedData.createdAt = new Date().toISOString();
        }

        const productRef = doc(db, PRODUCTS_COLLECTION, stringId);
        await setDoc(productRef, sanitizedData, { merge: true });
        console.log("Product saved successfully:", stringId);
        return stringId;
    } catch (error) {
        console.error("Failed to save product in Firestore:", error);
        throw error;
    }
}

/**
 * 4. Delete Product
 */
export async function deleteProduct(id) {
    try {
        if (!id) return;
        const productRef = doc(db, PRODUCTS_COLLECTION, String(id));
        await deleteDoc(productRef);
        console.log("Product deleted from Firestore:", id);
    } catch (error) {
        console.error("Failed to delete product from Firestore:", error);
        throw error;
    }
}

/**
 * 5. Create Order (Uses exact custom Order ID like ORD-XXXXXX as Document ID)
 */
export async function createOrder(orderData) {
    try {
        const orderId = String(orderData.id || orderData._id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`);
        
        const sanitizedOrder = {
            ...orderData,
            id: orderId,
            status: orderData.status || 'Order Placed',
            createdAt: orderData.createdAt || new Date().toISOString()
        };

        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await setDoc(orderRef, sanitizedOrder, { merge: true });
        console.log("Order created/upserted in Firestore with ID:", orderId);
        return sanitizedOrder;
    } catch (error) {
        console.error("Failed to create order:", error);
        throw error;
    }
}

/**
 * 6. Update Order Status
 */
export async function updateOrderStatus(orderId, newStatus) {
    try {
        if (!orderId) return;
        const stringId = String(orderId);
        const orderRef = doc(db, ORDERS_COLLECTION, stringId);

        const updatePayload = typeof newStatus === 'object'
            ? { ...newStatus, updatedAt: new Date().toISOString() }
            : { status: newStatus, updatedAt: new Date().toISOString() };

        await setDoc(orderRef, updatePayload, { merge: true });
        console.log("Order updated in Firestore:", stringId);
    } catch (error) {
        console.error("Failed to update order status:", error);
        throw error;
    }
}

/**
 * 7. Cancel Order
 */
export async function cancelOrder(orderId) {
    try {
        if (!orderId) return;
        const orderRef = doc(db, ORDERS_COLLECTION, String(orderId));
        await setDoc(orderRef, {
            status: 'Cancelled',
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Failed to cancel order:", error);
        throw error;
    }
}