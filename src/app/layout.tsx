
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
// Removed AuthProvider import: import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

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
         {/* Removed AuthProvider wrapper */}
            <Header />
            {/* Remove default container padding/max-width to allow full-width sections */}
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster /> {/* Add Toaster for displaying messages */}
        {/* Removed AuthProvider wrapper */}
      </body>
    </html>
  );
}
