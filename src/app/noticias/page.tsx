
'use client'; // Mark as client component for animation hooks

import * as React from 'react'; // Import React for useEffect/useState
// Removed Firestore import: import { getNoticias } from '@/lib/firebase';
// Removed API import (for now): import { getNoticiasApi } from '@/lib/api';
import type { Noticia } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
// Removed Skeleton import: import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion for animations

// Define Sample Noticias Data Here (since it's static for now)
const sampleNoticias: Omit<Noticia, 'id'>[] = [
  { "titulo": "Vitória por 3x1!", "texto": "Grande jogo contra as Leoas! Nossas meninas mostraram garra e talento em campo.", "data": "20/05/2025", "imagem": "https://via.placeholder.com/100/22C55E/FFFFFF?text=Vitória" },
  { "titulo": "Novo Uniforme!", "texto": "Confira o novo uniforme verde e ouro do Estrelas do Campo! Lindo e poderoso.", "data": "22/05/2025", "imagem": "https://via.placeholder.com/100/FBBF24/1F2937?text=Uniforme" },
  { "titulo": "Treino Aberto!", "texto": "Venha apoiar as Estrelas no treino aberto deste sábado! Esperamos você!", "data": "25/05/2025", "imagem": "https://via.placeholder.com/100/cccccc/000000?text=Treino" },
];

export default function NoticiasPage() {
  // Use state to hold the static news data
  const [noticias, setNoticias] = React.useState<Noticia[]>([]);
  const [loading, setLoading] = React.useState(true); // Still simulate loading briefly

  React.useEffect(() => {
    // Simulate fetching static data
    setLoading(true);
    setTimeout(() => {
      // Add IDs to sample data
      const dataWithIds = sampleNoticias.map((noticia, index) => ({
        ...noticia,
        id: `static-${index}` // Assign a simple ID
      }));
      setNoticias(dataWithIds);
      setLoading(false);
    }, 300); // Simulate a small delay
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
           {[...Array(3)].map((_, i) => ( // Show 3 placeholders while loading
            <div key={`skeleton-${i}`} className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row bg-card border animate-pulse">
              {/* Image Placeholder */}
              <div className="relative w-full h-40 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
              {/* Content Placeholder */}
              <div className="flex flex-col justify-between p-4 flex-grow space-y-2">
                <div className="h-6 w-3/4 bg-muted rounded" /> {/* Title Skel */}
                <div className="h-4 w-full bg-muted rounded" /> {/* Text Skel */}
                <div className="h-4 w-1/2 bg-muted rounded" /> {/* Text Skel */}
                <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                  <div className="h-4 w-4 rounded-full bg-muted" /> {/* Icon Skel */}
                  <div className="h-4 w-20 bg-muted rounded" /> {/* Date Skel */}
                </div>
              </div>
            </div>
           ))}
        </div>
      ) : noticias.length === 0 ? ( // Should not happen with static data, but good practice
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
              <Card className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row w-full bg-card border"> {/* Added border */}
                {/* Image */}
                <div className="relative w-full h-48 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted"> {/* Added bg-muted as fallback */}
                    <Image
                      src={noticia.imagem || "https://via.placeholder.com/100/cccccc/000000?text=Sem+Imagem"} // Fallback image
                      alt={`Imagem para ${noticia.titulo}`}
                      width={100} // Specify width
                      height={100} // Specify height
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                      loading="lazy" // Lazy load images
                      unoptimized // Don't optimize placeholders
                    />
                  </div>

                {/* Content */}
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
