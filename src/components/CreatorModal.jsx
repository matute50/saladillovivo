import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CreatorModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Sobre mí</DialogTitle>
          <DialogDescription className="text-center">
            El creador de Saladillo Vivo
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-foreground space-y-4 text-justify py-4">
          <p>
            Soy el creador de Saladillo ViVo, un medio local hecho desde cero, con tecnología propia y una visión muy clara: conectar a mi comunidad con contenido relevante y cercano. Desde las apps para TV, web y móviles hasta el sistema de noticias, todo lo programé yo. No contraté a nadie, no tercericé tareas: el código, la cámara, la edición y hasta el streaming, salen de mis propias ideas.
          </p>
          <p>
            No se trata solo de hacer funcionar una plataforma, sino de crear algo con identidad. Algo que refleje a Saladillo en su diversidad: sus historias, sus voces, su arte. Porque además de técnico, también soy parte de una red viva, de músicos, actores y creadores a los que acompaño desde mi lugar, ofreciendo el medio como espacio para que sus expresiones lleguen más lejos.
          </p>
          <p>
            El motor detrás de todo esto no es una estrategia de negocio. Es el amor por mi ciudad. Es el deseo de ver crecer a los demás. Y es también esa energía que me lleva, cada semana, a correr muchos kilómetros entrenando para nuevas maratones. El mismo impulso que me lleva a terminar una app lo traslado a la calle, donde cada paso es constancia, esfuerzo, y visión de llegada.
          </p>
          <p>
            Combino tecnología, comunicación, cultura y comunidad con una filosofía simple: si algo vale la pena, hay que hacerlo bien, con pasión, con honestidad y sin esperar que alguien más lo haga por mí.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorModal;