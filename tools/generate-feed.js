// tools/generate-feed.js
import fs from 'fs';
import path from 'path';
import { mockNews } from '../src/data/mockNews.js'; // Importar los datos reales
import { slugify } from '../src/lib/utils.js'; // Importar la función slugify

// Helper para mapear categorías a hashtags y prioridades
const categoryMetadata = {
    'HCD de Saladillo': { tags: ['#PoliticaLocal', '#HCD'], prioridad: 'media' },
    'Fierros de Saladillo': { tags: ['#Automovilismo', '#Fierros'], prioridad: 'media' },
    'Gente de Acá': { tags: ['#Cultura', '#Entrevistas'], prioridad: 'alta' },
    'Sembrando Futuro': { tags: ['#Campo', '#Agro'], prioridad: 'media' },
    'Saladillo Canta': { tags: ['#Musica', '#ArtistasLocales'], prioridad: 'alta' },
    'Default': { tags: ['#Noticias', '#Saladillo'], prioridad: 'baja' }
};

// --- ¡ATENCIÓN! INICIO DE ZONA A CONFIGURAR ---

/**
 * Esta es una función de ejemplo que simula la obtención de datos.
 * DEBES REEMPLAZAR ESTA LÓGICA para que consulte tu API real o base de datos.
 * 
 * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de items de contenido.
 */
async function fetchAllContentFromAPI() {
    // Ahora usamos los datos de mockNews.js para consistencia con el frontend
    return mockNews;
}

/**
 * Transforma un item de contenido de la API al formato requerido por el feed.
 * AJUSTA los nombres de los campos ('_id', 'title', 'summary', etc.) para que coincidan
 * con los que devuelve tu API.
 * 
 * @param {Object} item - El objeto de item original de la API.
 * @returns {Object} El objeto de item formateado para el feed.
 */
function transformApiItemToFeedItem(item) {
    const metadata = categoryMetadata[item.categoria] || categoryMetadata['Default'];
    
    return {
        id: item.id,
        tipo: 'noticia', // Asumimos que todos son noticias para el feed
        titulo: item.titulo,
        descripcion: item.resumen ? item.resumen.substring(0, 200) : '', // Usar resumen si existe
        url: `https://www.saladillovivo.com.ar/noticia/${slugify(item.titulo, item.id)}`, // Generar URL con slugify
        imagen: item.imagen ? `https://www.saladillovivo.com.ar/images/${item.imagen}` : '', // Construir URL completa de la imagen
        categoria: item.categoria,
        fecha: item.fecha,
        tags: metadata.tags,
        prioridad: metadata.prioridad
    };
}

// --- FIN DE ZONA A CONFIGURAR ---


/**
 * El handler principal de la función serverless.
 * No deberías necesitar modificar esto.
 */
async function generateFeed() {
    console.log('Iniciando la generación del feed JSON...');
    try {
        // 1. Obtener todos los datos crudos desde la API/fuente de datos
        const rawContent = await fetchAllContentFromAPI();

        // 2. Transformar cada item al formato del feed
        const feedItems = rawContent.map(transformApiItemToFeedItem);

        // 3. Ordenar los items por fecha, del más nuevo al más viejo
        feedItems.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // 4. Convertir a JSON y guardar en el archivo
        const jsonContent = JSON.stringify(feedItems, null, 2);
        const outputPath = path.join(process.cwd(), 'public', 'feed.json');
        fs.writeFileSync(outputPath, jsonContent);

        console.log(`¡Feed generado con éxito en public/feed.json!`);

    } catch (error) {
        console.error("Error al generar el feed:", error);
    }
}

generateFeed();