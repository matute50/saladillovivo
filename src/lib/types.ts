export interface Article {
  id: string;
  titulo: string;
  slug: string;
  description: string;
  resumen: string;
  contenido: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
  autor: string;
  categoria: string | null;
  imageUrl: string;
  featureStatus: 'featured' | 'secondary' | 'tertiary' | null;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  miniatura_url?: string;
  audio_url?: string | null; // <-- AÑADIDO
}

export interface SupabaseArticle {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  miniatura_url?: string;
  featureStatus: 'featured' | 'secondary' | 'tertiary' | null;
  createdAt: string;
  updatedAt: string;
  slug: string;
  description: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  audio_url?: string; // <-- AÑADIDO
}

export interface Video {
  id: string;
  nombre: string;
  url: string;
  createdAt: string;
  categoria: string;
  imagen: string;
  novedad: boolean;
  isLiveThumbnail?: boolean;
  isEvent?: boolean;
  forzar_video?: boolean;
  type?: 'video' | 'stream' | 'image';
  title?: string;
  duration?: number;
}

export interface Interview {
  id: string;
  nombre: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  categoria: string;
  imagen: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  nombre: string;
  isActive: boolean;
}

export interface Ad {
  id: string;
  imageUrl: string;
  name: string;
  isActive: boolean;
  linkUrl?: string;
}

export interface CalendarEvent {
  nombre: string;
  fecha: string;
  hora: string;
}

export interface TickerText {
  text: string;
  isActive: boolean;
}

export interface ExclusiveVideoCarouselProps {
  videos: Video[];
  isLoading: boolean;
  carouselId: string;
  isMobile?: boolean;
  isLive?: boolean;
}

// Main data structure for the home page
export interface PageData {
  articles: {
    featuredNews: Article | null;
    secondaryNews: Article[];
    allNews: Article[];
  };
  videos: {
    featuredVideo: Video | null;
    recentVideos: Video[];
    allVideos: Video[];
    videoCategories: string[];
  };
  tickerTexts: string[];
  interviews: Interview[];
  banners: Banner[];
  ads: Ad[];
  events: CalendarEvent[];
}