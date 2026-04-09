'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { PageData } from '@/lib/types';

const DynamicHomePageClient = dynamic(() => import('@/components/HomePageClient'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
});

interface HomePageClientWrapperProps {
  initialData: PageData;
}

const HomePageClientWrapper: React.FC<HomePageClientWrapperProps> = ({ initialData }) => {
  return <DynamicHomePageClient initialData={initialData} />;
};

export default HomePageClientWrapper;
