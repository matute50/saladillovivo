import { supabase } from './supabaseClient';


export async function getArticles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not defined.');
    throw new Error('Supabase configuration is missing.');
  }

  const apiUrl = `${supabaseUrl}/rest/v1/articles?select=id,title,text,imageUrl,featureStatus,updatedAt,createdAt,slug,description,meta_title,meta_description,meta_keywords&order=createdAt.desc`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase fetch failed: ${response.statusText}`);
    }

    const articles = await response.json();

    const processedNews = articles.map(item => ({
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

    const statusOrder = { 'featured': 1, 'secondary': 2, 'tertiary': 3 };
    processedNews.sort((a, b) => {
      const aOrder = statusOrder[a.featureStatus] || 4;
      const bOrder = statusOrder[b.featureStatus] || 4;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return { allNews: processedNews };
  } catch (error) {
    console.error('Error fetching articles directly:', error);
    throw new Error('Could not fetch articles.');
  }
}

export async function getTickerTexts() {
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

export async function getInterviews() {
  const { data, error } = await supabase
    .from('entrevistas')
    .select('id, nombre, url, created_at, updated_at, categoria, imagen')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }
  const processedInterviews = (data || []).map(item => ({
    ...item,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
  return processedInterviews;
}

export async function getActiveBanners() {
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

export async function getActiveAds() {
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

export async function getCalendarEvents() {
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
