'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BannerSection = ({ activeBanners, isLoadingBanners, className = "w-full", isMobile = false }) => {
  const bannerRef = useRef(null);

  if (isLoadingBanners && (!activeBanners || activeBanners.length === 0)) {
    return <div className={`${className} animate-pulse bg-muted dark:bg-muted h-24 rounded-md`}></div>;
  }
  
  if (!activeBanners || activeBanners.length === 0) {
    return null; 
  }

  const banner = activeBanners[0];

  return (
    <div ref={bannerRef} className={`${className} ${isMobile ? 'mb-2' : 'mb-4 lg:mb-0'}`}>
      <Link href={banner.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="block">
        <Image 
          src={banner.imageUrl} 
          alt={banner.nombre || "Banner publicitario"} 
          width={1200} // Provide a base width
          height={150} // Provide a base height
          priority // First banner should load quickly
          className="w-full h-auto object-cover rounded-md"
        />
      </Link>
    </div>
  );
};

export default BannerSection;
