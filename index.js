const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');

const app = express();
const PORT = process.env.PORT || 3000;

// URL del sitio a scrapear
const SITE_URL = 'https://saladillovivo.com.ar/';

// Endpoint raíz para confirmar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor de feed RSS para Saladillo Vivo está funcionando.');
});

// --- NUEVO ENDPOINT DE DEPURACIÓN ---
app.get('/debug-html', async (req, res) => {
  console.log('Solicitud recibida en /debug-html. Devolviendo HTML de la página...');
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
    const pageContent = await page.content();
    await browser.close();
    res.send(pageContent);
  } catch (error) {
    console.error('Error durante la captura de HTML:', error);
    res.status(500).send('Error al capturar el HTML.');
  }
});

// Endpoint para generar el feed RSS
app.get('/feed', async (req, res) => {
  console.log('Solicitud recibida en /feed. Iniciando scraping...');

  try {
    // 1. OBTENER EL HTML DE LA PÁGINA
    const response = await axios.get(SITE_URL);
    const html = response.data;

    // 2. PARSEAR EL HTML Y EXTRAER LA INFORMACIÓN
    const $ = cheerio.load(html);
    const articles = [];

    $('article.post').each((_idx, el) => {
      const titleElement = $(el).find('h2.entry-title a');
      const descriptionElement = $(el).find('div.entry-summary');

      if (titleElement.length && descriptionElement.length) {
      const title = titleElement.text();
      const url = titleElement.attr('href');
      const description = descriptionElement.text().trim();

      // Defensive check: only add item if all core fields are present
      if (title && url && description) {
        articles.push({
          title: title,
          url: url,
          description: description,
        });
      }
      }
    });
    console.log(`Se encontraron ${articles.length} artículos.`);

    await browser.close();

    // 3. CREAR EL FEED RSS
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const publicUrl = `${protocol}://${host}/feed`;

    const feed = new RSS({
      title: 'Saladillo Vivo - Feed no oficial',
      description: 'Feed RSS generado automáticamente de las últimas noticias de saladillovivo.com.ar',
      feed_url: publicUrl,
      site_url: SITE_URL,
      language: 'es',
    });

    // Agrega cada artículo extraído al feed
    articles.forEach(article => {
      feed.item({
        title: article.title,
        description: article.description,
        url: article.url,
        guid: article.url, // Usamos la URL como un identificador único
        date: new Date(), // El sitio no provee fecha fácil de scrapear, usamos la fecha actual
      });
    });

    // 4. ENVIAR LA RESPUESTA
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml());
    console.log('Feed RSS generado y enviado con éxito.');

  } catch (error) {
    console.error('Error durante el scraping o la generación del feed:', error);
    res.status(500).send(`Error details: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
