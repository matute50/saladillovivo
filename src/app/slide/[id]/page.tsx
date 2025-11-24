import { supabase } from '@/lib/supabaseClient';
import NewsSlide from '@/components/NewsSlide';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

// 1. Forzamos a que la página sea dinámica para que siempre traiga datos frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string }
};

// 2. Función auxiliar para buscar el artículo en la base de datos
async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

// 3. Generador de Metadatos (Para que al compartir el link en WhatsApp/Facebook salga la foto y título)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
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

// 4. El Componente de Página principal
export default async function SlidePage({ params }: Props) {
  const article = await getArticle(params.id);

  // Si el ID no existe en la base de datos, mostramos error 404
  if (!article) {
    notFound();
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden">
      {/* isPublicView={true} activa el modo "Loop infinito" 
        para que la animación se repita si se deja en una pantalla 
      */}
      <NewsSlide 
        article={article} 
        isPublicView={true} 
      />
    </main>
  );
}