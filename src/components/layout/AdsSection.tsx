'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const AdsSection = ({ activeAds, adsLoading, isMobile = false }) => {
  
  const containerClasses = "bg-transparent rounded-lg flex flex-col justify-start items-center w-full";
  const gridColsClass = isMobile ? 'grid-cols-4 gap-1.5' : 'grid-cols-1 space-y-2.5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={containerClasses}
    >
      {adsLoading ? (
        <div className="animate-pulse space-y-2.5 w-full">
          <div className="h-24 bg-muted w-full rounded"></div>
          <div className="h-24 bg-muted w-full rounded"></div>
        </div>
      ) : activeAds && activeAds.length > 0 ? (
        <div className={`w-full ${isMobile ? 'grid' : 'flex flex-col'} ${gridColsClass}`}>
          {activeAds.map((ad, index) => (
            <Link key={ad.id || index} href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Image 
                loading="lazy"
                className="w-5/6 h-auto object-cover rounded-md mx-auto" 
                alt={ad.name || `Anuncio publicitario ${index + 1}`} 
                src={ad.imageUrl} 
                width={300} // Base width
                height={250} // Base height, assuming a common ad size
              />
            </Link>
          ))}
        </div>
      ) : (
        null 
      )}
    </motion.div>
  );
};

export default AdsSection;
