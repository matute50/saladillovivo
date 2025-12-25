import { supabase } from '@/lib/supabaseClient';
import { Article } from '@/lib/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

// --- ARREGLO 1: IMPORTAR EL NUEVO CLIENTE ---
import NoticiaClient from './NoticiaClient'; // Importamos el componente de cliente

// Definimos los props que Next.js le pasa a la página
type Props = {
  params: { slug: string };
};

// --- ARREGLO 2: GENERAR METADATA (SIN CAMBIOS) ---
// Esta función se ejecuta en el servidor (sigue igual)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  const { data: article } = await supabase
    .from('articles')
    .select('title, description, og_image_url') 
    .eq('slug', slug)
    .single();

  if (!article) {
    return {
      title: 'Noticia no encontrada',
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      images: [
        {
          url: article.og_image_url, 
          width: 1200,
          height: 628,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.og_image_url],  
    },
  };
}
// --- FIN DEL ARREGLO 2 ---


// --- COMPONENTE DE PÁGINA (MODIFICADO) ---
// Sigue siendo un 'async function' (Componente de Servidor)

export const revalidate = 60; // 60 segundos

export default async function NoticiaPage({ params }: Props) {
  const { slug } = params;

  // 1. Buscamos los datos de la noticia con campos específicos
  const { data: rawArticle, error } = await supabase
    .from('articles')
    .select('id, title, text, description, slug, featureStatus, createdAt, updatedAt, autor, categoria, thumbnail_url, audio_url')
    .eq('slug', slug)
    .single();

  // Si hay un error o no hay artículo, mostramos 404
  if (error || !rawArticle) {
    notFound();
  }

  // 2. Mapeamos los datos crudos a nuestra interfaz Article
  const article: Article = {
    id: rawArticle.id,
    titulo: rawArticle.title,
    slug: rawArticle.slug,
    description: rawArticle.description,
    resumen: rawArticle.text ? rawArticle.text.substring(0, 150) + (rawArticle.text.length > 150 ? '...' : '') : '',
    contenido: rawArticle.text || '',
    fecha: rawArticle.createdAt,
    createdAt: rawArticle.createdAt,
    updatedAt: rawArticle.updatedAt,
    autor: rawArticle.autor,
    categoria: rawArticle.categoria,
    imageUrl: rawArticle.thumbnail_url || '', // Mapeamos thumbnail_url a imageUrl
    thumbnail_url: rawArticle.thumbnail_url,
    featureStatus: rawArticle.featureStatus,
    audio_url: rawArticle.audio_url,
  };

  // 3. Renderizamos el COMPONENTE DE CLIENTE y le pasamos el objeto Article
  return (
    <NoticiaClient article={article} />
  );
}