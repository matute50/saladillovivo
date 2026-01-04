// src/app/layout.tsx
import { Providers } from "./providers"; // Importa el archivo nuevo
import ClientLayoutWrapper from "./ClientLayoutWrapper";
// ... otros imports

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
         {/* ... tus links ... */}
      </head>
      <body className="...">
        {/* Los Providers abrazan todo, pero SOLO UNA VEZ */}
        <Providers>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
        </Providers>
        {/* ... scripts ... */}
      </body>
    </html>
  );
}