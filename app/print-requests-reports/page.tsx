"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { printRequestsAPI } from "@/lib/api"
import { FileSpreadsheet, Calendar, Download, Loader2, BarChart3, Database } from "lucide-react"
import { toast } from "sonner"

export default function PrintRequestsReports() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const [firstStartDate, setFirstStartDate] = useState("")
  const [firstEndDate, setFirstEndDate] = useState("")
  const [secondStartDate, setSecondStartDate] = useState("")
  const [secondEndDate, setSecondEndDate] = useState("")
  const [isDownloadingComparison, setIsDownloadingComparison] = useState(false)
  const [isExportingAll, setIsExportingAll] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setStartDate(firstDay.toISOString().split("T")[0])
    setEndDate(lastDay.toISOString().split("T")[0])

    const previousMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthLast = new Date(now.getFullYear(), now.getMonth(), 0)

    setFirstStartDate(previousMonthFirst.toISOString().split("T")[0])
    setFirstEndDate(previousMonthLast.toISOString().split("T")[0])
    setSecondStartDate(firstDay.toISOString().split("T")[0])
    setSecondEndDate(lastDay.toISOString().split("T")[0])
  }, [])

  const downloadReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Lütfen başlangıç ve bitiş tarihlerini seçin")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Başlangıç tarihi bitiş tarihinden sonra olamaz")
      return
    }

    setIsDownloading(true)
    try {
      await printRequestsAPI.getReport(startDate, endDate)
      toast.success("Rapor başarıyla indirildi")
    } catch (error) {
      console.error("Rapor indirme hatası:", error)
      toast.error("Rapor indirilirken bir hata oluştu")
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadComparisonReport = async () => {
    if (!firstStartDate || !firstEndDate || !secondStartDate || !secondEndDate) {
      toast.error("Lütfen tüm tarih alanlarını doldurun")
      return
    }

    if (new Date(firstStartDate) > new Date(firstEndDate)) {
      toast.error("İlk dönem başlangıç tarihi bitiş tarihinden sonra olamaz")
      return
    }

    if (new Date(secondStartDate) > new Date(secondEndDate)) {
      toast.error("İkinci dönem başlangıç tarihi bitiş tarihinden sonra olamaz")
      return
    }

    setIsDownloadingComparison(true)
    try {
      await printRequestsAPI.getComparisonReport(firstStartDate, firstEndDate, secondStartDate, secondEndDate)
      toast.success("Karşılaştırma raporu başarıyla indirildi")
    } catch (error) {
      console.error("Karşılaştırma raporu indirme hatası:", error)
      toast.error("Karşılaştırma raporu indirilirken bir hata oluştu")
    } finally {
      setIsDownloadingComparison(false)
    }
  }

  const exportAllRequests = async () => {
    setIsExportingAll(true)
    try {
      await printRequestsAPI.exportAllRequests()
      toast.success("Tüm fotokopi talepleri başarıyla indirildi")
    } catch (error) {
      console.error("Tüm talepleri dışa aktarma hatası:", error)
      toast.error("Tüm talepleri dışa aktarırken bir hata oluştu")
    } finally {
      setIsExportingAll(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 sm:p-6 flex-1">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fotokopi İstek Raporları</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Tarih aralığına göre talep eden bazında fotokopi raporları oluşturun
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Talep Eden Bazında Rapor
                </CardTitle>
                <CardDescription>
                  Belirtilen tarih aralığında her talep edenin toplam kopya sayılarını Excel formatında indirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Başlangıç Tarihi
                    </Label>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Bitiş Tarihi
                    </Label>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex justify-start">
                  <Button
                    onClick={downloadReport}
                    disabled={isDownloading || !startDate || !endDate}
                    className="flex items-center gap-2"
                  >
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {isDownloading ? "İndiriliyor..." : "Raporu İndir"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dönem Karşılaştırma Raporu
                </CardTitle>
                <CardDescription>
                  İki farklı dönemin fotokopi taleplerini karşılaştırın ve Excel formatında indirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">İlk Dönem</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-start-date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Başlangıç Tarihi
                        </Label>
                        <input
                          id="first-start-date"
                          type="date"
                          value={firstStartDate}
                          onChange={(e) => setFirstStartDate(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="first-end-date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Bitiş Tarihi
                        </Label>
                        <input
                          id="first-end-date"
                          type="date"
                          value={firstEndDate}
                          onChange={(e) => setFirstEndDate(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">İkinci Dönem</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="second-start-date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Başlangıç Tarihi
                        </Label>
                        <input
                          id="second-start-date"
                          type="date"
                          value={secondStartDate}
                          onChange={(e) => setSecondStartDate(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="second-end-date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Bitiş Tarihi
                        </Label>
                        <input
                          id="second-end-date"
                          type="date"
                          value={secondEndDate}
                          onChange={(e) => setSecondEndDate(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start">
                  <Button
                    onClick={downloadComparisonReport}
                    disabled={
                      isDownloadingComparison || !firstStartDate || !firstEndDate || !secondStartDate || !secondEndDate
                    }
                    className="flex items-center gap-2"
                  >
                    {isDownloadingComparison ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloadingComparison ? "İndiriliyor..." : "Karşılaştırma Raporu İndir"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Tüm Talepleri Dışa Aktar
                </CardTitle>
                <CardDescription>
                  Sistemdeki tüm fotokopi taleplerini Excel formatında indirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Bu işlem sistemdeki tüm fotokopi taleplerini tek bir Excel dosyasında indirecektir. 
                    Büyük veri setleri için işlem biraz zaman alabilir.
                  </p>
                </div>

                <div className="flex justify-start">
                  <Button
                    onClick={exportAllRequests}
                    disabled={isExportingAll}
                    className="flex items-center gap-2"
                  >
                    {isExportingAll ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isExportingAll ? "Dışa Aktarılıyor..." : "Tüm Talepleri Dışa Aktar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
