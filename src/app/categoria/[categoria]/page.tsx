import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard';
import { notFound } from 'next/navigation';

// Define the shape of the article data
interface Article {
  id: number;
  title: string;
  text: string;
  imageUrl: string;
  featureStatus: string;
  createdAt: string;
  slug: string;
  description: string;
}



// This function fetches news for a specific category
async function getNewsForCategory(category: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('featureStatus', category)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching news for category:', error);
    return [];
  }

  return data || [];
}

const CategoryPage = async ({ params }: { params: { categoria: string } }) => {
  const { categoria } = params;
  const categoryNews = await getNewsForCategory(categoria);
  // Optional: If no news, you could show a 404 or a specific message.
  // if (categoryNews.length === 0) {
  //   notFound();
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 -ml-3">
            <ArrowLeft size={16} className="mr-2" />
            Volver a inicio
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2 capitalize">
          Categoría: {categoria}
        </h1>
        <p className="text-muted-foreground">
          Explora las últimas noticias sobre {categoria}
        </p>
      </div>

      {categoryNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryNews.map((noticia, index) => (
            <NewsCard 
              key={noticia.id} 
              noticia={noticia} 
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No hay noticias disponibles</h3>
          <p className="text-muted-foreground mb-6">
            No se encontraron noticias en esta categoría.
          </p>
          <Link href="/">
            <Button>
              Volver a la página principal
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

// Generate static paths for all categories at build time
export async function generateStaticParams() {
  const { data, error } = await supabase.from('articles').select('featureStatus');

  if (error || !data) {
    console.error("Failed to fetch categories for static generation", error);
    return [];
  }

  // Get unique category values
  const uniqueCategories = [...new Set(data.map(item => item.featureStatus).filter((status): status is string => typeof status === 'string' && status.trim() !== ''))];

  return uniqueCategories.map(categoria => ({
    categoria: categoria,
  }));
}