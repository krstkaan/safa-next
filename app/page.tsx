'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { printRequestsAPI, requestersAPI, approversAPI, booksAPI, authorsAPI, publishersAPI, PrintRequest, Book } from '@/lib/api';
import { Printer, Users, UserCheck, TrendingUp, Book as BookIcon, User, Building, BarChart3, FileText, Calendar } from 'lucide-react';

interface DashboardStats {
  totalRequests: number;
  totalRequesters: number;
  totalApprovers: number;
  totalCopies: number;
  totalBooks: number;
  totalAuthors: number;
  totalPublishers: number;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    totalRequesters: 0,
    totalApprovers: 0,
    totalCopies: 0,
    totalBooks: 0,
    totalAuthors: 0,
    totalPublishers: 0,
  });
  const [recentRequests, setRecentRequests] = useState<PrintRequest[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const [
            requestsResponse, 
            requestersResponse, 
            approversResponse,
            booksResponse,
            authorsResponse,
            publishersResponse
          ] = await Promise.all([
            printRequestsAPI.getAll(),
            requestersAPI.getAll(),
            approversAPI.getAll(),
            booksAPI.getAll(),
            authorsAPI.getAll(),
            publishersAPI.getAll(),
          ]);

          const requests = requestsResponse.data;
          const books = booksResponse.data;
          const totalCopies = requests.reduce((sum, req) => sum + req.color_copies + req.bw_copies, 0);

          setStats({
            totalRequests: requestsResponse.pagination.total,
            totalRequesters: requestersResponse.pagination.total,
            totalApprovers: approversResponse.pagination.total,
            totalCopies,
            totalBooks: booksResponse.pagination.total,
            totalAuthors: authorsResponse.pagination.total,
            totalPublishers: publishersResponse.pagination.total,
          });

          // Son 5 isteği ve kitabı göster
          setRecentRequests(requests.slice(-5).reverse());
          setRecentBooks(books.slice(-5).reverse());
        } catch (error) {
          console.error('Dashboard verisi yüklenirken hata:', error);
        } finally {
          setDashboardLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderDashboardContent = () => {
    if (dashboardLoading) {
      return (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white animate-pulse">
            <div className="h-8 bg-blue-500 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-blue-400 rounded w-1/2"></div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-16 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Safa Kütüphane Yönetim Sistemi</h1>
          <p className="text-blue-100 text-lg">Hoş geldiniz! Sistem durumu ve son işlemler</p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sol Sütun - Fotokopi Yönetimi */}
          <div className="space-y-6">
            {/* Büyük Fotokopi Kartı */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-orange-800">Fotokopi Sistemi</CardTitle>
                    <p className="text-sm text-orange-700 mt-1">Toplam işlem özeti</p>
                  </div>
                  <Printer className="h-8 w-8 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-4xl font-bold text-orange-900">{stats.totalRequests}</div>
                    <p className="text-sm text-orange-700 mt-1">Toplam İstek</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-orange-900">{stats.totalCopies}</div>
                    <p className="text-sm text-orange-700 mt-1">Toplam Kopya</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alt Fotokopi Kartları */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-200 rounded-full -mr-8 -mt-8 opacity-50"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-teal-800">Talep Edenler</CardTitle>
                  <Users className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-900">{stats.totalRequesters}</div>
                  <p className="text-xs text-teal-700 mt-1">Aktif kullanıcı</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200 rounded-full -mr-8 -mt-8 opacity-50"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-indigo-800">Onaylayanlar</CardTitle>
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-900">{stats.totalApprovers}</div>
                  <p className="text-xs text-indigo-700 mt-1">Sistem yöneticisi</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sağ Sütun - Kitap Yönetimi */}
          <div className="space-y-6">
            {/* Büyük Kitap Kartı */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-blue-800">Kitap Kütüphanesi</CardTitle>
                    <p className="text-sm text-blue-700 mt-1">Koleksiyon özeti</p>
                  </div>
                  <BookIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="text-4xl font-bold text-blue-900 mb-2">{stats.totalBooks}</div>
                  <p className="text-sm text-blue-700">Toplam Kitap</p>
                </div>
              </CardContent>
            </Card>

            {/* Alt Kitap Kartları */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 rounded-full -mr-8 -mt-8 opacity-50"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-green-800">Yazarlar</CardTitle>
                  <User className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{stats.totalAuthors}</div>
                  <p className="text-xs text-green-700 mt-1">Toplam yazar</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 rounded-full -mr-8 -mt-8 opacity-50"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-purple-800">Yayınevleri</CardTitle>
                  <Building className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{stats.totalPublishers}</div>
                  <p className="text-xs text-purple-700 mt-1">Toplam yayınevi</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Son İşlemler */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Son Fotokopi İstekleri */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-gray-800">Son Fotokopi İstekleri</CardTitle>
              </div>
              <CardDescription>
                En son oluşturulan fotokopi istekleri
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentRequests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentRequests.map((request, index) => (
                    <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {request.requester?.name || 'Bilinmeyen Talep Eden'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Onaylayan: {request.approver?.name || 'Bilinmeyen Onaylayan'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
                            {request.color_copies + request.bw_copies} kopya
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(request.requested_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Henüz fotokopi isteği bulunmuyor
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Son Eklenen Kitaplar */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-2">
                <BookIcon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-800">Son Eklenen Kitaplar</CardTitle>
              </div>
              <CardDescription>
                En son sisteme eklenen kitaplar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentBooks.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentBooks.map((book, index) => (
                    <div key={book.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {book.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {book.author?.name || 'Bilinmeyen Yazar'} • {book.publisher?.name || 'Bilinmeyen Yayınevi'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {book.level || 'Genel'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(book.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BookIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Henüz kitap eklenmemiş
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      <Sidebar className="h-screen" />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
}