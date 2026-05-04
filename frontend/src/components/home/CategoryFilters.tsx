import React from 'react';

const categories = [
  'All',
  'Gaming',
  'Music',
  'News',
  'Sports',
  'Education',
  'Entertainment',
  'Technology'
];

export function CategoryFilters() {
  return (
    <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          className="px-4 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 whitespace-nowrap"
        >
          {category}
        </button>
      ))}
    </div>
  );
}