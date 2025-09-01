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
  Building,
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
      {
        title: 'Raporlar',
        href: '/print-requests-reports',
        icon: FileText,
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
      {
        title: 'Yazarlar',
        href: '/authors',
        icon: Users,
      },
      {
        title: 'Yayınevleri',
        href: '/publishers',
        icon: Building,
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
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300',
          'lg:relative lg:translate-x-0 lg:z-auto w-64 lg:h-screen flex flex-col lg:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Safa Kütüphane
              </h2>
              <p className="text-xs text-gray-500">Yönetim Sistemi</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
          <nav className="p-4 space-y-6">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <h3 className="mb-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
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
                            'flex items-center space-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group',
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                          )} />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {sectionIndex < sidebarSections.length - 1 && (
                  <div className="mt-6 px-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
