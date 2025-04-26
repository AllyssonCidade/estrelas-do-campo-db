
'use client'; // Mark as client component for animation hooks

import * as React from 'react'; // Import React for useEffect/useState
import { getNoticias } from '@/lib/firebase';
import type { Noticia } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion for animations

export default function NoticiasPage() {
  const [noticias, setNoticias] = React.useState<Noticia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // State to hold error message

  React.useEffect(() => {
    const fetchNoticias = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        const fetchedNoticias = await getNoticias();
        setNoticias(fetchedNoticias);
      } catch (error: any) {
        console.error("Failed to fetch news:", error);
        setError("Não foi possível carregar as notícias. Verifique sua conexão ou tente novamente mais tarde."); // Set user-friendly error message
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger animation
        duration: 0.3, // Faster fade-in
      },
    }),
  };

  return (
    <div className="space-y-6 container mx-auto max-w-4xl py-8 px-4"> {/* Added container for layout */}
      <h1 className="text-2xl font-bold text-primary">Notícias do Time</h1>
      <p className="text-muted-foreground">Fique por dentro das novidades das Estrelas do Campo!</p>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-1">
           {[...Array(3)].map((_, i) => ( // Show 3 skeletons while loading
            <Card key={`skeleton-${i}`} className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row">
              <Skeleton className="relative w-full h-40 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
              <div className="flex flex-col justify-between p-4 flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                  <Skeleton className="h-4 w-4 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-20 bg-muted" />
                </div>
              </div>
            </Card>
           ))}
        </div>
      ) : error ? ( // Display error message if fetch failed
         <p className="text-center text-destructive mt-10">{error}</p>
      ) : noticias.length === 0 ? (
        <p>Nenhuma notícia publicada recentemente.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          {noticias.map((noticia: Noticia, index: number) => (
            <motion.div
              key={noticia.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="w-full" // Ensure motion div takes full width
            >
              <Card className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row w-full bg-card">
                {noticia.imagem && (
                  <div className="relative w-full h-48 sm:w-[100px] sm:h-[100px] flex-shrink-0">
                    <Image
                      src={noticia.imagem}
                      alt={`Imagem para ${noticia.titulo}`}
                      width={100} // Specify width
                      height={100} // Specify height
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                      loading="lazy" // Lazy load images in Noticias section
                      unoptimized={noticia.imagem.startsWith('https://via.placeholder.com')} // Avoid optimizing placeholders
                    />
                  </div>
                )}
                 {!noticia.imagem && (
                  <div className="relative w-full h-48 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted flex items-center justify-center rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                    <span className="text-xs text-muted-foreground">Sem Imagem</span>
                  </div>
                )}
                <div className="flex flex-col justify-between p-4 flex-grow">
                  <div>
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-lg text-primary">{noticia.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pb-2">
                      <p className="text-sm text-foreground line-clamp-3">{noticia.texto}</p> {/* Use line-clamp */}
                    </CardContent>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{noticia.data}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Removed revalidate as data fetching is now client-side with useEffect
// export const revalidate = 60;
