import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useGrocery } from '../../context/GroceryContext';
import './ProductModal.css';

export default function ProductModal() {
    const { isModalOpen, editingProduct, closeProductModal, saveProduct } = useGrocery();
    const [formData, setFormData] = useState({
        name: '',
        category: 'Fresh Vegetables',
        price: '',
        stock: '',
        unit: '',
        image: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                ...editingProduct,
                price: editingProduct.price !== undefined ? String(editingProduct.price) : '',
                stock: editingProduct.stock !== undefined ? String(editingProduct.stock) : ''
            });
        } else {
            setFormData({
                name: '',
                category: 'Fresh Vegetables',
                price: '',
                stock: '',
                unit: '',
                image: ''
            });
        }
    }, [editingProduct, isModalOpen]);

    if (!isModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numericPrice = parseFloat(formData.price);
        const numericStock = parseInt(formData.stock, 10);

        if (isNaN(numericPrice) || numericPrice < 0) {
            alert('Please enter a valid positive price.');
            return;
        }

        if (isNaN(numericStock) || numericStock < 0) {
            alert('Please enter a valid stock quantity.');
            return;
        }

        try {
            setIsSubmitting(true);
            await saveProduct({
                ...formData,
                price: numericPrice,
                stock: numericStock
            });

            // Auto close modal on successful save
            closeProductModal();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={closeProductModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={closeProductModal}
                    className="modal-close-btn"
                    type="button"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                <h3 className="modal-title">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Product Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Fresh Vegetables</option>
                                <option>Fresh Fruits</option>
                                <option>Dairy & Eggs</option>
                                <option>Bakery & Snacks</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Unit (e.g. 1kg, 3pcs)</label>
                            <input
                                required
                                type="text"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label>Price (₹)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label>Stock Quantity</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Image URL</label>
                        <input
                            required
                            type="url"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={closeProductModal}
                            className="btn-cancel"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}