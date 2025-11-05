import HomePageClient from "@/components/HomePageClient";
import type { Metadata } from "next";
import {
  getArticlesForHome,
  getVideosForHome,
  getActiveAds,
  getActiveBanners,
  getCalendarEvents,
  getInterviews,
  getTickerTexts
} from "@/lib/data";
import { NewsProvider } from "@/context/NewsContext";

export const revalidate = 60; // Revalidate this page every 60 seconds

// This function generates metadata on the server.
export async function generateMetadata(): Promise<Metadata> {
  const { featuredNews } = await getArticlesForHome();
 
  return {
    title: featuredNews?.meta_title || 'Saladillo Vivo - Noticias, Eventos y Cultura',
    description: featuredNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo. Mirá streaming en vivo y contenido on demand las 24hs.',
    keywords: featuredNews?.meta_keywords || 'Saladillo, noticias, actualidad, vivo, streaming, eventos, cultura, HCD',
    openGraph: {
      title: featuredNews?.meta_title || 'Saladillo Vivo - Noticias y Actualidad',
      description: featuredNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo.',
      images: [featuredNews?.imageUrl || 'https://saladillovivo.vercel.app/default-og-image.png'],
      url: `https://saladillovivo.vercel.app${featuredNews?.slug ? '/noticia/' + featuredNews.slug : ''}`,
      type: featuredNews ? 'article' : 'website',
    },
  };
}

// This is the main page component, rendered on the server.
export default async function Page() {
  // Fetch all data concurrently for performance.
  const [articles, videos, tickerTexts, interviews, banners, ads, events] = await Promise.all([
    getArticlesForHome(),
    getVideosForHome(),
    getTickerTexts(),
    getInterviews(),
    getActiveBanners(),
    getActiveAds(),
    getCalendarEvents(),
  ]);

  const pageData = {
    articles, // Contains featuredNews and secondaryNews
    videos,   // Contains featuredVideo and recentVideos
    tickerTexts,
    interviews,
    banners,
    ads,
    events,
  };

  // Pass the server-fetched data to the client component.
  return (
    <HomePageClient initialData={pageData} />
  );
}
