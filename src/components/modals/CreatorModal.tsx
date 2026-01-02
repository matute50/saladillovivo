'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// SE ELIMINÓ 'MapPin' DE LOS IMPORTS PORQUE NO SE USABA
import { X, Heart, Activity, Code } from 'lucide-react';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  // Bloquear scroll de fondo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-800 relative flex flex-col"
          >
            {/* Botón Cerrar */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 text-gray-500 transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Contenido */}
            <div className="p-6 md:p-8">
              
              {/* Encabezado */}
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                    <Code size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Matías Vidal
                 </h2>
                 <p className="text-[#003399] dark:text-[#6699ff] font-bold text-xs tracking-widest uppercase mt-1">
                    CREADOR DE SALADILLO VIVO
                 </p>
              </div>

              {/* Texto del cuerpo */}
              <div className="space-y-4 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                <p>
                  Soy el creador de <span className="font-bold text-black dark:text-white">SALADILLO VIVO</span>, un medio local hecho desde cero con tecnología propia y una visión muy clara: conectar mi comunidad con contenidos relevantes y cercanos.
                </p>
                
                <p>
                  Desde las apps para TV, web y móviles hasta el sistema de noticias, todo lo programé yo. No contraté a nadie, no tercericé tareas: el código, el acopio de contenidos, la cámara, la edición y hasta el streaming, salen de mis propias ideas.
                </p>

                {/* AQUÍ ESTABA EL ERROR DE LAS COMILLAS. SE CAMBIARON " POR &quot; */}
                <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg border-l-4 border-[#003399] dark:border-[#6699ff] italic text-gray-600 dark:text-gray-400 my-4 text-center">
                  &quot;Nunca fue mi intención poner a funcionar una plataforma más, sino crear identidad.&quot;
                </div>

                <p>
                  Quiero mostrar a <span className="font-semibold">Saladillo</span> en su diversidad: sus historias, sus voces, su arte, porque además de técnico, también soy parte de una red viva llena de talentosos e incansables a los que acompaño desde mi lugar, ofreciendo mi medio como espacio para que sus expresiones lleguen más lejos.
                </p>

                <div className="flex gap-3 pt-2">
                  <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <p>
                    El motor detrás de todo esto no es una estrategia de negocio. Es el amor por mi ciudad y el deseo de ver crecer a los demás.
                  </p>
                </div>

                <div className="flex gap-3">
                   <Activity className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                   <p>
                     Es la misma energía que me lleva, cada semana, a correr muchos kilómetros entrenando para una nueva maratón, donde cada paso es constancia, esfuerzo, y visión de llegada.
                   </p>
                </div>
              </div>

              {/* Pie de tarjeta */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wide">
                  Filosofía
                </p>
                <div className="text-xl font-black text-[#003399] dark:text-[#6699ff] tracking-wider">
                  ¡SIEMPRE MÁS!
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatorModal;