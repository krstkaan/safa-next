'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  FileText,
  Users,
  UserCheck,
  Menu,
  X,
  Printer,
  Book,
} from 'lucide-react';

const sidebarSections = [
  {
    title: 'Ana Sayfa',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: Home,
      },
    ],
  },
  {
    title: 'Fotokopi Yönetimi',
    items: [
      {
        title: 'Fotokopi İstekleri',
        href: '/print-requests',
        icon: Printer,
      },
      {
        title: 'Talep Edenler',
        href: '/requesters',
        icon: Users,
      },
      {
        title: 'Onaylayanlar',
        href: '/approvers',
        icon: UserCheck,
      },
    ],
  },
  {
    title: 'Kitap Yönetimi',
    items: [
      {
        title: 'Kitap Yönetimi',
        href: '/books',
        icon: Book,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300',
          'lg:relative lg:translate-x-0 lg:z-auto w-64 lg:h-screen flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Safa Kütüphane Sistemi
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                        <div
                          className={cn(
                            'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {sectionIndex < sidebarSections.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
