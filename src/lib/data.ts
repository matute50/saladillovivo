import { supabase } from './supabaseClient';
import type { Article, Video, Interview, Banner, Ad, CalendarEvent, TickerText } from './types';

// Helper to ensure Supabase credentials are set
function checkSupabaseCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not defined.');
    throw new Error('Supabase configuration is missing.');
  }
  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Fetches articles from Supabase and categorizes them into featured and secondary.
 * - featuredNews: The most recent article with featureStatus = 'featured'.
 * - secondaryNews: All other articles, sorted by creation date.
 */
export async function getArticlesForHome(limitSecondary: number = 5) {
  const { supabaseUrl, supabaseAnonKey } = checkSupabaseCredentials();
  const now = new Date().toISOString();
  const apiUrl = `${supabaseUrl}/rest/v1/articles?select=id,title,text,imageUrl,featureStatus,updatedAt,createdAt,slug,description,meta_title,meta_description,meta_keywords,published_at&or=(published_at.is.null,published_at.lte.${now})&order=createdAt.desc`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      console.error('Supabase fetch failed for articles. Status:', response.status, 'Text:', await response.text());
      throw new Error(`Supabase fetch failed: ${response.statusText}`);
    }

    const articles: any[] = await response.json();

    const processedNews = articles.map((item): Article => ({
      id: item.id,
      titulo: item.title,
      slug: item.slug || item.id.toString(),
      description: item.description || (item.text ? item.text.substring(0, 160) : 'Descripción no disponible.'),
      resumen: item.text ? item.text.substring(0, 150) + (item.text.length > 150 ? '...' : '') : 'Resumen no disponible.',
      contenido: item.text || 'Contenido no disponible.',
      fecha: item.updatedAt || item.createdAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      autor: 'Equipo Editorial',
      categoria: item.featureStatus,
      imageUrl: item.imageUrl || 'https://saladillovivo.vercel.app/default-og-image.png',
      featureStatus: item.featureStatus,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      meta_keywords: item.meta_keywords,
    }));

    let featuredNews: Article | null = null;
    const secondaryNews: Article[] = [];

    const featuredIndex = processedNews.findIndex(news => news.featureStatus === 'featured');
    
    if (featuredIndex !== -1) {
      featuredNews = processedNews.splice(featuredIndex, 1)[0];
    } else if (processedNews.length > 0) {
      // If no featured article, use the most recent one as featured
      featuredNews = processedNews.shift()!;
    }

    // The rest of the articles are secondary
    secondaryNews.push(...processedNews);

    return {
      featuredNews,
      secondaryNews: secondaryNews.slice(0, limitSecondary),
      allNews: [featuredNews, ...secondaryNews].filter((n): n is Article => n !== null),
    };

  } catch (error) {
    console.error('Error in getArticlesForHome:', error);
    return { featuredNews: null, secondaryNews: [], allNews: [] };
  }
}

/**
 * Fetches videos from Supabase and categorizes them for the home page.
 * - featuredVideo: The most recent video marked as 'novedad' (novelty).
 * - recentVideos: Other recent videos.
 */
export async function getVideosForHome(limitRecent: number = 4) {
  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad, forzar_video') // Añadido forzar_video
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return { featuredVideo: null, recentVideos: [], allVideos: [], videoCategories: [] };
  }

  let allVideos: Video[] = data || [];

  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

  // Aplicar la regla de los 4 días a la propiedad 'novedad' en memoria
  allVideos = allVideos.map(video => {
    if (video.novedad && new Date(video.createdAt) <= fourDaysAgo) {
      return { ...video, novedad: false }; // Crear una nueva instancia para no mutar el original directamente si no es necesario
    }
    return video;
  });

  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const forcedVideos = allVideos.filter(video =>
    video.forzar_video && new Date(video.createdAt) > twelveHoursAgo
  );

  const nonForcedVideos = allVideos.filter(video =>
    !(video.forzar_video && new Date(video.createdAt) > twelveHoursAgo)
  );

  // Mezclar aleatoriamente los videos no forzados
  for (let i = nonForcedVideos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonForcedVideos[i], nonForcedVideos[j]] = [nonForcedVideos[j], nonForcedVideos[i]];
  }

  // Combinar videos forzados (al principio) con videos no forzados
  let videos: Video[] = [...forcedVideos, ...nonForcedVideos];
  
  // Derive categories from the full list of videos (antes de cualquier splice)
  const videoCategories = [...new Set(videos.map(v => v.categoria).filter(Boolean))].sort();

  let featuredVideo: Video | null = null;
  const recentVideos: Video[] = [];

  // Usar una copia para la mutación para preservar el array original de videos para la derivación de categorías
  const mutableVideos = [...videos];

  // Lógica para featuredVideo: primero buscar entre los forzados, luego entre los novedad, luego el más reciente
  if (forcedVideos.length > 0) {
    featuredVideo = forcedVideos[0]; // El primer video forzado es el destacado
    mutableVideos.splice(mutableVideos.indexOf(featuredVideo), 1); // Eliminarlo de la lista mutable
  } else {
    const featuredIndex = mutableVideos.findIndex(video => video.novedad === true);
    if (featuredIndex !== -1) {
      featuredVideo = mutableVideos.splice(featuredIndex, 1)[0];
    } else if (mutableVideos.length > 0) {
      // Fallback al video más reciente si ninguno está marcado como 'novedad'
      featuredVideo = mutableVideos.shift()!;
    }
  }
  
  recentVideos.push(...mutableVideos);

  return {
    featuredVideo,
    recentVideos: recentVideos.slice(0, limitRecent),
    allVideos: videos, // Devolver la lista completa y ordenada de videos
    videoCategories, // Devolver todas las categorías únicas
  };
}

/**
 * Fetches a single random video from the database, excluding the 'SV' category.
 * Uses a custom Supabase RPC function for efficiency.
 */
export async function getRandomVideo(): Promise<Video | null> {
  const { data, error } = await supabase.rpc('get_random_video_excluding_sv');

  if (error) {
    console.error('Error fetching random video:', error);
    return null;
  }

  // The RPC with LIMIT 1 returns an array with a single item, or an empty array.
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetches all videos and returns a random one, optionally excluding the current one.
 * @param currentId - The ID of the video to exclude from the random selection.
 */
export async function getNewRandomVideo(currentId?: string, currentCategory?: string): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad, forzar_video');

  if (error) {
    console.error('Error fetching videos for random selection:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  let selectableVideos: Video[] = data as Video[];

  // Excluir el video actual si se proporciona currentId
  if (currentId && data.length > 1) {
    selectableVideos = selectableVideos.filter(video => video.id !== currentId);
  }
  
  // Excluir videos de la misma categoría si se proporciona currentCategory
  if (currentCategory) {
    const filteredByCategory = selectableVideos.filter(video => video.categoria !== currentCategory);
    if (filteredByCategory.length > 0) {
      selectableVideos = filteredByCategory;
    } else {
      // Si no quedan videos después de filtrar por categoría,
      // volvemos a la lista original (excluyendo solo el currentId)
      // para asegurar que siempre haya un video para reproducir.

      selectableVideos = data.filter(video => video.id !== currentId) as Video[];
      if (selectableVideos.length === 0) { // Si incluso así no hay, usamos la lista completa
        selectableVideos = data as Video[];
      }
    }
  }

  if (selectableVideos.length === 0) {
    return null; // No hay videos seleccionables
  }

  const randomIndex = Math.floor(Math.random() * selectableVideos.length);
  return selectableVideos[randomIndex];
}


// --- Other existing functions ---

export async function getTickerTexts(): Promise<string[]> {
  const { data, error } = await supabase
    .from('textos_ticker')
    .select('text, isActive')
    .eq('isActive', true)
    .order('createdAt', { ascending: true });

  if (error) {
    console.warn('Error fetching ticker texts:', error);
    return ["Bienvenido a Saladillo Vivo - Manténgase informado."];
  }
  if (data && data.length > 0) {
    return data.map(t => t.text).filter(Boolean);
  }
  return ["Últimas noticias de última hora - Siga nuestra cobertura en vivo."];
}

export async function getInterviews(): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('entrevistas')
    .select('id, nombre, url, created_at, updated_at, categoria, imagen')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }
  return (data || []).map(item => ({
    ...item,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

export async function getActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banner')
    .select('id, imageUrl, nombre, isActive')
    .eq('isActive', true)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
  return data || [];
}

export async function getActiveAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('anuncios')
    .select('id, imageUrl, name, isActive, linkUrl')
    .eq('isActive', true)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  return data || [];
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('eventos')
    .select('nombre, fecha, hora')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true });

  if (error) {
    console.warn('Error fetching calendar events:', error);
    return [];
  }
  return data || [];
}

// This function is kept for other potential uses, but getArticlesForHome is preferred for the main page.
export async function getArticles() {
  // ... (original getArticles implementation can be kept or deprecated)
  // For now, let's just re-route it to the new function to avoid breaking other parts.
  const { allNews } = await getArticlesForHome(100); // Large limit to get all
  
  // Recreate the old structure if needed elsewhere, otherwise this can be removed.
  const destacada = allNews.find(a => a.featureStatus === 'featured') || null;
  const noticias2 = allNews.filter(a => a.featureStatus === 'secondary');
  const noticias3 = allNews.filter(a => a.featureStatus === 'tertiary');
  const otrasNoticias = allNews.filter(a => !a.featureStatus);

  return {
    destacada,
    noticias2,
    noticias3,
    otrasNoticias,
    allNews,
  };
}

export async function getVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad')
    .order('createdAt', { ascending: false });
  
  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
  return data || [];
}

/**
 * Filters a search query to remove common Spanish stop words and prepares it for text search.
 * @param query The raw search query.
 * @returns A string formatted for PostgreSQL's text search.
 */
function filterSearchTerms(query: string): string {
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'a', 'en', 'de', 'del', 'al',
    'por', 'para', 'con', 'buscar', 'encontrar', 'explorar', 'ver', 'video', 'videos'
  ]);

  const cleanedQuery = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word))
    .join(' & '); // Use '&' for AND logic in text search

  return cleanedQuery;
}

/**
 * Fetches videos from Supabase based on a search term.
 * @param searchTerm The user's search query.
 * @returns A promise that resolves to an array of Video objects.
 */
export async function fetchVideosBySearch(searchTerm: string): Promise<Video[]> {
  const processedTerm = filterSearchTerms(searchTerm);

  if (!processedTerm) {
    return [];
  }

  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad')
    .textSearch('nombre', processedTerm, { type: 'websearch' });

  if (error) {
    console.error('Error searching videos:', error);
    throw error;
  }

  return data || [];
}