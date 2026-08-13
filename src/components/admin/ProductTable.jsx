import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useGrocery } from '../../context/GroceryContext';
import './ProductTable.css';

export default function ProductTable() {
    const { products, deleteProduct, openProductModal } = useGrocery();

    return (
        <div className="product-table-wrapper">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products && products.length > 0 ? (
                        products.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div className="table-product-cell">
                                        <img src={item.image} alt={item.name} className="table-product-thumb" />
                                        <span>{item.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: '#64748b', fontWeight: 500 }}>{item.category}</td>
                                <td style={{ fontWeight: 800, color: '#0f172a' }}>
                                    ₹{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                </td>
                                <td>
                                    <span className={`stock-pill ${item.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                                        {item.stock} in stock
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        onClick={() => openProductModal && openProductModal(item)}
                                        className="action-icon-btn edit"
                                        title="Edit Product"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteProduct && deleteProduct(item.id)}
                                        className="action-icon-btn delete"
                                        title="Delete Product"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                No products available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}