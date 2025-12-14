'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard';
import NewsModal from '@/components/NewsModal';
import { Article } from '@/lib/types';

interface CategoryPageClientProps {
  categoria: string;
  initialData: Article[];
}

const CategoryPageClient: React.FC<CategoryPageClientProps> = ({ categoria, initialData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<Article | null>(null);

  const handleOpenModal = (newsItem: Article) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
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

        {initialData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialData.map((noticia, index) => (
              <NewsCard
                key={noticia.id}
                newsItem={noticia}
                index={index}
                onCardClick={handleOpenModal} // <-- LÓGICA CONECTADA
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

      <AnimatePresence onExitComplete={() => setSelectedNews(null)}>
        {isModalOpen && selectedNews && (
          <NewsModal
            onClose={handleCloseModal}
            newsData={selectedNews}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryPageClient;
