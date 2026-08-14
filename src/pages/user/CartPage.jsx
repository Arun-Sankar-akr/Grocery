import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CustomAlertModal from '../../components/common/CustomAlertModal';
import ShippingModal from './ShippingModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useGrocery } from '../../context/GroceryContext';
import { Trash2, MapPin, Truck, RefreshCw, Search, Layers, Globe, Receipt, Info, ShoppingBag } from 'lucide-react';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CartPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TILE_LAYERS = {
    streets: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri'
    }
};

const TRICHY_HUB = { lat: 10.7905, lng: 78.7047 };

const LOCALITY_PRESETS = [
    { name: 'Allithurai', lat: 10.7981, lng: 78.6186 },
    { name: 'Thillai Nagar', lat: 10.8272, lng: 78.6890 },
    { name: 'KK Nagar', lat: 10.7726, lng: 78.6942 },
    { name: 'Cantonment', lat: 10.8030, lng: 78.6856 },
    { name: 'Golden Rock', lat: 10.7850, lng: 78.7180 }
];

const PLATFORM_FEE = 6;

const calculateSwiggyDeliveryFee = (km) => {
    if (km <= 3) return 30;
    if (km <= 6) return 30 + Math.ceil(km - 3) * 10;
    if (km <= 10) return 60 + Math.ceil(km - 6) * 15;
    return 120 + Math.ceil(km - 10) * 20;
};

const calculateHaversineDistance = (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};

function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat && center.lng) {
            map.invalidateSize();
            map.flyTo([center.lat, center.lng], 15, { duration: 1.2 });
        }
    }, [center, map]);
    return null;
}

function DraggableMarker({ position, onPositionChange }) {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const latLng = marker.getLatLng();
                    onPositionChange({ lat: latLng.lat, lng: latLng.lng });
                }
            },
        }),
        [onPositionChange]
    );

    useMapEvents({
        click(e) {
            onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position ? (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[position.lat, position.lng]}
            ref={markerRef}
        />
    ) : null;
}

export default function CartPage({ onOpenCart, onOpenLogin, onOrderPlaced }) {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const { createOrder, placeOrder } = useGrocery();

    const saveOrderToContext = createOrder || placeOrder;

    const [userLocation, setUserLocation] = useState(LOCALITY_PRESETS[0]);
    const [mapType, setMapType] = useState('streets');
    const [distanceKm, setDistanceKm] = useState(7.2);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState('Allithurai (Selected)');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        type: 'warning',
        title: '',
        message: '',
        primaryBtnText: '',
        onPrimaryAction: null
    });

    const handleLocationUpdate = useCallback((newCoords, statusText) => {
        setUserLocation(newCoords);
        const calculatedKm = calculateHaversineDistance(TRICHY_HUB, newCoords);
        setDistanceKm(calculatedKm < 1 ? 1 : calculatedKm);
        setLocationStatus(statusText || 'Pin updated on map');
    }, []);

    const toggleMapType = () => {
        setMapType((prev) => (prev === 'streets' ? 'satellite' : 'streets'));
    };

    const handleSearchLocation = async (e) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) return;

        setIsSearching(true);
        setLocationStatus(`Searching "${trimmedQuery}"...`);

        try {
            let response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
                    trimmedQuery + ', Tiruchirappalli, Tamil Nadu, India'
                )}`
            );
            let data = await response.json();

            if (!data || data.length === 0) {
                response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(trimmedQuery)}`
                );
                data = await response.json();
            }

            if (data && data.length > 0) {
                const topResult = data[0];
                const resultCoords = {
                    lat: parseFloat(topResult.lat),
                    lng: parseFloat(topResult.lon),
                    name: topResult.display_name.split(',')[0]
                };

                const shortName = topResult.display_name.split(',').slice(0, 2).join(', ');
                handleLocationUpdate(resultCoords, `Found: ${shortName}`);
            } else {
                setLocationStatus(`No results found for "${trimmedQuery}".`);
            }
        } catch (error) {
            console.error('Search error:', error);
            setLocationStatus('Search unavailable. Drag pin on map.');
        } finally {
            setIsSearching(false);
        }
    };

    const detectCustomerLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('GPS not supported by browser');
            return;
        }

        setIsDetectingLocation(true);
        setLocationStatus('Acquiring high-accuracy GPS...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const accurateCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                handleLocationUpdate(accurateCoords, 'GPS Location Found');
                setIsDetectingLocation(false);
            },
            () => {
                setLocationStatus('Unable to acquire GPS. Pick on map.');
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    const subtotal = Number(cartTotal) || 0;
    const deliveryFee = calculateSwiggyDeliveryFee(distanceKm);
    const grandTotal = subtotal + deliveryFee + PLATFORM_FEE;

    const handleInitiateOrder = () => {
        if (!currentUser) {
            setAlertConfig({
                isOpen: true,
                type: 'warning',
                title: 'Login Required',
                message: 'Please log in to your account to place your order.',
                primaryBtnText: 'Login Now',
                onPrimaryAction: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    onOpenLogin();
                }
            });
            return;
        }
        setIsShippingModalOpen(true);
    };

    const handleConfirmOrder = async (shippingDetails) => {
        const newOrder = {
            id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            userId: currentUser?.uid || 'guest-id',
            user: {
                name: shippingDetails.name,
                email: currentUser?.email || ''
            },
            detectedLocation: locationStatus,
            coordinates: { latitude: userLocation.lat, longitude: userLocation.lng },
            shippingDetails: {
                ...shippingDetails,
                detectedLocation: locationStatus,
                coordinates: { latitude: userLocation.lat, longitude: userLocation.lng }
            },
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity
            })),
            breakdown: { subtotal, deliveryFee, platformFee: PLATFORM_FEE, distanceKm },
            total: Number(grandTotal.toFixed(2)),
            status: 'Order Placed',
            createdAt: new Date().toISOString()
        };

        try {
            setIsShippingModalOpen(false);
            if (saveOrderToContext) await saveOrderToContext(newOrder);

            const existing = JSON.parse(localStorage.getItem('earthbasket_orders') || '[]');
            localStorage.setItem('earthbasket_orders', JSON.stringify([newOrder, ...existing]));

            clearCart();
            if (onOrderPlaced) onOrderPlaced();
            else window.location.href = '/orders';
        } catch (error) {
            console.error("Failed to save order:", error);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Navbar onOpenCart={onOpenCart} onOpenLogin={onOpenLogin} />

            <div className="cart-page-container">
                <div className="cart-page-header">
                    <h1 className="cart-page-title">Shopping Checkout</h1>
                    {cartItems.length > 0 && (
                        <span className="cart-item-count-badge">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Your cart is empty</h3>
                        <p style={{ color: '#64748b', margin: 0 }}>Explore our catalog to add fresh groceries to your cart.</p>
                    </div>
                ) : (
                    <div className="cart-layout-grid">
                        <div className="cart-items-list">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item-card">
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-title">{item.name}</h4>
                                        <p className="cart-item-price">₹{Number(item.price).toFixed(2)} × {item.quantity}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="cart-item-remove-btn"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-card">
                            <h3 className="summary-card-title">Order Summary</h3>

                            {/* Delivery Map Section */}
                            <div className="manual-delivery-map-card">
                                <div className="manual-map-header">
                                    <span className="manual-map-title">
                                        <MapPin size={16} color="#059669" /> Delivery Location
                                    </span>
                                    <div className="map-header-actions">
                                        <button
                                            type="button"
                                            onClick={toggleMapType}
                                            className={`map-view-toggle-btn ${mapType === 'satellite' ? 'active-satellite' : ''}`}
                                        >
                                            {mapType === 'streets' ? <Globe size={12} /> : <Layers size={12} />}
                                            {mapType === 'streets' ? 'Satellite' : 'Streets'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={detectCustomerLocation}
                                            disabled={isDetectingLocation}
                                            className="gps-btn"
                                        >
                                            <RefreshCw size={12} className={isDetectingLocation ? 'spin-icon' : ''} />
                                            GPS
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSearchLocation} className="map-search-form">
                                    <input
                                        type="text"
                                        placeholder="Search location or landmark..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="map-search-input"
                                    />
                                    <button type="submit" disabled={isSearching} className="map-search-btn">
                                        <Search size={14} />
                                    </button>
                                </form>

                                <div className="preset-badges-container">
                                    {LOCALITY_PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            className={`preset-badge ${userLocation.name === preset.name ? 'active' : ''}`}
                                            onClick={() => handleLocationUpdate(preset, `${preset.name} (Selected)`)}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>

                                <p className="manual-map-hint">Drag marker to exact drop spot:</p>

                                <div className="cart-map-wrapper">
                                    <MapContainer
                                        center={[userLocation.lat, userLocation.lng]}
                                        zoom={14}
                                        scrollWheelZoom={true}
                                        className="cart-leaflet-map"
                                    >
                                        <TileLayer
                                            key={mapType}
                                            url={TILE_LAYERS[mapType].url}
                                            attribution={TILE_LAYERS[mapType].attribution}
                                        />
                                        <MapController center={userLocation} />
                                        <DraggableMarker
                                            position={userLocation}
                                            onPositionChange={(coords) => handleLocationUpdate(coords, 'Custom Pin Selected')}
                                        />
                                    </MapContainer>
                                </div>

                                <div className="manual-map-footer">
                                    <span className="location-status-text">{locationStatus}</span>
                                    <span className="distance-badge">{distanceKm} km</span>
                                </div>
                            </div>

                            {/* Detailed Bill Details */}
                            <div className="bill-details-section">
                                <h4 className="bill-details-heading">
                                    <Receipt size={15} color="#059669" /> Bill Details
                                </h4>

                                <div className="summary-row">
                                    <span>Item Total</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="summary-row">
                                    <span className="bill-item-with-icon">
                                        <Truck size={14} color="#64748b" style={{ marginRight: '4px' }} /> Delivery Fee ({distanceKm} km)
                                    </span>
                                    <span>₹{deliveryFee.toFixed(2)}</span>
                                </div>

                                <div className="summary-row">
                                    <span className="bill-item-with-icon">
                                        Platform Fee <Info size={12} color="#94a3b8" style={{ marginLeft: '4px' }} title="Supports platform operations" />
                                    </span>
                                    <span>₹{PLATFORM_FEE.toFixed(2)}</span>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />

                                <div className="summary-row summary-row-total">
                                    <span>To Pay</span>
                                    <span>₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button onClick={handleInitiateOrder} className="place-order-btn">
                                Place Order • ₹{grandTotal.toFixed(2)}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ShippingModal
                isOpen={isShippingModalOpen}
                onClose={() => setIsShippingModalOpen(false)}
                onConfirm={handleConfirmOrder}
                cartTotal={grandTotal}
                initialName={currentUser?.name || ''}
                locationText={locationStatus}
            />

            <Footer />

            <CustomAlertModal
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                primaryBtnText={alertConfig.primaryBtnText}
                onPrimaryAction={alertConfig.onPrimaryAction}
                onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}