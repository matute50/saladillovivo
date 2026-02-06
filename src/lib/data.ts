import { supabase } from './supabaseClient';
import type { Article, Video, Interview, Banner, Ad, CalendarEvent, SupabaseArticle } from './types';

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
export async function getArticlesForHome(limitTotal: number = 25) {
  const { supabaseUrl, supabaseAnonKey } = checkSupabaseCredentials();
  const now = new Date().toISOString();

  // Aumentamos el límite para asegurar suficientes artículos para todas las categorías
  const apiUrl = `${supabaseUrl}/rest/v1/articles?select=id,title,text,image_url,featureStatus,updatedAt,created_at,slug,description,meta_title,meta_description,meta_keywords,published_at,audio_url,url_slide,animation_duration&or=(published_at.is.null,published_at.lte.${now})&order=created_at.desc&limit=${limitTotal}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('Supabase fetch failed in getArticlesForHome. Status:', response.status, 'Text:', await response.text());
      return { featuredNews: null, secondaryNews: [], tertiaryNews: [], otherNews: [], allNews: [] };
    }
    const rawArticles = await response.json();
    if (!Array.isArray(rawArticles)) {
      console.error('Supabase response is not an array in getArticlesForHome:', rawArticles);
      return { featuredNews: null, secondaryNews: [], tertiaryNews: [], otherNews: [], allNews: [] };
    }
    const articles: SupabaseArticle[] = rawArticles as SupabaseArticle[];

    const processedNews = articles.map((item: SupabaseArticle): Article => ({
      id: item.id,
      titulo: item.title,
      slug: item.slug || item.id.toString(),
      description: item.description || (item.text ? item.text.substring(0, 160) : 'Descripción no disponible.'),
      resumen: item.text ? item.text.substring(0, 150) + (item.text.length > 150 ? '...' : '') : 'Resumen no disponible.',
      contenido: item.text || 'Contenido no disponible.',
      fecha: item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()),
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()),
      autor: 'Equipo Editorial',
      categoria: item.featureStatus,
      imageUrl: item.image_url || 'https://saladillovivo.vercel.app/default-og-image.png',
      featureStatus: item.featureStatus,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      meta_keywords: item.meta_keywords,
      audio_url: item.audio_url,
      url_slide: item.url_slide,
      animation_duration: (item as any).animation_duration,
    }));

    // Clasificar noticias
    const featuredCandidates = processedNews.filter(news => news.featureStatus === 'featured');
    const secondaryNews = processedNews.filter(news => news.featureStatus === 'secondary');
    const tertiaryNews = processedNews.filter(news => news.featureStatus === 'tertiary');
    const otherNews = processedNews.filter(news => !news.featureStatus);

    let featuredNews: Article | null = null;

    // Asegurar que solo haya una noticia destacada
    if (featuredCandidates.length > 0) {
      // Ya vienen ordenadas por created_at.desc, así que la primera es la más nueva.
      featuredNews = featuredCandidates.shift()!;
      // Las demás 'featured' se convierten en 'secondary'
      secondaryNews.unshift(...featuredCandidates);
    } else if (processedNews.length > 0) {
      // Si no hay 'featured', la más reciente de todas es la destacada
      const oldestNonFeatured = processedNews.find(p => p.id !== featuredNews?.id);
      if (oldestNonFeatured) {
        featuredNews = oldestNonFeatured;
      }
    }

    // Re-ordenar las secundarias y terciarias por fecha de creación descendente
    secondaryNews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    tertiaryNews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Ordenar las "otras" noticias de derecha a izquierda (más viejas primero)
    otherNews.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Filtrar la noticia destacada de las otras listas para evitar duplicados
    const allButFeatured = [...secondaryNews, ...tertiaryNews, ...otherNews].filter(n => n.id !== featuredNews?.id);


    return {
      featuredNews,
      secondaryNews: allButFeatured.filter(n => n.featureStatus === 'secondary' || featuredCandidates.some(fc => fc.id === n.id)),
      tertiaryNews: allButFeatured.filter(n => n.featureStatus === 'tertiary'),
      otherNews: allButFeatured.filter(n => !n.featureStatus),
      allNews: [featuredNews, ...allButFeatured].filter((n): n is Article => n !== null),
    };

  } catch (error) {
    console.error('Error in getArticlesForHome:', error);
    return { featuredNews: null, secondaryNews: [], tertiaryNews: [], otherNews: [], allNews: [] };
  }
}

export async function getVideosForHome(limitRecent: number = 4) {
  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad, forzar_video, volumen_extra')
    .not('categoria', 'ilike', '%HCD%')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return { featuredVideo: null, recentVideos: [], allVideos: [], videoCategories: [] };
  }

  let allVideos: Video[] = data || [];

  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

  allVideos = allVideos.map(video => {
    const videoCreatedAt = new Date(video.createdAt).toISOString();
    if (video.novedad && new Date(videoCreatedAt) <= fourDaysAgo) {
      return { ...video, novedad: false, createdAt: videoCreatedAt };
    }
    return { ...video, createdAt: videoCreatedAt };
  });

  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const forcedVideos = allVideos.filter(video =>
    video.forzar_video && new Date(video.createdAt) > twelveHoursAgo
  );

  const nonForcedVideos = allVideos.filter(video =>
    !(video.forzar_video && new Date(video.createdAt) > twelveHoursAgo)
  );

  for (let i = nonForcedVideos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonForcedVideos[i], nonForcedVideos[j]] = [nonForcedVideos[j], nonForcedVideos[i]];
  }

  const videos: Video[] = [...forcedVideos, ...nonForcedVideos];
  const videoCategories = [...new Set(videos.map(v => v.categoria).filter(Boolean))].sort();

  let featuredVideo: Video | null = null;
  const recentVideos: Video[] = [];
  const mutableVideos = [...videos];

  if (forcedVideos.length > 0) {
    featuredVideo = forcedVideos[0];
    mutableVideos.splice(mutableVideos.indexOf(featuredVideo), 1);
  } else {
    const featuredIndex = mutableVideos.findIndex(video => video.novedad === true);
    if (featuredIndex !== -1) {
      featuredVideo = mutableVideos.splice(featuredIndex, 1)[0];
    } else if (mutableVideos.length > 0) {
      featuredVideo = mutableVideos.shift()!;
    }
  }

  recentVideos.push(...mutableVideos);

  return {
    featuredVideo,
    recentVideos: recentVideos.slice(0, limitRecent),
    allVideos: videos,
    videoCategories,
  };
}

export async function getRandomVideo(): Promise<Video | null> {
  const { data, error } = await supabase.rpc('get_random_video_excluding_sv');

  if (error) {
    console.error('Error fetching random video:', error);
    return null;
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function getNewRandomVideo(currentId?: string, currentCategory?: string): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad, forzar_video, volumen_extra')
    .not('categoria', 'ilike', '%HCD%');

  if (error) {
    console.error('Error fetching videos for random selection:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null; // No videos in DB
  }

  const allAvailableVideos: Video[] = data as Video[];
  let candidates: Video[] = [...allAvailableVideos]; // Start with all videos

  // 1. Exclude currentId if provided
  if (currentId) {
    candidates = candidates.filter(video => video.id !== currentId);
  }

  // 2. Filter by currentCategory if provided and if it leaves videos
  if (currentCategory) { // Apply category filter only if currentCategory is provided
    const categoryFiltered = candidates.filter(video => video.categoria !== currentCategory);
    if (categoryFiltered.length > 0) {
      candidates = categoryFiltered;
    }
    // If category filter left no videos, we stick with 'candidates' before category filter.
    // This ensures we always have videos unless the initial fetch was empty or currentId removed all.
  }

  // 3. If after all filtering, candidates list is empty, 
  //    revert to playing any random video from original data (excluding currentId if possible)
  if (candidates.length === 0) {
    if (allAvailableVideos.length > 0) {
      // If currentId was the *only* video, then playing it again is the only option
      if (allAvailableVideos.length === 1 && allAvailableVideos[0].id === currentId) {
        return allAvailableVideos[0];
      }
      // Otherwise, pick a random from all available (excluding currentId if possible)
      let finalFallbackCandidates = allAvailableVideos.filter(video => video.id !== currentId);
      if (finalFallbackCandidates.length === 0) {
        finalFallbackCandidates = allAvailableVideos; // If currentId excluded all, use all
      }
      const randomIndex = Math.floor(Math.random() * finalFallbackCandidates.length);
      return finalFallbackCandidates[randomIndex];
    } else {
      return null; // No videos in DB at all (should be caught by initial data.length check)
    }
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

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
  interface SupabaseInterviewData {
    id: string;
    nombre: string;
    url: string;
    created_at: string;
    updated_at: string;
    categoria: string;
    imagen: string;
  }

  return (data as SupabaseInterviewData[] || []).map((item: SupabaseInterviewData): Interview => ({
    id: item.id,
    nombre: item.nombre,
    url: item.url,
    createdAt: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    updatedAt: item.updated_at ? new Date(item.updated_at).toISOString() : (item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()),
    categoria: item.categoria,
    imagen: item.imagen,
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

export async function getArticles() {
  const { allNews } = await getArticlesForHome(100);

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

export async function getArticlesForRss(limit: number = 50): Promise<Article[]> {
  const { supabaseUrl, supabaseAnonKey } = checkSupabaseCredentials();
  const now = new Date().toISOString();

  // CORRECCIÓN: Agregado 'animation_duration' también aquí por consistencia
  const apiUrl = `${supabaseUrl}/rest/v1/articles?select=id,title,text,image_url,featureStatus,updatedAt,created_at,slug,description,meta_title,meta_description,meta_keywords,published_at,audio_url,url_slide,animation_duration&or=(published_at.is.null,published_at.lte.${now})&order=created_at.desc&limit=${limit}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('Supabase fetch failed for RSS articles. Status:', response.status, 'Text:', await response.text());
      throw new Error(`Supabase fetch failed: ${response.statusText}`);
    }

    const articles: SupabaseArticle[] = await response.json();

    return articles.map((item: SupabaseArticle): Article => ({
      id: item.id,
      titulo: item.title,
      slug: item.slug || item.id.toString(),
      description: item.description || (item.text ? item.text.substring(0, 160) : 'Descripción no disponible.'),
      resumen: item.text ? item.text.substring(0, 150) + (item.text.length > 150 ? '...' : '') : 'Resumen no disponible.',
      contenido: item.text || 'Contenido no disponible.',
      fecha: item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()),
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()),
      autor: 'Equipo Editorial',
      categoria: item.featureStatus,
      imageUrl: item.image_url || 'https://saladillovivo.vercel.app/default-og-image.png',
      featureStatus: item.featureStatus,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      meta_keywords: item.meta_keywords,
      audio_url: item.audio_url,
      url_slide: item.url_slide,
      animation_duration: (item as any).animation_duration,
    }));

  } catch (error) {
    console.error('Error in getArticlesForRss:', error);
    return [];
  }
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
  return (data || []).map(item => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
  }));
}

function filterSearchTerms(query: string): string {
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'a', 'en', 'de', 'del', 'al',
    'por', 'para', 'con', 'buscar', 'encontrar', 'explorar', 'ver', 'video', 'videos'
  ]);

  const cleanedQuery = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word))
    .join(' & ');

  return cleanedQuery;
}


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

export async function getVideoByUrl(url: string): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('id, nombre, url, createdAt, categoria, imagen, novedad, volumen_extra')
    .eq('url', url)
    .maybeSingle();

  if (error) {
    console.error('Error fetching video by URL:', error);
    return null;
  }
  return data;
}