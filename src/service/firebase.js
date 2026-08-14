import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    setDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    getDocs,
    where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAF95Qs_te2uFIXg8fvU57TrVpupaG5Hug",
    authDomain: "grocery-app-2k26.firebaseapp.com",
    projectId: "grocery-app-2k26",
    storageBucket: "grocery-app-2k26.firebasestorage.app",
    messagingSenderId: "590290573090",
    appId: "1:590290573090:web:86ef35894f8efddc50b77b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const APPLICATIONS_COLLECTION = 'delivery_applications';

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
 * 3. Save Product
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
    } catch (error) {
        console.error("Failed to delete product from Firestore:", error);
        throw error;
    }
}

/**
 * 5. Create Order
 */
export async function createOrder(orderData) {
    try {
        const orderId = String(
            orderData.id || orderData._id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`
        );

        const rawCoords = orderData.coordinates || orderData.shippingDetails?.coordinates || null;
        const coordinates = rawCoords && rawCoords.latitude && rawCoords.longitude ? {
            latitude: Number(rawCoords.latitude),
            longitude: Number(rawCoords.longitude)
        } : null;

        const detectedLocation = orderData.detectedLocation ||
            orderData.shippingDetails?.detectedLocation ||
            orderData.shippingDetails?.address ||
            'Location Detected on Cart';

        const sanitizedOrder = {
            ...orderData,
            id: orderId,
            status: orderData.status || 'Order Placed',
            createdAt: orderData.createdAt || new Date().toISOString(),
            coordinates: coordinates,
            detectedLocation: typeof detectedLocation === 'string' ? detectedLocation : detectedLocation?.address || '',
            shippingDetails: {
                ...(orderData.shippingDetails || {}),
                address: orderData.shippingDetails?.address || (typeof detectedLocation === 'string' ? detectedLocation : ''),
                mobile: orderData.shippingDetails?.mobile || orderData.user?.mobile || '',
                name: orderData.shippingDetails?.name || orderData.user?.name || 'Customer',
                coordinates: coordinates
            }
        };

        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await setDoc(orderRef, sanitizedOrder, { merge: true });
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

/**
 * 8. Add Delivery Partner with Generated Credentials (Direct)
 */
export async function createDeliveryPartner({ name, phone, username, password, email }) {
    try {
        const partnerId = `DP-${Math.floor(1000 + Math.random() * 9000)}`;
        const loginEmail = email || `${username.toLowerCase().trim()}@earthbasket.com`;

        const partnerData = {
            uid: partnerId,
            id: partnerId,
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            username: username.toLowerCase().trim(),
            password: password,
            email: loginEmail,
            role: 'delivery',
            createdAt: new Date().toISOString()
        };

        const partnerRef = doc(db, USERS_COLLECTION, partnerId);
        await setDoc(partnerRef, partnerData, { merge: true });
        return partnerData;
    } catch (error) {
        console.error("Failed to create Delivery Partner:", error);
        throw error;
    }
}

/**
 * 9. Fetch / Subscribe to Delivery Partners list
 */
export function subscribeToDeliveryPartners(callback) {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', 'delivery'));
    return onSnapshot(
        q,
        (snapshot) => {
            const partners = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            callback(partners);
        },
        (error) => {
            console.error("Error listening to delivery partners collection:", error);
        }
    );
}

/**
 * 10. Submit Delivery Partner Application Form
 */
export async function submitDeliveryPartnerApplication(appData) {
    try {
        const appId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
        const sanitizedApp = {
            id: appId,
            name: appData.name.trim(),
            phone: appData.phone.trim(),
            email: appData.email.trim().toLowerCase(),
            vehicleType: appData.vehicleType,
            licenseNumber: appData.licenseNumber.trim(),
            city: appData.city.trim(),
            address: appData.address ? appData.address.trim() : '',
            status: 'pending',
            appliedAt: new Date().toISOString()
        };

        const appRef = doc(db, APPLICATIONS_COLLECTION, appId);
        await setDoc(appRef, sanitizedApp);
        return sanitizedApp;
    } catch (error) {
        console.error("Error submitting delivery partner application:", error);
        throw error;
    }
}

/**
 * 11. Subscribe to Delivery Partner Applications for Admin review
 */
export function subscribeToDeliveryApplications(callback) {
    const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('appliedAt', 'desc'));
    return onSnapshot(
        q,
        (snapshot) => {
            const apps = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            callback(apps);
        },
        (error) => {
            console.error("Error listening to delivery applications:", error);
        }
    );
}

/**
 * 12. Approve Delivery Application & Auto-Generate Credentials and Partner ID
 */
export async function approveDeliveryApplication(application) {
    try {
        const cleanName = application.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const username = `driver_${cleanName.slice(0, 8)}_${randomNum}`;
        const partnerId = `DP-${Math.floor(1000 + Math.random() * 9000)}`;
        const autoPassword = `Pass@${Math.floor(100 + Math.random() * 900)}`;

        const partnerData = {
            uid: partnerId,
            id: partnerId,
            name: application.name,
            phone: application.phone,
            email: application.email || `${username}@earthbasket.com`,
            username: username,
            password: autoPassword,
            vehicleType: application.vehicleType,
            licenseNumber: application.licenseNumber,
            city: application.city,
            role: 'delivery',
            status: 'active',
            approvedAt: new Date().toISOString()
        };

        // Create partner record in users collection
        const partnerRef = doc(db, USERS_COLLECTION, partnerId);
        await setDoc(partnerRef, partnerData, { merge: true });

        // Update application record status
        const appRef = doc(db, APPLICATIONS_COLLECTION, application.id);
        await setDoc(appRef, {
            status: 'approved',
            generatedUsername: username,
            generatedPassword: autoPassword,
            partnerId: partnerId,
            approvedAt: new Date().toISOString()
        }, { merge: true });

        return partnerData;
    } catch (error) {
        console.error("Failed to approve delivery application:", error);
        throw error;
    }
}

/**
 * 13. Reject Delivery Application
 */
export async function rejectDeliveryApplication(appId) {
    try {
        const appRef = doc(db, APPLICATIONS_COLLECTION, appId);
        await setDoc(appRef, {
            status: 'rejected',
            rejectedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Failed to reject delivery application:", error);
        throw error;
    }
}