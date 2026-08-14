import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliverySidebar from '../../components/delivery/DeliverySidebar';
import DeliveryOrderCard from '../../components/delivery/DeliveryOrderCard';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { Search, Package, Truck, CheckCircle2, BellRing, X, Volume2, LogOut, Wallet } from 'lucide-react';
import { db } from '../../service/firebase';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './Delivery.css';

export default function DeliveryDashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const savedDriver = JSON.parse(localStorage.getItem('deliveryUser') || '{}');

    const currentDriver = {
        id: currentUser?.uid || currentUser?.id || savedDriver.id || 'DP-000',
        name: currentUser?.name || currentUser?.displayName || savedDriver.name || 'Delivery Partner'
    };

    const [activeTab, setActiveTab] = useState('active-deliveries');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [allOrders, setAllOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOrderAlert, setNewOrderAlert] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(false);

    const knownOrderIdsRef = useRef(new Set());
    const isInitialLoadRef = useRef(true);
    const audioCtxRef = useRef(null);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('deliveryUser');
            if (logout) {
                await logout();
            }
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    const enableAudio = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!audioCtxRef.current && AudioCtx) {
                audioCtxRef.current = new AudioCtx();
            }
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            setAudioEnabled(true);
        } catch (e) {
            console.error('Failed to initialize AudioContext:', e);
        }
    };

    const playOrderNotificationSound = () => {
        try {
            enableAudio();
            const audioCtx = audioCtxRef.current;
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            console.log('Audio autoplay blocked by browser:', e);
        }
    };

    useEffect(() => {
        const ordersRef = collection(db, 'orders');

        const unsubscribe = onSnapshot(
            ordersRef,
            (snapshot) => {
                const fetchedOrdersMap = new Map();

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const docId = docSnap.id;
                    const orderId = data.id || docId;

                    fetchedOrdersMap.set(String(orderId), {
                        id: orderId,
                        ...data
                    });
                });

                const fetchedOrders = Array.from(fetchedOrdersMap.values());

                if (!isInitialLoadRef.current) {
                    fetchedOrders.forEach((ord) => {
                        const idStr = String(ord.id);
                        const statusStr = String(ord.status || '').toLowerCase().trim();

                        const isNewStatus =
                            !statusStr ||
                            statusStr === 'order placed' ||
                            statusStr === 'placed' ||
                            statusStr === 'pending';

                        if (idStr && !knownOrderIdsRef.current.has(idStr) && isNewStatus && !ord.assignedToId) {
                            playOrderNotificationSound();
                            setNewOrderAlert(ord);
                        }
                    });
                } else {
                    isInitialLoadRef.current = false;
                }

                const updatedSet = new Set();
                fetchedOrders.forEach((ord) => updatedSet.add(String(ord.id)));
                knownOrderIdsRef.current = updatedSet;

                setAllOrders(fetchedOrders);
            },
            (error) => {
                console.error('Firestore subscription error:', error);
            }
        );

        return () => unsubscribe();
    }, []);

    const isViewingActive =
        activeTab === 'active-deliveries' ||
        activeTab === 'active' ||
        activeTab === 'deliveries' ||
        activeTab === 'orders' ||
        activeTab === '';

    const activeOrders = allOrders.filter((o) => {
        if (!o) return false;
        const status = String(o.status || '').toLowerCase().trim();

        const isActiveStatus =
            !status ||
            status === 'order placed' ||
            status === 'placed' ||
            status === 'packing' ||
            status === 'packed & ready' ||
            status === 'out for delivery' ||
            status === 'pending' ||
            status === 'processing';

        if (!isActiveStatus) return false;

        if (!o.assignedToId) return true;
        return String(o.assignedToId) === String(currentDriver.id);
    });

    const completedOrders = allOrders.filter((o) => {
        if (!o) return false;
        const status = String(o.status || '').toLowerCase().trim();
        const isDeliveredStatus = status === 'delivered' || status === 'completed';

        if (!isDeliveredStatus) return false;

        return String(o.assignedToId) === String(currentDriver.id);
    });

    const totalDriverEarnings = completedOrders.reduce((sum, order) => {
        const fee = order.deliveryFee || 30;
        const earnings = order.driverEarnings || Math.round((fee * 0.8) + 15);
        return sum + earnings;
    }, 0);

    const outForDeliveryCount = activeOrders.filter(
        (o) => String(o.status || '').toLowerCase().trim() === 'out for delivery'
    ).length;

    const tabOrders = isViewingActive ? activeOrders : completedOrders;

    const filteredOrders = tabOrders.filter((o) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        const idMatch = String(o.id || o._id || '').toLowerCase().includes(query);
        const nameMatch = String(o.shippingDetails?.name || o.user?.name || '').toLowerCase().includes(query);
        const mobileMatch = String(o.shippingDetails?.mobile || '').includes(query);
        const addressMatch = String(o.shippingDetails?.address || '').toLowerCase().includes(query);
        return idMatch || nameMatch || mobileMatch || addressMatch;
    });

    const displayOrders = Array.from(
        new Map(filteredOrders.map((ord) => [String(ord.id || ord._id), ord])).values()
    );

    const handleUpdate = async (orderId, newStatusData) => {
        const targetStatus = typeof newStatusData === 'object' ? newStatusData.status : newStatusData;
        const extraData = typeof newStatusData === 'object' ? newStatusData : {};
        const stringId = String(orderId);

        try {
            const orderDocRef = doc(db, 'orders', stringId);

            const docSnap = await getDoc(orderDocRef);
            if (docSnap.exists()) {
                const liveData = docSnap.data();
                if (
                    liveData.assignedToId &&
                    String(liveData.assignedToId) !== String(currentDriver.id)
                ) {
                    alert(`Order #${stringId} was already claimed by ${liveData.assignedTo || 'another partner'}.`);
                    return;
                }
            }

            const updatedFields = {
                ...extraData,
                id: stringId,
                status: targetStatus,
                updatedAt: new Date().toISOString()
            };

            await setDoc(orderDocRef, updatedFields, { merge: true });
        } catch (err) {
            console.error('Failed to update Firestore document:', err);
            alert(`Failed to update order: ${err.message || 'Check database permissions.'}`);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: '#f8fafc',
                width: '100%',
                position: 'relative'
            }}
            onClick={enableAudio}
        >
            {/* Audio Enabled Bar */}
            {!audioEnabled && (
                <div
                    onClick={enableAudio}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        cursor: 'pointer',
                        zIndex: 10000,
                        borderBottom: '1px solid #fde68a'
                    }}
                >
                    <Volume2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Tap anywhere to enable live order sound alerts!
                </div>
            )}

            {/* Notification Pop-up */}
            {newOrderAlert && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '16px',
                        left: '16px',
                        maxWidth: '400px',
                        margin: '0 auto',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderLeft: '5px solid #059669'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#059669', padding: '6px', borderRadius: '50%', color: '#ffffff' }}>
                            <BellRing size={18} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>New Order Arrived!</h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Order #{String(newOrderAlert.id)} • ₹{Number(newOrderAlert.total || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNewOrderAlert(null)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Render Sidebar */}
            <DeliverySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main
                style={{
                    flex: 1,
                    width: '100%',
                    padding: '16px',
                    paddingBottom: '80px',
                    overflowX: 'hidden'
                }}
            >
                {/* Header Strip */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        marginBottom: '16px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>ONLINE</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>| {currentDriver.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={13} /> Logout
                    </button>
                </div>

                {/* Driver Earnings Card */}
                <div
                    style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        marginBottom: '16px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Today's Earnings</span>
                            <h2 style={{ margin: '2px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>₹{totalDriverEarnings}</h2>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px', color: '#059669' }}>
                            <Wallet size={24} />
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '12px', textAlign: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Active Queue</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{activeOrders.length}</p>
                        </div>
                        <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>On the Way</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>{outForDeliveryCount}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Delivered</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 700, color: '#16a34a' }}>{completedOrders.length}</p>
                        </div>
                    </div>
                </div>

                {/* Search Field */}
                <div style={{ marginBottom: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            gap: '10px'
                        }}
                    >
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search Order ID, customer, address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.85rem',
                                color: '#0f172a',
                                background: 'transparent'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Section Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isViewingActive ? 'Available & Assigned Orders' : 'Completed History'}
                    </h3>
                    <span style={{ background: '#e2e8f0', color: '#334155', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                        {displayOrders.length}
                    </span>
                </div>

                {/* Delivery Cards Container */}
                <div className="delivery-grid">
                    {displayOrders.length > 0 ? (
                        displayOrders.map((order) => (
                            <DeliveryOrderCard
                                key={String(order.id || order._id)}
                                order={order}
                                onUpdateStatus={handleUpdate}
                                onViewDetails={() => setSelectedOrder(order)}
                                currentDriverId={currentDriver.id}
                                currentDriverName={currentDriver.name}
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                padding: '32px 16px',
                                textAlign: 'center',
                                background: '#ffffff',
                                borderRadius: '14px',
                                border: '1px dashed #cbd5e1'
                            }}
                        >
                            <Package size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>
                                {searchTerm
                                    ? `No matching orders for "${searchTerm}"`
                                    : `No ${isViewingActive ? 'active' : 'completed'} orders.`}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}