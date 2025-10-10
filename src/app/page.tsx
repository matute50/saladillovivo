import HomePageClient from "@/components/HomePageClient";
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate this page every 60 seconds

import {
  getArticles,
  getActiveAds,
  getActiveBanners,
  getCalendarEvents,
  getInterviews,
  getTickerTexts,
  getVideos
} from "@/lib/data";

// This function generates metadata on the server.
export async function generateMetadata(): Promise<Metadata> {
  const { destacada, noticias2, noticias3, otrasNoticias } = await getArticles();
  const allNews = [destacada, ...noticias2, ...noticias3, ...otrasNoticias].filter(Boolean);
  
  // Use the featured article, or the first article overall as a fallback for metadata.
  const mainFeaturedNews = destacada || allNews[0] || null;
 
  return {
    title: mainFeaturedNews?.meta_title || 'Saladillo Vivo - Noticias, Eventos y Cultura',
    description: mainFeaturedNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo. Mirá streaming en vivo y contenido on demand las 24hs.',
    keywords: mainFeaturedNews?.meta_keywords || 'Saladillo, noticias, actualidad, vivo, streaming, eventos, cultura, HCD',
    openGraph: {
      title: mainFeaturedNews?.meta_title || 'Saladillo Vivo - Noticias y Actualidad',
      description: mainFeaturedNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo.',
      images: [mainFeaturedNews?.imageUrl || 'https://saladillovivo.vercel.app/default-og-image.png'],
      url: `https://saladillovivo.vercel.app${mainFeaturedNews?.slug ? '/noticia/' + mainFeaturedNews.slug : ''}`,

      type: mainFeaturedNews ? 'article' : 'website',
    },
  };
}

// This is the main page component, rendered on the server.
export default async function Page() {
  // Fetch all data concurrently for performance.
  const [articles, tickerTexts, videos, interviews, banners, ads, events] = await Promise.all([
    getArticles(),
    getTickerTexts(),
    getVideos(),
    getInterviews(),
    getActiveBanners(),
    getActiveAds(),
    getCalendarEvents(),
  ]);

  const pageData = {
    articles, // Pass the structured articles object { destacada, noticias2, ... }
    tickerTexts,
    videos,
    interviews,
    banners,
    ads,
    events,
  };

  // Pass the server-fetched data to the client component.
  return <HomePageClient data={pageData} />;
}