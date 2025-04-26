
import { getNoticias } from '@/lib/firebase';
import type { Noticia } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';


export default async function NoticiasPage() {
  const noticias = await getNoticias();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Notícias do Time</h1>
      <p className="text-muted-foreground">Fique por dentro das novidades das Estrelas do Campo!</p>

      {noticias.length === 0 ? (
        <p>Nenhuma notícia publicada recentemente.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          {noticias.map((noticia: Noticia) => (
            <Card key={noticia.id} className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row">
             {noticia.imagem && (
                <div className="relative w-full h-40 sm:w-32 sm:h-auto flex-shrink-0">
                   <Image
                    src={noticia.imagem}
                    alt={`Imagem para ${noticia.titulo}`}
                    fill // Use fill for responsive images within the container
                    style={{ objectFit: 'cover' }} // Control how image covers the area
                    className="rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                    sizes="(max-width: 640px) 100vw, 128px" // Provide sizes for optimization
                    priority={false} // Consider setting priority=true for first few images if needed
                    loading="lazy" // Lazy load images
                  />
                </div>
              )}
              <div className="flex flex-col justify-between p-4 flex-grow">
                <div>
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg text-primary">{noticia.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    <p className="text-sm text-foreground">{noticia.texto}</p>
                  </CardContent>
                </div>
                 <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{noticia.data}</span>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Add revalidation if needed to refresh data periodically
export const revalidate = 60; // Revalidate every 60 seconds
