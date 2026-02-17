import Link from 'next/link';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

// Detectar si estamos en entorno WebView/APK (muy básico, ajustable según necesidad)
// Una forma común es que la APK inyecte un UserAgent específico o una variable en window.
// Por ahora, usamos una prop opcional o detección de dominio si fuera necesario.
// Para este caso, asumiremos que si unoptimized es explícito, se respeta.
// Si no, intentaremos usar optimización por defecto salvo que se indique lo contrario globalmente.

interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string | undefined | null;
    fallbackSrc?: string;
    isApk?: boolean; // Forzar modo APK si se detecta
}

const DEFAULT_FALLBACK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const SmartImage = ({
    src,
    fallbackSrc = DEFAULT_FALLBACK,
    className,
    alt,
    isApk = false,
    ...props
}: SmartImageProps) => {
    // 1. Sanitize Source
    let finalSrc = src;

    if (!finalSrc) finalSrc = fallbackSrc;

    // 2. Determine Optimization Strategy
    // Si estamos en modo APK o la imagen es un Data URI (placeholder), no optimizamos.
    const isDataUri = finalSrc?.toString().startsWith('data:');
    const shouldUnoptimize = isApk || isDataUri || props.unoptimized;

    return (
        <Image
            src={finalSrc || fallbackSrc}
            alt={alt || "Imagen"}
            className={cn("transition-opacity duration-300", className)}
            unoptimized={shouldUnoptimize}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== fallbackSrc) {
                    target.src = fallbackSrc;
                }
            }}
            {...props}
        />
    );
};

export default SmartImage;
