'use client';

import React from 'react';
import MobileNewsCard from './MobileNewsCard'; // Import the extracted component

const MobileNewsGrid = ({ featuredItem, gridItems }) => {
  if (!featuredItem && (!gridItems || gridItems.length === 0)) return null;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featuredItem && (
          <div className="sm:col-span-2">
            <MobileNewsCard newsItem={featuredItem} isFeatured={true} />
          </div>
        )}
        {gridItems && gridItems.map((item) => (
          item && <MobileNewsCard key={item.id} newsItem={item} />
        ))}
      </div>
    </div>
  );
};

export default MobileNewsGrid;
