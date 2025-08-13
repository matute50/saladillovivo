import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SitemapGenerator = () => {
  const [sitemapContent, setSitemapContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: articles, error: articlesError } = await supabase
          .from('articles')
          .select('slug, updatedAt, createdAt') 
          .order('createdAt', { ascending: false });

        if (articlesError) {
          throw articlesError;
        }

        const siteUrl = 'https://www.saladillovivo.com.ar';
        const sitemapHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        const sitemapFooter = `</urlset>`;

        const urlEntries = articles
          .filter(article => article.slug)
          .map(article => {
            const lastModDate = article.updatedAt || article.createdAt;
            const isoDate = lastModDate ? new Date(lastModDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            return `  <url>
    <loc>${siteUrl}/noticia/${article.slug}</loc>
    <lastmod>${isoDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
          }).join('\n');
        
        const staticPages = [
          { loc: siteUrl, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '1.0' },
          // Add other static pages here if needed, e.g., /categoria/deportes
        ];

        const staticEntries = staticPages.map(page => {
          return `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        }).join('\n');


        setSitemapContent(`${sitemapHeader}${staticEntries}\n${urlEntries}\n${sitemapFooter}`);
      } catch (err) {
        console.error('Error generando sitemap:', err);
        setError('Error al generar el sitemap. Por favor, intente más tarde.');
        setSitemapContent('Error al generar el sitemap.');
      } finally {
        setLoading(false);
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    if (!loading && !error && sitemapContent) {
      const blob = new Blob([sitemapContent], { type: 'application/xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      // For serving directly, we'd ideally do this server-side.
      // In a client-side SPA, we can't directly serve a file at /sitemap.xml
      // This component will render the XML content, which isn't ideal for crawlers.
      // A true /sitemap.xml would need server-side rendering or a build-time generation step.
      // For now, this outputs the content to the page.
      // A better approach would be to have a serverless function or a build script.
    }
  }, [sitemapContent, loading, error]);

  if (loading) {
    return <div>Generando sitemap...</div>;
  }

  if (error) {
    // To render the XML directly to the page for crawlers:
    // We should set the content type of the response to application/xml.
    // This is not directly possible with React Router serving a component.
    // The best way is to have a dedicated endpoint or a static file.
    // For demonstration, we output the error.
    // In a real setup, a serverless function would generate and serve this.
    return <pre>{error}</pre>;
  }
  
  // This directly renders the XML as plain text on the page.
  // For a real sitemap.xml, it should be served with Content-Type: application/xml
  return <pre>{sitemapContent}</pre>;
};

export default SitemapGenerator;