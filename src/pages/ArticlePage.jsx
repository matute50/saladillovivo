import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard';
import { useNews } from '@/context/NewsContext';
import { useToast } from '@/components/ui/use-toast';

const ArticlePage = () => {
  const { slug } = useParams();
  const { getNewsBySlug, getRelatedNews, isLoading } = useNews();
  const { toast } = useToast();
  
  const noticia = getNewsBySlug(slug);
  const relatedNews = noticia ? getRelatedNews(slug, noticia.categoria || 'General') : [];
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  useEffect(() => {
    if (!noticia && !isLoading) {
      toast({
        title: "Artículo no encontrado",
        description: "El artículo que buscas no existe o ha sido eliminado.",
        variant: "destructive",
      });
    }
  }, [noticia, isLoading, toast]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Cargando artículo... - Saladillo Vivo</title>
        </Helmet>
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8 animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Artículo no encontrado - Saladillo Vivo</title>
        </Helmet>
        <h2 className="text-2xl font-bold mb-4">Artículo no encontrado</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, el artículo que estás buscando no existe o ha sido eliminado.
        </p>
        <Link to="/">
          <Button>
            Volver a la página principal
          </Button>
        </Link>
      </div>
    );
  }
  
  const siteBaseUrl = "https://www.saladillovivo.com.ar"; 
  const articleUrl = `${siteBaseUrl}/noticia/${noticia.slug}`;
  const logoUrl = `${siteBaseUrl}/logo.png`; // Asegúrate que este logo exista

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": noticia.titulo,
    "image": [noticia.imageUrl || `${siteBaseUrl}/default-og-image.png`],
    "datePublished": noticia.createdAt ? new Date(noticia.createdAt).toISOString() : (noticia.fecha ? new Date(noticia.fecha).toISOString() : new Date().toISOString()),
    "dateModified": noticia.updatedAt ? new Date(noticia.updatedAt).toISOString() : (noticia.fecha ? new Date(noticia.fecha).toISOString() : new Date().toISOString()),
    "author": {
      "@type": "Organization",
      "name": "Saladillo ViVo"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Saladillo ViVo",
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "description": noticia.description || noticia.resumen, 
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{`${noticia.titulo} - Saladillo Vivo`}</title>
        <meta name="description" content={noticia.description || noticia.resumen} />
        <meta property="og:title" content={noticia.titulo} />
        <meta property="og:description" content={noticia.description || noticia.resumen} />
        <meta property="og:image" content={noticia.imageUrl || `${siteBaseUrl}/default-og-image.png`} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={noticia.titulo} />
        <meta name="twitter:description" content={noticia.description || noticia.resumen} />
        <meta name="twitter:image" content={noticia.imageUrl || `${siteBaseUrl}/default-og-image.png`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6 -ml-3">
            <ArrowLeft size={16} className="mr-2" />
            Volver a inicio
          </Button>
        </Link>
        
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {noticia.titulo}
            </motion.h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 gap-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(noticia.fecha)}</span>
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                <span>{noticia.autor}</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Tag size={16} className="mr-1" />
                <span>{noticia.categoria || 'General'}</span>
              </div>
            </div>
            
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img  
                className="w-full h-auto" 
                alt={`Imagen ilustrativa de: ${noticia.titulo}`}
               src={noticia.imageUrl || "https://images.unsplash.com/photo-1456339445756-beb5120afc42"} />
            </div>
            
            <div className="text-lg font-medium mb-6 text-gray-700">
              {noticia.resumen}
            </div>
          </header>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {noticia.contenido.split('\n\n').map((parrafo, index) => (
              <p key={index} className="mb-4">
                {parrafo}
              </p>
            ))}
          </div>
        </motion.article>
        
        {relatedNews.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Noticias relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((noticiaRelacionada, index) => (
                <NewsCard 
                  key={noticiaRelacionada.id} 
                  noticia={noticiaRelacionada} 
                  index={index}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;