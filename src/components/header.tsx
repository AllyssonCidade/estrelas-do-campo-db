
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, ShieldCheck } from 'lucide-react'; // Added ShieldCheck for Admin
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth(); // Get authentication status

  const baseNavItems = [
    { href: '/', label: 'Início' }, // Changed 'Agenda' to 'Início' as homepage now has more sections
    { href: '/noticias', label: 'Notícias' },
    { href: '/contato', label: 'Contato' },
  ];

  // Conditionally add Admin link
  const navItems = isAuthenticated
    ? [...baseNavItems, { href: '/admin', label: 'Admin', icon: ShieldCheck }]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8"> {/* Increased height and padding */}
        {/* Logo / Site Name */}
         <Link href="/" className="mr-6 flex items-center space-x-2 shrink-0">
           {/* Optional: Add a logo image here */}
           {/* <Image src="/logo.png" width={40} height={40} alt="Estrelas do Campo Logo" /> */}
           <span className="font-bold text-lg text-accent sm:inline-block">
            Estrelas do Campo
          </span>
        </Link>

        {/* Spacer to push nav/menu to the right */}
        <div className="flex-grow" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 mr-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary flex items-center gap-1', // Added flex, items-center, gap
                  pathname === item.href ? 'text-primary font-bold' : 'text-foreground/70' // Adjusted inactive color
                )}
              >
                 {item.icon && <item.icon className="h-4 w-4" />} {/* Display icon if present */}
                 {item.label}
              </Link>
            ))}
         </nav>

        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-primary hover:bg-primary/10" aria-label="Abrir menu de navegação">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-primary p-0 flex flex-col"> {/* Use flex-col */}
             {/* Mobile Menu Header */}
             <div className="p-6 border-b border-sidebar-border">
                 <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-accent">
                     Estrelas do Campo
                    </span>
                 </Link>
            </div>
            {/* Mobile Menu Links */}
             <nav className="flex flex-col gap-4 p-6 flex-grow"> {/* Use gap-4 */}
              {navItems.map((item) => (
                <SheetClose key={item.href} asChild>
                   <Link
                    href={item.href}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-accent text-primary-foreground flex items-center gap-2 py-2 rounded-md px-3', // Added padding, rounded, flex, gap
                      pathname === item.href ? 'bg-sidebar-accent text-accent font-bold' : 'text-primary-foreground hover:bg-sidebar-accent/80' // Added background for active/hover
                    )}
                  >
                     {item.icon && <item.icon className="h-5 w-5" />} {/* Display icon */}
                     {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
}
