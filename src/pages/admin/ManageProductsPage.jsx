import React from 'react';
import { Plus } from 'lucide-react';
import ProductTable from '../../components/admin/ProductTable';
import ProductModal from '../../components/admin/ProductModal';
import { useGrocery } from '../../context/GroceryContext';
import './ManageProductsPage.css';

export default function ManageProductsPage() {
    const { openProductModal } = useGrocery();

    return (
        <div>
            <div className="page-action-header">
                <div>
                    <h2 className="page-title">Inventory Management</h2>
                    <p className="page-subtitle">Create, update, and manage fresh grocery stock.</p>
                </div>
                <button onClick={() => openProductModal(null)} className="btn-add-product">
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <ProductTable />
            <ProductModal />
        </div>
    );
}