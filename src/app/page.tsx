
'use client'; // Mark as client component for hooks and animations

import * as React from 'react'; // Import React for useEffect/useState
import { getEventos } from '@/lib/firebase';
import type { Evento } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { CalendarDays, Clock, MapPin, Map, Building, Users, Medal } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import motion for animations

// --- Hero Section ---
function HeroSection() {
  return (
     // Updated section with background image, overlay, and specific heights
    <section className="relative bg-cover bg-center text-white py-16 sm:py-24 px-4 text-center overflow-hidden h-[250px] sm:h-[350px] flex flex-col items-center justify-center"
             style={{ backgroundImage: "url('https://videos.openai.com/vg-assets/assets%2Ftask_01jss3fs1rfcqaca6f80bpj9b2%2F1745673059_img_0.webp?st=2025-04-26T16%3A30%3A07Z&se=2025-05-02T17%3A30%3A07Z&sks=b&skt=2025-04-26T16%3A30%3A07Z&ske=2025-05-02T17%3A30%3A07Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=day635gbJKlLcH5FifE0gx%2BoBbbQgxEDxy11bjacLvM%3D&az=oaivgprodscus')", backgroundSize: "cover",
    backgroundPosition: "bottom" }}>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Content wrapper */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h1
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-4xl sm:text-5xl font-bold mb-4 text-accent" // Changed text color to accent (gold)
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }} // Adjusted shadow for gold text
        >
          Estrelas do Campo
        </motion.h1>
         <motion.h2
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="text-xl sm:text-2xl font-semibold mb-4 text-white" // Secondary title remains white
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}
        >
          Força, Cultura e Inclusão
        </motion.h2>
        <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="text-base sm:text-lg mb-8 text-white" // Ensure white text
        >
          Apoie o futebol feminino e junte-se à nossa comunidade!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            // Use the accent variant for gold, hover defined in button component
            variant="accent"
            className="font-semibold shadow-md transition-colors duration-200 hover:bg-yellow-500" // Explicit hover for accent
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior if needed
              const agendaSection = document.getElementById('agenda-section');
              if (agendaSection) {
                agendaSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <a href="#agenda-section">Ver Agenda</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// --- Apresentação Section ---
function ApresentacaoSection() {
   const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={itemVariants}
          className="text-2xl sm:text-3xl font-bold text-primary mb-6">
          Quem Somos
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.2 } } }}
          className="text-foreground mb-10 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          As Estrelas do Campo são mais que um time: somos um movimento de inclusão, empoderamento e cultura. Nosso futebol une a comunidade e inspira mulheres a brilharem!
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.4 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4">
              <Image
                src="https://videos.openai.com/vg-assets/assets%2Ftask_01jss2fn50fert2678jpc003k7%2F1745672019_img_0.webp?st=2025-04-26T16%3A30%3A07Z&se=2025-05-02T17%3A30%3A07Z&sks=b&skt=2025-04-26T16%3A30%3A07Z&ske=2025-05-02T17%3A30%3A07Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=%2Bw0So5qPPBYK9gwcO5BPtxQHS5n1LKRB%2BpujDFfjYFs%3D&az=oaivgprodscus"
                alt="Time de futebol feminino celebrando união"
                width={300}
                height={200}
                layout="responsive"
                className="transition-transform duration-300 hover:scale-105"
                loading="lazy"
                unoptimized
              />
            </div>
            <p className="text-accent font-semibold text-sm">Juntas, somos imbatíveis!</p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.6 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4">
              <Image
                src="https://videos.openai.com/vg-assets/assets%2Ftask_01jss2tcw6e3rbh8xy20b8gejb%2F1745672358_img_0.webp?st=2025-04-26T16%3A30%3A07Z&se=2025-05-02T17%3A30%3A07Z&sks=b&skt=2025-04-26T16%3A30%3A07Z&ske=2025-05-02T17%3A30%3A07Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=c8T4mDffobMLQzomeJPw3ISH5ti%2Fvirla6JXstxTjAI%3D&az=oaivgprodscus"
                alt="Jogadora de futebol chutando a bola com energia"
                width={300}
                height={200}
                layout="responsive"
                className="transition-transform duration-300 hover:scale-105"
                loading="lazy"
                unoptimized
              />
            </div>
            <p className="text-accent font-semibold text-sm">O campo é nosso palco!</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Locais Section ---
function LocaisSection() {
   const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.15, duration: 0.4 },
    }),
  };

  const locais = [
    {
      nome: "Campo Municipal",
      endereco: "Rua do Esporte, 123, Cidade",
      descricao: "Nosso lar para treinos e jogos!",
      imagem: "https://tse1.mm.bing.net/th?id=OIP.CDutYtSWQBsO7bDMlEvwCwHaE6&pid=Api&P=0&h=180",
      alt: "Imagem do Campo Municipal",
      icon: <Map className="h-6 w-6 text-primary" />
    },
    {
      nome: "Estádio Central",
      endereco: "Av. Central, 456, Cidade",
      descricao: "Palco dos grandes amistosos!",
      imagem: "https://tse1.mm.bing.net/th?id=OIP.7B7m-uxN9RFVzWsLPeowIAHaEa&pid=Api&P=0&h=180",
      alt: "Imagem do Estádio Central",
      icon: <Building className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section className="py-12 px-4 bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          className="text-2xl sm:text-3xl font-bold text-primary mb-8">
          Onde Jogamos
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locais.map((local, index) => (
            <motion.div
              key={local.nome}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={cardVariants}
            >
              <Card className="overflow-hidden shadow-lg rounded-lg h-full flex flex-col text-left bg-card">
                <div className="relative h-40 w-full">
                   <Image
                      src={local.imagem}
                      alt={local.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      loading="lazy" // Lazy load images in Locais section
                      unoptimized
                    />
                </div>
                <CardHeader className="flex-row items-center gap-3 pb-2">
                  {local.icon}
                  <CardTitle className="text-xl text-primary">{local.nome}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-1">
                  <p className="text-sm text-muted-foreground">{local.endereco}</p>
                  <p className="text-base text-foreground">{local.descricao}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Agenda Section Component ---
function AgendaSection() {
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // State to hold error message

  React.useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        const fetchedEventos = await getEventos();
        setEventos(fetchedEventos);
      } catch (error: any) {
        console.error("Failed to fetch events:", error);
        setError("Não foi possível carregar a agenda. Verifique sua conexão ou tente novamente mais tarde."); // Set user-friendly error message
        // Keep loading false, show error message instead of skeleton
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger animation
        duration: 0.2, // Faster fade-in as requested
      },
    }),
  };


  return (
    <section id="agenda-section" className="py-12 px-4 bg-background">
       <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-2">Agenda de Eventos</h2>
        <p className="text-muted-foreground text-center mb-8">Futebol feminino: força e cultura.</p>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {[...Array(3)].map((_, i) => ( // Show 3 skeletons
                <Card key={`skeleton-${i}`} className="shadow-md rounded-lg overflow-hidden border border-border bg-card p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full bg-muted" />
                        <Skeleton className="h-4 w-1/2 bg-muted" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full bg-muted" />
                        <Skeleton className="h-4 w-1/3 bg-muted" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full bg-muted" />
                        <Skeleton className="h-4 w-2/3 bg-muted" />
                    </div>
                </Card>
            ))}
          </div>
        ) : error ? ( // Display error message if fetch failed
          <p className="text-center text-destructive mt-10">{error}</p>
        ) : eventos.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">Nenhum evento agendado no momento.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {eventos.map((evento: Evento, index: number) => (
              <motion.div
                 key={evento.id}
                 custom={index}
                 initial="hidden"
                 animate="visible"
                 variants={cardVariants}
                 className="w-full" // Ensure motion div takes full width
              >
                <Card className="shadow-lg rounded-lg overflow-hidden border border-border bg-card hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-primary text-xl font-semibold">{evento.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2 text-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{evento.data}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{evento.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{evento.local}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
       </div>
    </section>
  );
}

// --- Main Page Component ---
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ApresentacaoSection />
      <LocaisSection />
      <AgendaSection />
    </div>
  );
}

// Removed revalidate as data fetching is now client-side with useEffect
// export const revalidate = 60;
