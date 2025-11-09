// Ruta: src/app/api/marcar-publicado/route.ts

import { NextResponse } from 'next/server';
// Asegúrate de que esta sea la ruta correcta a tu cliente 'admin' de Supabase si usas RLS
// Si no usas RLS, tu cliente 'client' normal está bien.
import { supabase } from '@/lib/supabaseClient'; 

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 1. Parámetro de Seguridad
  const secret = searchParams.get('secret');
  
  // 2. Comparamos el secreto con la Variable de Entorno
  // ¡DEBES AÑADIR ESTA VARIABLE EN VERCEL!
  if (secret !== process.env.MAKE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Obtenemos el ID del artículo que Make.com nos envía
  const { articleId } = await request.json();

  if (!articleId) {
    return NextResponse.json({ error: 'Article ID is missing' }, { status: 400 });
  }

  try {
    // 4. Actualizamos la columna 'is_published' a 'true'
    const { error } = await supabase
      .from('articles')
      .update({ is_published: true })
      .eq('id', articleId); // Buscamos por el ID

    if (error) {
      console.error('Error al marcar como publicado (Supabase):', error.message);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    // 5. Éxito
    return NextResponse.json({ success: true, message: `Article ${articleId} marked as published.` });

  } catch (err: any) {
    console.error('Error en la API (marcar-publicado):', err.message);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}