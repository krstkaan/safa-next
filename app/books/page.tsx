"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, Clock, Settings, Users } from "lucide-react";

export default function BooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Kitap Yönetimi
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Kütüphane kitap koleksiyonu yönetim sistemi
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Book className="h-24 w-24 text-blue-500" />
                <Clock className="h-8 w-8 text-orange-500 absolute -bottom-2 -right-2" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Kitap Yönetimi
            </CardTitle>
            <CardDescription className="text-lg">
              Bu özellik şu anda geliştirme aşamasındadır
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Yakında aşağıdaki özellikler eklenecek:
            </p>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Book className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium">
                  Kitap Katalog Yönetimi
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500" />
                <span className="text-sm font-medium">Ödünç Alma/Verme</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Geliştirme Süreci:</strong> Bu modül aktif olarak
                geliştirilmektedir. Tamamlandığında tüm kitap yönetimi
                işlemlerini buradan gerçekleştirebileceksiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
