// tools/generate-feed.js
import fs from 'fs';
import path from 'path';

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
    // Simulación de datos. Reemplaza esto con tu lógica de fetch real.
    // Ejemplo: const response = await fetch('https://api.saladillovivo.com.ar/novedades');
    // const data = await response.json();
    // return data;

    return [
        {
            _id: 'noticia-123',
            type: 'noticia',
            title: 'El HCD aprobó el nuevo presupuesto municipal',
            summary: 'En una sesión extensa, el Honorable Concejo Deliberante de Saladillo dio luz verde al presupuesto para el próximo año fiscal, con foco en obras públicas y desarrollo social.',
            slug: 'hcd-aprobo-presupuesto',
            imageUrl: 'https://www.saladillovivo.com.ar/images/noticia-123.jpg',
            category: 'HCD de Saladillo',
            publishedAt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString() // Hace 2 horas
        },
        {
            _id: 'video-456',
            type: 'video',
            title: 'Nuevo video en Gente de Acá: Entrevista con el artista local',
            summary: 'No te pierdas la última entrega de "Gente de Acá", donde conversamos con un reconocido pintor sobre su trayectoria y sus nuevas obras.',
            slug: 'video-gente-de-aca-pintor',
            imageUrl: 'https://www.saladillovivo.com.ar/images/video-456.jpg',
            category: 'Gente de Acá',
            publishedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString() // Ayer
        },
        {
            _id: 'evento-789',
            type: 'evento',
            title: 'Próximo evento: Festival de Food Trucks en la plaza principal',
            summary: 'El próximo fin de semana, la plaza se llena de sabores con el festival de Food Trucks. Música en vivo, gastronomía y diversión para toda la familia.',
            slug: 'evento-food-trucks',
            imageUrl: 'https://www.saladillovivo.com.ar/images/evento-789.jpg',
            category: 'Eventos',
            publishedAt: new Date().toISOString() // Ahora
        }
    ];
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
    const metadata = categoryMetadata[item.category] || categoryMetadata['Default'];
    
    return {
        id: item._id,
        tipo: item.type,
        titulo: item.title,
        descripcion: item.summary.substring(0, 200), // Trunca a 200 caracteres
        url: `https://www.saladillovivo.com.ar/${item.type}/${item.slug}`, // Asume una estructura de URL
        imagen: item.imageUrl,
        categoria: item.category,
        fecha: item.publishedAt,
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
