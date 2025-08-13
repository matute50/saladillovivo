
import dotenv from 'dotenv';
import fs from 'fs';
import RSS from 'rss';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env' });

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están definidas.');
  console.error('Asegúrate de que SUPABASE_URL y SUPABASE_KEY estén en tu archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateRssFeed() {
  try {
    console.log('Iniciando la generación del feed RSS...');

    // 1. Obtener los últimos videos de Supabase
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, nombre, url, createdAt, categoria, imagen')
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Error al obtener videos de Supabase: ${error.message}`);
    }

    if (!videos || videos.length === 0) {
      console.warn('No se encontraron videos para generar el feed RSS.');
      return;
    }

    console.log(`Se encontraron ${videos.length} videos.`);

    // 2. Configurar el feed RSS
    const feed = new RSS({
      title: 'Últimos Videos - Saladillo Vivo',
      description: 'Mantente al día con los últimos videos de Saladillo Vivo.',
      feed_url: `https://www.saladillovivo.com.ar/feed`,
      site_url: 'https://www.saladillovivo.com.ar',
      image_url: process.env.VITE_PUBLIC_LOGO_URL,
      language: 'es',
      pubDate: new Date().toUTCString(),
      ttl: 60, // Tiempo de vida del feed en minutos
    });

    // 3. Añadir cada video como un item al feed
    for (const video of videos) {
      feed.item({
        title: video.nombre,
        description: '', // No description available
                    link: `https://www.saladillovivo.com.ar/video/${video.id}`,
        guid: video.id,
        date: new Date(video.createdAt).toUTCString(),
        enclosure: {
          url: video.imagen,
          type: 'image/jpeg',
        },
        author: video.author || 'Saladillo Vivo',
      });
    }

    // 4. Generar el XML
    const xml = feed.xml({ indent: true });

    // 5. Escribir el archivo en la carpeta public
    fs.writeFileSync('./public/feed.xml', xml);

    console.log('¡Feed RSS generado con éxito en public/feed.xml!');

  } catch (error) {
    console.error('Ocurrió un error durante la generación del feed RSS:');
    console.error(error);
  }
}

generateRssFeed();
