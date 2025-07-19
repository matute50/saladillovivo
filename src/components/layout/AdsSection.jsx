
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNews } from '@/context/NewsContext';

const AdsSection = ({ isMobile = false }) => {
  const { activeAds, adsLoading } = useNews();
  
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
            <Link key={ad.id || index} to={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="block w-full">
              <img 
                loading="lazy"
                className="w-full h-auto object-cover rounded-md" 
                alt={ad.name || `Anuncio publicitario ${index + 1}`} 
                src={ad.imageUrl} />
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
