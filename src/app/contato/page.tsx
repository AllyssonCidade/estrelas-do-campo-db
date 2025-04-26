
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ContatoPage() {
  const whatsappNumber = "5511999999999"; // Placeholder number
  const whatsappMessage = "Olá, sou fã do Estrelas do Campo e quero saber mais!";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-[calc(100vh-14rem)] py-8">
      <MessageCircle className="h-16 w-16 text-accent" />
      <h1 className="text-2xl font-bold text-primary">Fale com as Estrelas do Campo!</h1>
      <p className="text-muted-foreground max-w-md px-4">
        Tem alguma dúvida, sugestão ou quer apoiar o time? Entre em contato conosco diretamente pelo WhatsApp. Estamos ansiosas para ouvir você!
      </p>
      <Button
        asChild
        size="lg"
        className="bg-accent hover:bg-yellow-500 text-accent-foreground font-semibold shadow-md transition-colors duration-200" // Gold color, white text, hover darken
        aria-label="Enviar mensagem via WhatsApp" // Added aria-label
      >
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Enviar Mensagem via WhatsApp
        </Link>
      </Button>
    </div>
  );
}
