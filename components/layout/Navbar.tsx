'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Anneniz için özel tatlı mesajlar 💕
  const sweetMessages = [
    "Anne, çay molası zamanı! ☕",
    "Fatmaaa, terliklerim nerede?",
    "Müsait olunca beni ara !!",
    "Fatmaaa, bana giyecek bir şey versene !!",
    "Dünya'nın en iyi annesi burada çalışıyor! 💕",
    "Harika iş çıkarıyorsun anne! ⭐",
    "Bugün de güzel işler yapıyoruz! 🌸",
    "Anne, sen bir harikasın! 🌟",
    "Kütüphane kraliçesi iş başında! 👑",
  ];

  const [currentMessage, setCurrentMessage] = useState(sweetMessages[0]);

  useEffect(() => {
    // Sayfa her yüklendiğinde rastgele bir mesaj seç
    const randomMessage = sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
    setCurrentMessage(randomMessage);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900">
              Safa Kütüphane Sistemi
            </h1>
            <p className="text-xs text-gray-500">Kütüphane Yönetim Sistemi</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">Safa</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 hidden sm:block">
          <span className="text-purple-500 font-medium animate-pulse">{currentMessage}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-blue-200 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-3 h-4 w-4" />
              <span>Profil Ayarları</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-3 h-4 w-4" />
              <span>Sistem Ayarları</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Güvenli Çıkış</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
