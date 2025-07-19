import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const BannerSection = ({ activeBanners, isLoadingBanners, className = "w-full", isMobile = false }) => {
  const bannerRef = useRef(null);

  if (isLoadingBanners && (!activeBanners || activeBanners.length === 0)) {
    return <div className={`${className} animate-pulse bg-muted dark:bg-muted h-24 rounded-md`}></div>;
  }
  
  if (!activeBanners || activeBanners.length === 0) {
    return null; 
  }

  return (
    <div ref={bannerRef} className={`${className} ${isMobile ? 'mb-2' : 'mb-4 lg:mb-0'}`}>
      <Link to="#" className="block">
        <img 
          src={activeBanners[0].imageUrl} 
          alt={activeBanners[0].nombre || "Banner publicitario"} 
          className="w-full h-auto object-cover rounded-md"
        />
      </Link>
    </div>
  );
};

export default BannerSection;