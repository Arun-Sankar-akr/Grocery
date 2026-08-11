import React from 'react';
import { initialCategories } from '../../data/mockData';
import { useGrocery } from '../../context/GroceryContext';
import './CategoryExplore.css';

export default function CategoryExplore({ selectedCategory, onSelectCategory }) {
  const { products } = useGrocery();

  // Calculate live product counts per category dynamically if products are present
  const getCategoryCount = (categoryName, defaultCount) => {
    if (!products || products.length === 0) return defaultCount;
    if (categoryName.toLowerCase() === 'all') return products.length;
    return products.filter(
      (p) => p.category?.toLowerCase() === categoryName.toLowerCase()
    ).length;
  };

  return (
    <div className="category-grid">
      {initialCategories.map((cat) => {
        const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
        const count = getCategoryCount(cat.name, cat.count);

        return (
          <div
            key={cat.id}
            className={`category-card ₹{isSelected ? 'active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-avatar">
              <img src={cat.image} alt={cat.name} />
            </div>
            <h3 className="category-name">{cat.name}</h3>
            <p className="category-count">{count} Items Available</p>
          </div>
        );
      })}
    </div>
  );
}