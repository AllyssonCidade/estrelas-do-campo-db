
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';

// Setup Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Assign CSS variable
});

export const metadata: Metadata = {
  title: 'Estrelas do Campo App',
  description: 'Agenda, notícias e contato do time de futebol feminino Estrelas do Campo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          inter.variable // Apply font variable
        )}>
        <Header />
        <main className="flex-grow container mx-auto max-w-[800px] px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
