import { supabase } from '@/lib/supabaseClient';
import NewsSlide from '@/components/NewsSlide';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string }
};

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
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
    title: article.title,
    description: 'Noticia destacada en Saladillo Vivo',
    openGraph: {
      title: article.title,
      description: 'Ver slide de noticia',
      images: [article.imageUrl || '/placeholder.png'],
    },
  };
}

export default async function SlidePage({ params }: Props) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden">
      <NewsSlide 
        article={article} 
        isPublicView={true} 
      />
    </main>
  );
}