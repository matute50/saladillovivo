import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock } from 'lucide-react';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);

      const { data, error } = await supabase
        .from('eventos')
        .select('id, nombre, fecha, hora, imagen')
        .gte('fecha', today.toISOString().split('T')[0])
        .lte('fecha', sevenDaysLater.toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } else {
        setEvents(data);
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-card rounded-lg">
        <div className="h-8 bg-muted/50 animate-pulse rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-1/3 h-24 bg-muted/50 animate-pulse rounded"></div>
              <div className="w-2/3 space-y-2">
                <div className="h-6 bg-muted/50 animate-pulse rounded"></div>
                <div className="h-4 bg-muted/50 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-muted/50 animate-pulse rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-card rounded-lg shadow-md">
      <h3 className="text-xl font-futura-bold text-foreground mb-4">Agenda de Eventos</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col sm:flex-row gap-4 items-start">
            {event.imagen && (
              <div className="w-full sm:w-1/3 flex-shrink-0">
                <img 
                  class="w-full h-auto object-cover rounded-md aspect-video"
                  alt={`Imagen del evento ${event.nombre}`}
                 src="https://images.unsplash.com/photo-1509930854872-0f61005b282e" />
              </div>
            )}
            <div className="flex-grow">
              <h4 className="font-bold text-lg text-foreground">{event.nombre}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar size={14} />
                <span>{formatDate(event.fecha)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock size={14} />
                <span>{formatTime(event.hora)} hs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;