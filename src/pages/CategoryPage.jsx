import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard';
import { useNews } from '@/context/NewsContext';
import { useToast } from '@/components/ui/use-toast';

const CategoryPage = () => {
  const { categoria } = useParams();
  const { getNewsByCategory, isLoading } = useNews();
  const { toast } = useToast();
  
  const categoryNews = getNewsByCategory(categoria);
  
  useEffect(() => {
    // Scroll al inicio de la página cuando cambia la categoría
    window.scrollTo(0, 0);
  }, [categoria]);
  
  useEffect(() => {
    if (categoryNews.length === 0 && !isLoading) {
      toast({
        title: "Categoría vacía",
        description: `No se encontraron noticias en la categoría "${categoria}".`,
        variant: "destructive",
      });
    }
  }, [categoryNews, categoria, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md animate-pulse">
              <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-2/3"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4 -ml-3">
            <ArrowLeft size={16} className="mr-2" />
            Volver a inicio
          </Button>
        </Link>
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Categoría: {categoria}
        </motion.h1>
        <p className="text-gray-600">
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
          <p className="text-gray-600 mb-6">
            No se encontraron noticias en esta categoría.
          </p>
          <Link to="/">
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