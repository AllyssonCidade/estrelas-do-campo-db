
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ContatoPage() {
  const whatsappNumber = "5511999999999"; // Placeholder number
  const whatsappMessage = "Olá, sou fã do Estrelas do Campo e quero saber mais!";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-[calc(100vh-14rem)]">
      <MessageCircle className="h-16 w-16 text-primary" />
      <h1 className="text-2xl font-bold text-primary">Fale com o Time</h1>
      <p className="text-muted-foreground max-w-md">
        Tem alguma dúvida, sugestão ou quer apoiar as Estrelas do Campo? Entre em contato conosco pelo WhatsApp!
      </p>
      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Enviar Mensagem
        </Link>
      </Button>
    </div>
  );
}
