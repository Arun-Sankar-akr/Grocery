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

    // Fallback to localStorage session if AuthContext isn't persisted directly
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
            navigate('/'); // Redirects to home page
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/'); // Fallback redirect if error occurs
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
            className="admin-dashboard-layout"
            style={{ position: 'relative' }}
            onClick={enableAudio}
        >
            {!audioEnabled && (
                <div
                    onClick={enableAudio}
                    style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #fde68a'
                    }}
                >
                    <Volume2 size={16} /> Click anywhere on this page once to enable live order sound alerts!
                </div>
            )}

            {newOrderAlert && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        borderLeft: '5px solid #059669'
                    }}
                >
                    <div style={{ background: '#059669', padding: '8px', borderRadius: '50%', color: '#ffffff' }}>
                        <BellRing size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>New Order Arrived!</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                            Order #{String(newOrderAlert.id)} • ₹{Number(newOrderAlert.total || 0).toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={() => setNewOrderAlert(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            marginLeft: '8px'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <DeliverySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="admin-main-content">
                <header className="admin-top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2>{isViewingActive ? 'Active Deliveries' : 'Completed Deliveries'}</h2>
                        <span
                            style={{
                                backgroundColor: isViewingActive ? '#059669' : '#64748b',
                                color: '#ffffff',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 700
                            }}
                        >
                            {displayOrders.length} {displayOrders.length === 1 ? 'Order' : 'Orders'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                            Partner: <span style={{ color: '#059669', fontWeight: 700 }}>{currentDriver.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                        margin: '20px 0 10px 0'
                    }}
                >
                    <div
                        style={{
                            background: '#f0fdf4',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                    >
                        <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '10px', color: '#16a34a' }}>
                            <Wallet size={22} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Total Earnings</p>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#14532d' }}>
                                ₹{totalDriverEarnings}
                            </h3>
                        </div>
                    </div>

                    <div
                        style={{
                            background: '#ffffff',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                    >
                        <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px', color: '#059669' }}>
                            <Package size={22} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>My Active Queue</p>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                                {activeOrders.length}
                            </h3>
                        </div>
                    </div>

                    <div
                        style={{
                            background: '#ffffff',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                    >
                        <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', color: '#2563eb' }}>
                            <Truck size={22} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Out for Delivery</p>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                                {outForDeliveryCount}
                            </h3>
                        </div>
                    </div>

                    <div
                        style={{
                            background: '#ffffff',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                    >
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', color: '#475569' }}>
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Completed</p>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                                {completedOrders.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div style={{ margin: '15px 0' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            gap: '10px',
                            maxWidth: '480px'
                        }}
                    >
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, customer name, mobile, address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.9rem',
                                color: '#0f172a'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    color: '#94a3b8',
                                    fontWeight: 700
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="delivery-grid" style={{ padding: '10px 0 20px 0' }}>
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
                            className="no-data-msg"
                            style={{
                                padding: '40px',
                                textAlign: 'center',
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px dashed #cbd5e1'
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#334155' }}>
                                {searchTerm
                                    ? `No matching orders found for "${searchTerm}"`
                                    : `No ${isViewingActive ? 'active' : 'completed'} deliveries available.`}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}