import { supabase } from '@/lib/supabaseClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

// --- ARREGLO 1: DEFINIR PROPS ---
// Definimos los props que Next.js le pasa a la página
type Props = {
  params: { slug: string };
};

// --- ARREGLO 2: GENERAR METADATA (LA PARTE CLAVE) ---
// Esta función se ejecuta en el servidor para crear las meta tags
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  // 1. Buscamos la noticia en Supabase
  const { data: article } = await supabase
    .from('articles')
    // Pedimos solo los campos necesarios para las meta tags
    .select('title, description, og_image_url') // <-- Usamos la nueva columna
    .eq('slug', slug)
    .single();

  // Si no se encuentra el artículo, devolvemos metadata básica
  if (!article) {
    return {
      title: 'Noticia no encontrada',
    };
  }

  // 2. Devolvemos la metadata correcta para Facebook (Opción B)
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      images: [
        {
          url: article.og_image_url, // <-- ¡AQUÍ ESTÁ LA MAGIA!
          width: 1200,             // Le decimos a Facebook el tamaño exacto
          height: 628,               // (Relación 1.91:1)
          alt: article.title,
        },
      ],
    },
    // (Opcional) Añadir metadata para Twitter
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.og_image_url], 
    },
  };
}
// --- FIN DEL ARREGLO 2 ---


// --- COMPONENTE DE PÁGINA (Ejemplo) ---
// Esta es la página que ven tus usuarios.
// (Reemplaza esto con tu componente de página si ya tienes uno)

// Forzamos la revalidación para que las noticias no queden cacheadas
export const revalidate = 60; // 60 segundos

export default async function NoticiaPage({ params }: Props) {
  const { slug } = params;

  // 1. Buscamos los datos completos de la noticia para mostrar
  const { data: article } = await supabase
    .from('articles')
    .select('*') // Pedimos todo para mostrar en la página
    .eq('slug', slug)
    .single();

  // 2. Si no existe, mostramos la página 404
  if (!article) {
    notFound();
  }

  // 3. Renderizamos la página
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <article>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl mb-4">
          {article.title}
        </h1>
        
        {/* ARREGLO: Usar 'imageUrl' para la imagen principal de la noticia */}
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full rounded-lg shadow-lg mb-6"
            style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
          />
        )}

        {/* ARREGLO 2: Usar 'text' para el cuerpo de la noticia y asegurar que se renderice como HTML */}
        {article.text ? (
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.text }}
          />
        ) : (
          // Fallback por si no hay contenido
          <p className="text-lg dark:text-gray-300">{article.description}</p>
        )}
      </article>
    </main>
  );
}