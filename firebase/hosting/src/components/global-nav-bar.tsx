
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AuthButton from '@/components/auth-button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';

export default function GlobalNavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/test-page', label: 'Test Page' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <Home className="h-6 w-6" />
          <span className="font-bold text-lg">StroopApp</span>
        </Link>
        <div className="flex flex-1 items-center space-x-2 sm:space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary px-3 py-2 sm:px-4",
                pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
