import { supabase } from '@/lib/supabaseClient';
import NewsSlide from '@/components/NewsSlide';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isValidSlideUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string }
};

async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, titulo, slug, description, resumen, contenido, created_at, updatedAt, autor, categoria, thumbnail_url, featureStatus, meta_title, meta_description, meta_keywords, audio_url, url_slide')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error(`Error fetching article with id ${id}:`, error);
    return null;
  }
  
  // Map Supabase data to our Article type
  const article: Article = {
    id: data.id,
    titulo: data.titulo,
    slug: data.slug,
    description: data.description,
    resumen: data.resumen,
    contenido: data.contenido,
    fecha: data.created_at,
    created_at: data.created_at,
    updatedAt: data.updatedAt,
    autor: data.autor,
    categoria: data.categoria,
    imageUrl: data.thumbnail_url || '/placeholder.png', // Map thumbnail_url to imageUrl
    thumbnail_url: data.thumbnail_url,
    featureStatus: data.featureStatus,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    meta_keywords: data.meta_keywords,
    audio_url: data.audio_url,
    url_slide: data.url_slide,
  };

  return article;
}

// CORRECCIÓN: Quitamos el argumento 'parent' que causaba el error
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const article = await getArticle(params.id);

  if (!article) {
    return { title: 'Noticia no encontrada' };
  }

  return {
    title: article.titulo || 'Noticia sin título',
    description: 'Noticia destacada en Saladillo Vivo',
    openGraph: {
      title: article.titulo || 'Noticia sin título',
      description: 'Ver slide de noticia',
      images: [article.imageUrl || '/placeholder.png'],
    },
  };
}

export default async function SlidePage({ params }: Props) {
  const article = await getArticle(params.id);

  if (!article || !isValidSlideUrl(article.url_slide)) {
    notFound();
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden">
      <NewsSlide 
        article={article}
        onEnd={() => {}}
      />
    </main>
  );
}