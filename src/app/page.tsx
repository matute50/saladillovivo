import HomePageClient from "@/components/HomePageClient";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  getArticlesForHome,
  getVideosForHome,
  getActiveAds,
  getActiveBanners,
  getCalendarEvents,
  getInterviews,
  getTickerTexts
} from "@/lib/data";

export const revalidate = 60; // Revalida cada minuto

// Generación de Metadatos con manejo de errores
export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getArticlesForHome();
    const featuredNews = data?.featuredNews;
   
    return {
      title: featuredNews?.meta_title || 'Saladillo Vivo - Noticias, Eventos y Cultura',
      description: featuredNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo.',
      keywords: featuredNews?.meta_keywords || 'Saladillo, noticias, actualidad, vivo, streaming, eventos, cultura',
      openGraph: {
        title: featuredNews?.meta_title || 'Saladillo Vivo - Noticias y Actualidad',
        description: featuredNews?.meta_description || 'Saladillo Vivo es el canal temático de noticias, eventos y cultura de Saladillo.',
        images: [featuredNews?.imageUrl || 'https://saladillovivo.vercel.app/default-og-image.png'],
        url: `https://saladillovivo.vercel.app${featuredNews?.slug ? '/noticia/' + featuredNews.slug : ''}`,
        type: featuredNews ? 'article' : 'website',
      },
    };
  } catch (error) {
    return { title: 'Saladillo Vivo' };
  }
}

// Importación dinámica para evitar errores de hidratación en el cliente
const DynamicHomePageClient = dynamic(() => import("@/components/HomePageClient"), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" /> // Placeholder mientras carga
});

export default async function Page() {
  // Fetch seguro: si falla, devolvemos objetos vacíos en lugar de undefined
  let articles = { featuredNews: null, secondaryNews: [] };
  let videos = { featuredVideo: null, recentVideos: [] };
  let tickerTexts = [];
  let interviews = [];
  let banners = [];
  let ads = [];
  let events = [];

  try {
    const [resArticles, resVideos, resTicker, resInterviews, resBanners, resAds, resEvents] = await Promise.all([
      getArticlesForHome(),
      getVideosForHome(),
      getTickerTexts(),
      getInterviews(),
      getActiveBanners(),
      getActiveAds(),
      getCalendarEvents(),
    ]);

    // Asignamos solo si el resultado existe
    articles = resArticles || articles;
    videos = resVideos || videos;
    tickerTexts = resTicker || [];
    interviews = resInterviews || [];
    banners = resBanners || [];
    ads = resAds || [];
    events = resEvents || [];
  } catch (error) {
    console.error("Error cargando datos en Page:", error);
  }

  const pageData = {
    articles,
    videos,
    tickerTexts,
    interviews,
    banners,
    ads,
    events,
  };

  return (
    <main>
      <DynamicHomePageClient initialData={pageData} />
    </main>
  );
}