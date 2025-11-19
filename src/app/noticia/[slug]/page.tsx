import { supabase } from '@/lib/supabaseClient';
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

  // 1. Buscamos los datos completos de la noticia
  const { data: article } = await supabase
    .from('articles')
    .select('*') // Pedimos todo
    .eq('slug', slug)
    .single();

  // 2. Si no existe, mostramos la página 404
  if (!article) {
    notFound();
  }

  // 3. Renderizamos el COMPONENTE DE CLIENTE y le pasamos los datos
  return (
    <NoticiaClient article={article} />
  );
}