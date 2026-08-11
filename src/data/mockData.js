export const initialCategories = [
    { id: 'cat-1', name: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', count: 18 },
    { id: 'cat-2', name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300', count: 24 },
    { id: 'cat-3', name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300', count: 12 },
    { id: 'cat-4', name: 'Bakery & Snacks', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', count: 15 },
];

export const initialProducts = [
    {
        id: 'prod-1',
        name: 'Organic Avocados (3 Pack)',
        category: 'Fresh Fruits',
        price: 4.99,
        stock: 25,
        unit: '3 pcs',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
        description: 'Ripe, creamy organic Hass avocados sourced directly from organic orchards.'
    },
    {
        id: 'prod-2',
        name: 'Farm Fresh Whole Milk',
        category: 'Dairy & Eggs',
        price: 3.49,
        stock: 18,
        unit: '1 Gallon',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
        description: 'Pasteurized pasteurized whole milk high in calcium and essential vitamins.'
    },
    {
        id: 'prod-3',
        name: 'Red Crispy Apples',
        category: 'Fresh Fruits',
        price: 2.99,
        stock: 40,
        unit: '1 kg',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
        description: 'Sweet, juicy, and crisp red apples perfect for daily snack routines.'
    },
    {
        id: 'prod-4',
        name: 'Organic Baby Spinach',
        category: 'Fresh Vegetables',
        price: 2.49,
        stock: 8,
        unit: '250g',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
        description: 'Pre-washed baby spinach leaves rich in iron and nutrients.'
    }
];

export const initialOrders = [
    {
        id: 'ORD-8942',
        date: '2026-08-10',
        user: { name: 'Sarah Jenkins', email: 'sarah@example.com', address: '123 Elm St, Springfield' },
        items: [
            { id: 'prod-1', name: 'Organic Avocados (3 Pack)', price: 4.99, quantity: 2 },
            { id: 'prod-2', name: 'Farm Fresh Whole Milk', price: 3.49, quantity: 1 }
        ],
        total: 13.47,
        status: 'Out for Delivery'
    },
    {
        id: 'ORD-8941',
        date: '2026-08-09',
        user: { name: 'Alex Johnson', email: 'alex@example.com', address: '456 Oak Ave, Metropolis' },
        items: [
            { id: 'prod-3', name: 'Red Crispy Apples', price: 2.99, quantity: 3 }
        ],
        total: 8.97,
        status: 'Delivered'
    }
];