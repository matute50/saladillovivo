
// Fichero: src/lib/types.ts

// Define la estructura de un solo artículo de noticia
export interface Article {
  id: string | number;
  slug: string;
  title: string;
  description: string;
  resumen: string;
  contenido: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
  autor: string;
  categoria: string; // O un tipo más específico si tienes categorías predefinidas
  imageUrl: string;
  featureStatus: 'destacada' | 'noticia2' | 'noticia3' | string; // Ajusta según los estados que uses
}

// Define la estructura de un video
export interface Video {
  id: string | number;
  nombre: string;
  url: string;
  createdAt: string;
  categoria: string;
  imagen?: string; // La imagen puede ser opcional
}

// Define la estructura de una entrevista, que es similar a un video
export interface Interview extends Video {}

// Define la estructura de los datos del medio que se está reproduciendo en el player
export interface MediaData {
  url: string;
  title: string;
  type: 'video' | 'stream' | 'image';
  isUserSelected: boolean;
  category: string;
}

// Define la estructura para los banners publicitarios
export interface Banner {
  id: string | number;
  imageUrl: string;
  nombre: string;
  isActive: boolean;
}

// Define la estructura para los anuncios (ads)
export interface Ad {
  id: string | number;
  imageUrl: string;
  name: string;
  isActive: boolean;
  linkUrl?: string; // El enlace puede ser opcional
}

// Define la estructura para los eventos del calendario
export interface CalendarEvent {
  nombre: string;
  fecha: string;
  hora: string;
}

// Define la estructura para los textos del ticker
export interface TickerText {
  text: string;
  isActive: boolean;
}
