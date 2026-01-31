/**
 * SCRIPT DE NORMALIZACIÓN DE AUDIO PARA SALADILLO VIVO
 * 
 * Este script automatiza el cálculo del campo 'volumen_extra' en Supabase.
 * Objetivo: Que todos los videos suenen al nivel de "SEMBRANDO FUTURO".
 */

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const REFERENCE_CATEGORY = 'SEMBRANDO FUTURO';

async function getLoudness(url) {
    try {
        console.log(`Analizando audio: ${url}`);
        const cmd = `yt-dlp -f ba -g "${url}" | ffmpeg -i pipe:0 -filter:a loudnorm=print_format=json -f null - 2>&1`;
        const output = execSync(cmd).toString();
        const match = output.match(/\{[\s\S]*\}/);
        if (!match) return null;
        const stats = JSON.parse(match[0]);
        return parseFloat(stats.input_i);
    } catch (e) {
        console.error(`Error analizando ${url}:`, e.message);
        return null;
    }
}

async function run() {
    console.log('--- Iniciando Normalización Automática ---');

    const { data: refVideos } = await supabase
        .from('videos')
        .select('url, nombre')
        .eq('categoria', REFERENCE_CATEGORY)
        .limit(1);

    if (!refVideos || refVideos.length === 0) {
        console.error('No se encontró video de referencia en SEMBRANDO FUTURO');
        return;
    }

    const refLoudness = await getLoudness(refVideos[0].url);
    console.log(`Nivel de Referencia (${REFERENCE_CATEGORY}): ${refLoudness} LUFS`);

    if (!refLoudness) return;

    const { data: allVideos } = await supabase
        .from('videos')
        .select('id, url, nombre, categoria');

    for (const video of allVideos) {
        if (video.categoria === REFERENCE_CATEGORY) {
            await supabase.from('videos').update({ volumen_extra: 1.0 }).eq('id', video.id);
            continue;
        }

        const currentLoudness = await getLoudness(video.url);
        if (!currentLoudness) continue;

        const diffDb = refLoudness - currentLoudness;
        const multiplier = Math.pow(10, diffDb / 20);
        const finalMultiplier = Math.min(Math.max(multiplier, 0.1), 3.0);

        console.log(`Video: ${video.nombre} | Multiplicador: ${finalMultiplier.toFixed(2)}`);

        await supabase
            .from('videos')
            .update({ volumen_extra: finalMultiplier })
            .eq('id', video.id);
    }

    console.log('--- Proceso Completado ---');
}

run();
