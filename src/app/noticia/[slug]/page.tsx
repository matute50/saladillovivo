import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, User, Tag } from 'lucide-react';
import NoResultsCard from '@/components/layout/NoResultsCard';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

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

interface ContentPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: ContentPageProps
): Promise<Metadata> {
  const newsItem = await getNews(params.slug);

  if (!newsItem) {
    return {
      title: 'Noticia no encontrada',
      description: 'La noticia que estás buscando no existe o fue eliminada.',
    };
  }

  const siteUrl = 'https://saladillovivo.vercel.app';
  const fullUrl = `${siteUrl}/noticia/${newsItem.slug}`;
  const imageUrl = newsItem.imageUrl || `${siteUrl}/default-og-image.png`;

  return {
    title: newsItem.title,
    description: newsItem.description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: newsItem.title,
      description: newsItem.description,
      url: fullUrl,
      siteName: 'Saladillo Vivo',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: newsItem.title,
        },
      ],
      locale: 'es_AR',
      type: 'article',
      publishedTime: newsItem.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: newsItem.title,
      description: newsItem.description,
      images: [imageUrl],
    },
  };
}

// This function fetches the data for a single news item
async function getNews(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching news:', error);
    return null;
  }

  return data;
}

// The page component is now an async function
const ContentPage = async ({ params }: ContentPageProps) => {
  const newsItem = await getNews(params.slug);

  if (!newsItem) {
    notFound(); // Use Next.js 404 page
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error("Error al formatear fecha:", dateString, error);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <article>
            <header className="mb-6">
              <h1 className="font-futura-bold text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground leading-tight">
                {newsItem.title}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1.5" />
                  <span>{formatDate(newsItem.createdAt)}</span>
                </div>
                <div className="flex items-center">
                    <User size={14} className="mr-1.5" />
                    <span>Equipo Editorial</span>
                </div>
                {newsItem.featureStatus && (
                  <div className="flex items-center text-primary font-medium">
                    <Tag size={14} className="mr-1.5" />
                    <span>{newsItem.featureStatus}</span>
                  </div>
                )}
              </div>
            </header>

            {newsItem.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-muted shadow-lg">
                <Image 
                    className="w-full h-full object-cover"
                    alt={`Imagen de: ${newsItem.title}`}
                    src={newsItem.imageUrl}
                    width={1280}
                    height={720}
                    priority // Prioritize loading the main image
                />
                </div>
            )}
            
            <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none text-foreground/90">
              {newsItem.text.split('\n\n').map((parrafo, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {parrafo}
                </p>
              ))}
            </div>
        </article>
    </div>
  );
};

export default ContentPage;

// Generate static paths for all news items at build time
export async function generateStaticParams() {
  const { data: articles, error } = await supabase.from('articles').select('slug');

  if (error || !articles) {
    console.error("Failed to fetch slugs for static generation", error);
    return [];
  }

  // Filter for valid, non-empty string slugs and map them
  return articles
    .filter(article => article && typeof article.slug === 'string' && article.slug.trim() !== '')
    .map(article => ({
      slug: article.slug,
    }));
}