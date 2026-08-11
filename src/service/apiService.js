import { db } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

export function subscribeToProducts(callback) {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(products);
    });
}

export function subscribeToOrders(callback) {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(orders);
    });
}

export async function saveProduct(product) {
    if (product.id) {
        const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
        const { id, ...dataToUpdate } = product;
        await updateDoc(productRef, dataToUpdate);
    } else {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
            name: product.name,
            category: product.category,
            price: Number(product.price),
            stock: Number(product.stock),
            unit: product.unit,
            image: product.image,
            createdAt: new Date().toISOString()
        });
    }
}

export async function deleteProduct(id) {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
}

export async function createOrder(orderData) {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...orderData,
        status: 'Order Placed',
        createdAt: new Date().toISOString()
    });
    return docRef.id;
}

export async function updateOrderStatus(orderId, newStatus) {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status: newStatus });
}

export async function cancelOrder(orderId) {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status: 'Cancelled' });
}