import type { Metadata } from "next";
import TvModeLayout from "@/components/layout/TvModeLayout";
import {
  getVideosForHome,
  getTickerTexts
} from "@/lib/data";

export const revalidate = 60; // Revalida cada minuto

// Generación de Metadatos Simplificada
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Saladillo Vivo TV',
    description: 'Noticias, streaming en vivo y actualidad de Saladillo y la región optimizado para TV.',
  };
}

export default async function Page() {
  // Fetch seguro: Solo datos necesarios para TV
  let videos: any = { featuredVideo: null, recentVideos: [], allVideos: [], videoCategories: [] };
  let tickerTexts: string[] = [];

  try {
    const [resVideos, resTicker] = await Promise.all([
      getVideosForHome(),
      getTickerTexts(),
    ]);

    videos = resVideos || videos;
    tickerTexts = resTicker || [];
  } catch (error) {
    console.error("Error cargando datos en Page:", error);
  }

  return (
    <main>
      <TvModeLayout />
    </main>
  );
}