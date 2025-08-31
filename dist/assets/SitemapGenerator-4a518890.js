import{r,j as n,x as y}from"./index-2de774d9.js";const $=()=>{const[a,i]=r.useState(""),[o,l]=r.useState(!0),[s,c]=r.useState(null);return r.useEffect(()=>{(async()=>{try{l(!0),c(null);const{data:e,error:m}=await y.from("articles").select("slug, updatedAt, createdAt").order("createdAt",{ascending:!1});if(m)throw m;const d="https://www.saladillovivo.com.ar",f=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`,g="</urlset>",h=e.filter(t=>t.slug).map(t=>{const u=t.updatedAt||t.createdAt,S=u?new Date(u).toISOString().split("T")[0]:new Date().toISOString().split("T")[0];return`  <url>
    <loc>${d}/noticia/${t.slug}</loc>
    <lastmod>${S}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`}).join(`
`),w=[{loc:d,lastmod:new Date().toISOString().split("T")[0],changefreq:"weekly",priority:"1.0"}].map(t=>`  <url>
    <loc>${t.loc}</loc>
    <lastmod>${t.lastmod}</lastmod>
    <changefreq>${t.changefreq}</changefreq>
    <priority>${t.priority}</priority>
  </url>`).join(`
`);i(`${f}${w}
${h}
${g}`)}catch(e){console.error("Error generando sitemap:",e),c("Error al generar el sitemap. Por favor, intente más tarde."),i("Error al generar el sitemap.")}finally{l(!1)}})()},[]),r.useEffect(()=>{if(!o&&!s&&a){const p=new Blob([a],{type:"application/xml"}),e=document.createElement("a");e.href=URL.createObjectURL(p)}},[a,o,s]),o?n.jsx("div",{children:"Generando sitemap..."}):s?n.jsx("pre",{children:s}):n.jsx("pre",{children:a})};export{$ as default};
