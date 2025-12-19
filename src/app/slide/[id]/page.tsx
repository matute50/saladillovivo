import { supabase } from '@/lib/supabaseClient';
import NewsSlide from '@/components/NewsSlide';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string }
};

// Helper function to construct Cloudflare R2 public URL
function getR2FileUrl(filePath: string): string {
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    console.error('Error: NEXT_PUBLIC_R2_PUBLIC_URL is not defined.');
    return ''; // Return an empty string or a fallback URL
  }
  // Ensure the URL doesn't have a trailing slash and filePath doesn't have a leading one
  const cleanR2Url = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
  const cleanFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  return `${cleanR2Url}/${cleanFilePath}`;
}

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const article = await getArticle(params.id);

  if (!article) {
    return { title: 'Noticia no encontrada' };
  }

  return {
    title: article.title || 'Noticia sin título', // Usar article.title según el esquema
    description: 'Noticia destacada en Saladillo Vivo',
    openGraph: {
      title: article.title || 'Noticia sin título', // Usar article.title según el esquema
      description: 'Ver slide de noticia',
      images: [article.image_url || '/placeholder.png'], // Usar article.image_url
    },
  };
}

export default async function SlidePage({ params }: Props) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  // Check if url_slide exists and is a valid string
  if (article.url_slide && typeof article.url_slide === 'string') {
    const slideUrl = getR2FileUrl(`slides/${article.url_slide}`);
    
    if (!slideUrl) {
      // Fallback to NewsSlide if the R2 URL is not configured
      return (
        <main className="w-screen h-screen bg-black overflow-hidden">
          <NewsSlide
            article={article}
            onEnd={() => {}}
          />
        </main>
      );
    }

    return (
      <main className="w-screen h-screen bg-black overflow-hidden">
        <iframe
          src={slideUrl}
          title={article.title || 'Slide'}
          width="100%"
          height="100%"
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Sandboxing para seguridad
          style={{ border: 'none' }}
        ></iframe>
      </main>
    );
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