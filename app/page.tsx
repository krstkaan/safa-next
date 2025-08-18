'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { printRequestsAPI, requestersAPI, approversAPI, PrintRequest } from '@/lib/api';
import { Printer, Users, UserCheck, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalRequests: number;
  totalRequesters: number;
  totalApprovers: number;
  totalCopies: number;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    totalRequesters: 0,
    totalApprovers: 0,
    totalCopies: 0,
  });
  const [recentRequests, setRecentRequests] = useState<PrintRequest[]>([]);
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
          const [requestsResponse, requestersResponse, approversResponse] = await Promise.all([
            printRequestsAPI.getAll(),
            requestersAPI.getAll(),
            approversAPI.getAll(),
          ]);

          const requests = requestsResponse.data;
          const totalCopies = requests.reduce((sum, req) => sum + req.color_copies + req.bw_copies, 0);

          setStats({
            totalRequests: requests.length,
            totalRequesters: requestersResponse.data.length,
            totalApprovers: approversResponse.data.length,
            totalCopies,
          });

          // Son 5 isteği göster
          setRecentRequests(requests.slice(-5).reverse());
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
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Safa Kütüphane istek yönetim sistemine hoş geldiniz</p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam İstek</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                Toplam Fotokopi isteği sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Talep Edenler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequesters}</div>
              <p className="text-xs text-muted-foreground">
                Sistemdeki talep eden sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onaylayanlar</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApprovers}</div>
              <p className="text-xs text-muted-foreground">
                Sistemdeki onaylayan sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kopya</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCopies}</div>
              <p className="text-xs text-muted-foreground">
                Toplam kopya sayısı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Son İstekler */}
        <Card>
          <CardHeader>
            <CardTitle>Son İstekler</CardTitle>
            <CardDescription>
              En son oluşturulan Fotokopi istekleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {request.requester?.name || 'Bilinmeyen Talep Eden'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Onaylayan: {request.approver?.name || 'Bilinmeyen Onaylayan'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-sm sm:text-base">
                        {request.color_copies + request.bw_copies} kopya
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                Henüz Fotokopi isteği bulunmuyor
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar className="h-screen" />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="p-4 sm:p-6 flex-1">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
}