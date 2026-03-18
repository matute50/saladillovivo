---
name: logica de reproduccion de videos
version: 1.0.0
description: Skill especializado en la arquitectura de video "TV-Grade" de Saladillo Vivo. Cubre la reproducción de YouTube con anti-branding cinematográfico, noticias interactivas (.html), filtrado avanzado en Supabase y sistemas de aleatoriedad extrema en carruseles.
---

# Lógica de Reproducción de Videos (TV-Grade)

Este skill define los estándares de reproducción fluida y profesional para la plataforma Saladillo Vivo.

<cuando_usar>

- Implementando o modificando el componente `VideoPlayer`.
- Ajustando transiciones visuales o de audio (Fades de 0.75s/1s).
- Gestionando el sistema de "Cinematic Shields" para ocultar branding de YouTube.
- Configurando el carrusel de videos/noticias en `TvContentRail` o `DesktopLayout`.
- Modificando consultas de Supabase relacionadas con contenido multimedia.

</cuando_usar>

<reproduccion_youtube_antibranding>

### Cinematic Shield Strategy (v22.7)
Para lograr una experiencia limpia tipo TV, se utilizan "escudos" que tapan elementos de YouTube:
- **Z-Index Layering**: 
  1. `YouTube Player` (z-0)
  2. `Cinematic Bars` (Negras, arriba y abajo)
  3. `Intro Overlay / Cinematic Shield` (Capa superior que oculta títulos/logos de YT).
- **Safety Delay (v23)**: Retraso de 3s en la desaparición de la intro para asegurar que el video de fondo haya cargado y los controles de YT se hayan ocultado.

### Audio Fades (v27)
- **Fade-In (1.0s)**: Al desmutear o iniciar un video.
- **Fade-Out (0.75s)**: Sincronizado con `AnimatePresence`. Se activa 0.75s antes del fin del video o al detectar el desmontaje del componente vía `useIsPresent`.

</reproduccion_youtube_antibranding>

<noticias_html_y_slides>

### Integración de Noticias
- **Detección**: Archivos que terminan en `.html`.
- **Comportamiento**:
  1. El video de fondo se pausa (`setIsPlaying(false)`).
  2. Se carga el slide interactivo.
  3. Se reproduce el audio asociado (si existe).
  4. Al finalizar, se restaura la continuidad del video.

</noticias_html_y_slides>

<supabase_y_filtrado>

### Consumo de Datos (v24.9)
- **RPC `get_videos_prioritized`**: Obtiene videos respetando el `tier1` (forzado) y `tier2` (novedad).
- **RPC `get_videos_by_category`**: Búsqueda flexible con `ILIKE`.
- **Exclusiones Críticas**:
  - `HCD de Saladillo`: Excluido permanentemente en queries aleatorias (`.not('categoria', 'ilike', '%HCD%')`).
  - `NOVEDADES`: Oculto de la navegación circular del carrusel.
- **Campos Especiales**:
  - `volumen_extra`: Multiplicador de volumen por video para normalizar audios bajos.
  - `startAt`: Permite iniciar videos en un segundo específico.

</supabase_y_filtrado>

<carrusel_y_aleatoriedad>

### Aleatoriedad Extrema (v26.1)
- **Selección Inicial**: En cada carga de app, se elige una categoría al azar para la posición inicial.
- **ShuffleArray**: Se aplica un barajado de Fisher-Yates a los videos de cada categoría.
- **Shuffle on Choice (Nonce)**: Cada vez que el usuario cambia de categoría con las flechas, un `shuffleNonce` se incrementa para forzar un nuevo orden, asegurando que nunca se vea la misma secuencia al volver.

</carrusel_y_aleatoriedad>

<reglas_de_oro>

- **NUNCA** mostrar el logo de YouTube o el título del video original.
- **SIEMPRE** usar `AnimatePresence` con `mode="wait"` para transiciones Zero-Black.
- **SIEMPRE** verificar el `Safety Delay` de la intro (3s ghost play).
- **BLOQUEAR** la categoría "NOVEDADES" en cualquier carrusel de navegación circular.

</reglas_de_oro>
