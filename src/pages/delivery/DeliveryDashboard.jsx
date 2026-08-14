import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliverySidebar from '../../components/delivery/DeliverySidebar';
import DeliveryOrderCard from '../../components/delivery/DeliveryOrderCard';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { Search, Package, BellRing, X, Volume2, LogOut, Wallet } from 'lucide-react';
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
        <div className="admin-dashboard-layout" onClick={enableAudio}>
            {/* Audio Enable Banner */}
            {!audioEnabled && (
                <div onClick={enableAudio} className="audio-enable-banner">
                    <Volume2 size={15} /> Tap anywhere to enable live order sound alerts!
                </div>
            )}

            {/* Notification Toast */}
            {newOrderAlert && (
                <div className="new-order-toast">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="toast-icon">
                            <BellRing size={18} />
                        </div>
                        <div>
                            <h4 className="toast-title">New Order Arrived!</h4>
                            <p className="toast-desc">
                                Order #{String(newOrderAlert.id)} • ₹{Number(newOrderAlert.total || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setNewOrderAlert(null)} className="toast-close">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Sidebar */}
            <DeliverySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main className="admin-main-content">
                {/* Header Strip */}
                <div className="delivery-header-strip">
                    <div className="driver-status-badge">
                        <div className="status-dot-online"></div>
                        <span className="status-text-online">ONLINE</span>
                        <span className="driver-name-tag">| {currentDriver.name}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={13} /> Logout
                    </button>
                </div>

                {/* Earnings & Stats Summary */}
                <div className="driver-summary-card">
                    <div className="summary-card-top">
                        <div>
                            <span className="earnings-label">Today's Earnings</span>
                            <h2 className="earnings-amount">₹{totalDriverEarnings}</h2>
                        </div>
                        <div className="earnings-icon-wrapper">
                            <Wallet size={24} />
                        </div>
                    </div>

                    <div className="summary-stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Active Queue</span>
                            <p className="stat-value">{activeOrders.length}</p>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">On the Way</span>
                            <p className="stat-value blue">{outForDeliveryCount}</p>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Delivered</span>
                            <p className="stat-value green">{completedOrders.length}</p>
                        </div>
                    </div>
                </div>

                {/* Search Field */}
                <div className="delivery-search-wrapper">
                    <div className="delivery-search-input-box">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search Order ID, customer, address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="btn-clear-search">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Section Bar */}
                <div className="section-title-bar">
                    <h3 className="section-heading">
                        {isViewingActive ? 'Available & Assigned Orders' : 'Completed History'}
                    </h3>
                    <span className="count-badge">{displayOrders.length}</span>
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
                        <div className="no-data-msg">
                            <Package size={36} color="#94a3b8" />
                            <p>
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