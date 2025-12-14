import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Article } from '@/lib/types';
import CategoryPageClient from './CategoryPageClient'; // Importar el nuevo componente de cliente

interface SupabaseArticleData {
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
  url_slide?: string;
}

// Esta función obtiene las noticias para una categoría específica.
// (Se mantiene igual)
async function getNewsForCategory(category: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, text, imageUrl, miniatura_url, featureStatus, createdAt, updatedAt, slug, description, meta_title, meta_description, meta_keywords, url_slide')
    .eq('featureStatus', category)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching news for category:', error);
    return [];
  }

  return (data as SupabaseArticleData[] || []).map((item): Article => ({
    id: item.id,
    titulo: item.title,
    slug: item.slug || item.id.toString(),
    description: item.description || (item.text ? item.text.substring(0, 160) : 'Descripción no disponible.'),
    resumen: item.text ? item.text.substring(0, 150) + (item.text.length > 150 ? '...' : '') : 'Resumen no disponible.',
    contenido: item.text || 'Contenido no disponible.',
    fecha: item.createdAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    autor: 'Equipo Editorial',
    categoria: item.featureStatus,
    imageUrl: item.imageUrl || 'https://saladillovivo.vercel.app/default-og-image.png',
    featureStatus: item.featureStatus,
    meta_title: item.meta_title,
    meta_description: item.meta_description,
    meta_keywords: item.meta_keywords,
    url_slide: item.url_slide,
  }));
}

// El componente de página ahora es un componente de servidor simple.
const CategoryPage = async ({ params }: { params: { categoria: string } }) => {
  const { categoria } = params;
  const categoryNews = await getNewsForCategory(categoria);

  // Renderiza el componente de cliente y le pasa los datos.
  return (
    <CategoryPageClient 
      categoria={categoria} 
      initialData={categoryNews} 
    />
  );
};

export default CategoryPage;

// La función generateStaticParams se mantiene igual.
export async function generateStaticParams() {
  const { data, error } = await supabase.from('articles').select('featureStatus');

  if (error || !data) {
    console.error("Failed to fetch categories for static generation", error);
    return [];
  }

  const uniqueCategories = [...new Set(data.map(item => item.featureStatus).filter((status): status is string => typeof status === 'string' && status.trim() !== ''))];

  return uniqueCategories.map(categoria => ({
    categoria: categoria,
  }));
}
