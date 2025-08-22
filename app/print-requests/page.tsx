"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable, type Column } from "@/components/ui/data-table"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { PrintRequestFilters } from "@/components/print-request-filters"
import {
  printRequestsAPI,
  requestersAPI,
  approversAPI,
  type PrintRequest,
  type Requester,
  type Approver,
  type PaginationInfo,
  type SortParams,
  type PrintRequestFilters as FilterType,
} from "@/lib/api"
import { Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

const requestSchema = z
  .object({
    requester_id: z.string().min(1, "Talep eden seçilmelidir"),
    approver_id: z.string().min(1, "Onaylayan seçilmelidir"),
    color_copies: z.string().optional(),
    bw_copies: z.string().optional(),
    requested_at: z.string().min(1, "İstek tarihi gereklidir"),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const colorCopies = data.color_copies?.trim() || "0"
      const bwCopies = data.bw_copies?.trim() || "0"
      return Number.parseInt(colorCopies) > 0 || Number.parseInt(bwCopies) > 0
    },
    {
      message: "En az bir kopya türü için sayı girilmelidir",
      path: ["color_copies"], // Show error on color_copies field
    },
  )

const requesterSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
})

const approverSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
})

type RequestForm = z.infer<typeof requestSchema>
type RequesterForm = z.infer<typeof requesterSchema>
type ApproverForm = z.infer<typeof approverSchema>

export default function PrintRequestsPage() {
  const [requests, setRequests] = useState<PrintRequest[]>([])
  const [requesters, setRequesters] = useState<Requester[]>([])
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<PrintRequest | null>(null)
  const [requesterDialogOpen, setRequesterDialogOpen] = useState(false)
  const [approverDialogOpen, setApproverDialogOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: "id",
    sort_direction: "desc",
  })
  const [requesterSearchLoading, setRequesterSearchLoading] = useState(false)
  const [approverSearchLoading, setApproverSearchLoading] = useState(false)
  const [filters, setFilters] = useState<FilterType>({})

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requester_id: "",
      approver_id: "",
      color_copies: "",
      bw_copies: "",
      requested_at: new Date().toISOString().slice(0, 16),
      description: "",
    },
  })

  const requesterForm = useForm<RequesterForm>({
    resolver: zodResolver(requesterSchema),
    defaultValues: {
      name: "",
    },
  })

  const approverForm = useForm<ApproverForm>({
    resolver: zodResolver(approverSchema),
    defaultValues: {
      name: "",
    },
  })

  const fetchData = async (
    page: number = currentPage,
    sort: SortParams = sortParams,
    currentFilters: FilterType = filters,
  ) => {
    try {
      const [requestsResponse, requestersResponse, approversResponse] = await Promise.all([
        printRequestsAPI.getAll(page, itemsPerPage, sort, currentFilters),
        requestersAPI.getAllUnpaginated(),
        approversAPI.getAllUnpaginated(),
      ])

      setRequests(requestsResponse.data)
      setPagination(requestsResponse.pagination)
      setRequesters(requestersResponse.data)
      setApprovers(approversResponse.data)
    } catch (error) {
      toast.error("Veri yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchData(currentPage, sortParams, filters)
    }
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
    fetchData(1, sortParams, filters)
  }, [itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
    fetchData(1, sortParams, filters)
  }, [sortParams])

  useEffect(() => {
    setCurrentPage(1)
    setLoading(true)
    fetchData(1, sortParams, filters)
  }, [filters])

  const onSubmit = async (data: RequestForm) => {
    try {
      const requestData = {
        requester_id: Number(data.requester_id),
        approver_id: Number(data.approver_id),
        color_copies: Number(data.color_copies?.trim() || "0"),
        bw_copies: Number(data.bw_copies?.trim() || "0"),
        requested_at: data.requested_at,
        description: data.description,
      }

      if (editingRequest) {
        await printRequestsAPI.update(editingRequest.id, requestData)
        toast.success("İstek başarıyla güncellendi")
      } else {
        await printRequestsAPI.create(requestData)
        toast.success("İstek başarıyla oluşturuldu")
      }

      await fetchData()
      setDialogOpen(false)
      setEditingRequest(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu")
    }
  }

  const onSubmitRequester = async (data: RequesterForm) => {
    try {
      const response = await requestersAPI.create(data)
      const newRequester = response.data
      toast.success("Talep eden başarıyla oluşturuldu")
      setRequesters((prev) => [...prev, newRequester])
      form.setValue("requester_id", newRequester.id.toString())
      setRequesterDialogOpen(false)
      requesterForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu")
    }
  }

  const onSubmitApprover = async (data: ApproverForm) => {
    try {
      const response = await approversAPI.create(data)
      const newApprover = response.data
      toast.success("Onaylayan başarıyla oluşturuldu")
      setApprovers((prev) => [...prev, newApprover])
      form.setValue("approver_id", newApprover.id.toString())
      setApproverDialogOpen(false)
      approverForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu")
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setLoading(true)
  }

  const handleSortChange = (newSortParams: SortParams) => {
    setSortParams(newSortParams)
    setLoading(true)
  }

  const handleEdit = (request: PrintRequest) => {
    setEditingRequest(request)
    form.reset({
      requester_id: request.requester_id.toString(),
      approver_id: request.approver_id.toString(),
      color_copies: request.color_copies.toString(),
      bw_copies: request.bw_copies.toString(),
      requested_at: new Date(request.requested_at).toISOString().slice(0, 16),
      description: request.description || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (request: PrintRequest) => {
    if (confirm("Bu isteği silmek istediğinizden emin misiniz?")) {
      try {
        await printRequestsAPI.delete(request.id)
        toast.success("İstek başarıyla silindi")
        await fetchData()
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Silme işlemi başarısız")
      }
    }
  }

  const handleNewRequest = () => {
    setEditingRequest(null)
    form.reset({
      requester_id: "",
      approver_id: "",
      color_copies: "",
      bw_copies: "",
      requested_at: new Date().toISOString().slice(0, 16),
      description: "",
    })
    setDialogOpen(true)
  }

  const columns: Column<PrintRequest>[] = [
    // {
    //   key: "id",
    //   label: "ID",
    //   sortable: true,
    //   sortKey: "id",
    // },
    {
      key: "requester_id",
      label: "Talep Eden",
      sortable: true,
      sortKey: "requester_id",
      render: (_, row) => row.requester?.name || "Bilinmiyor",
    },
    {
      key: "approver_id",
      label: "Onaylayan",
      sortable: true,
      sortKey: "approver_id",
      render: (_, row) => row.approver?.name || "Bilinmiyor",
    },
    {
      key: "color_copies",
      label: "Renkli Kopya",
      sortable: true,
      sortKey: "color_copies",
    },
    {
      key: "bw_copies",
      label: "S/B Kopya",
      sortable: true,
      sortKey: "bw_copies",
    },
    {
      key: "description",
      label: "Açıklama",
      render: (value) => value || "-",
    },
    {
      key: "total_copies",
      label: "Toplam",
      render: (_, row) => <span className="font-medium">{row.color_copies + row.bw_copies}</span>,
    },
    {
      key: "requested_at",
      label: "İstek Tarihi",
      sortable: true,
      sortKey: "requested_at",
      render: (value) => new Date(value).toLocaleDateString("tr-TR"),
    },
    {
      key: "actions",
      label: "İşlemler",
    },
  ]

  const searchRequesters = async (query: string) => {
    setRequesterSearchLoading(true)
    try {
      const response = await requestersAPI.getAllUnpaginated(query)
      setRequesters(response.data)
    } catch (error) {
      console.error("Error searching requesters:", error)
    } finally {
      setRequesterSearchLoading(false)
    }
  }

  const searchApprovers = async (query: string) => {
    setApproverSearchLoading(true)
    try {
      const response = await approversAPI.getAllUnpaginated(query)
      setApprovers(response.data)
    } catch (error) {
      console.error("Error searching approvers:", error)
    } finally {
      setApproverSearchLoading(false)
    }
  }

  const searchRequestersForFilter = async (query: string) => {
    setRequesterSearchLoading(true)
    try {
      const response = await requestersAPI.getAllUnpaginated(query)
      setRequesters(response.data)
    } catch (error) {
      console.error("Error searching requesters:", error)
    } finally {
      setRequesterSearchLoading(false)
    }
  }

  const searchApproversForFilter = async (query: string) => {
    setApproverSearchLoading(true)
    try {
      const response = await approversAPI.getAllUnpaginated(query)
      setApprovers(response.data)
    } catch (error) {
      console.error("Error searching approvers:", error)
    } finally {
      setApproverSearchLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters)
  }

  const dialogContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="requester_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Talep Eden</FormLabel>
              <div className="flex gap-2">
                <SearchableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Talep eden seçiniz"
                  searchPlaceholder="Talep eden ara... (3+ karakter)"
                  emptyText="Talep eden bulunamadı"
                  options={requesters.map((requester) => ({
                    value: requester.id.toString(),
                    label: requester.name,
                  }))}
                  onSearch={searchRequesters}
                  loading={requesterSearchLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setRequesterDialogOpen(true)}
                  title="Yeni talep eden ekle"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approver_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Onaylayan</FormLabel>
              <div className="flex gap-2">
                <SearchableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Onaylayan seçiniz"
                  searchPlaceholder="Onaylayan ara... (3+ karakter)"
                  emptyText="Onaylayan bulunamadı"
                  options={approvers.map((approver) => ({
                    value: approver.id.toString(),
                    label: approver.name,
                  }))}
                  onSearch={searchApprovers}
                  loading={approverSearchLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setApproverDialogOpen(true)}
                  title="Yeni onaylayan ekle"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color_copies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renkli Kopya Sayısı</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bw_copies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Siyah-Beyaz Kopya Sayısı</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requested_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İstek Tarihi</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama (Opsiyonel)</FormLabel>
              <FormControl>
                <Input placeholder="İstek açıklaması..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setEditingRequest(null)
              form.reset()
            }}
          >
            İptal
          </Button>
          <Button type="submit">{editingRequest ? "Güncelle" : "Oluştur"}</Button>
        </div>
      </form>
    </Form>
  )

  const customActions = (request: PrintRequest) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(request)}
        style={{ color: "#2563eb", borderColor: "#2563eb" }} // blue
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(request)}
        style={{ color: "#dc2626", borderColor: "#dc2626" }} // red
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <>
      <PrintRequestFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        requesters={requesters}
        approvers={approvers}
        onSearchRequesters={searchRequestersForFilter}
        onSearchApprovers={searchApproversForFilter}
        requesterSearchLoading={requesterSearchLoading}
        approverSearchLoading={approverSearchLoading}
      />

      <DataTable
        data={requests}
        columns={columns}
        pagination={pagination || undefined}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={setItemsPerPage}
        sortParams={sortParams}
        onSortChange={handleSortChange}
        onAdd={handleNewRequest}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        dialogTitle={editingRequest ? "İstek Düzenle" : "Yeni İstek Oluştur"}
        dialogDescription={editingRequest ? "Mevcut isteği düzenleyin." : "Yeni bir Fotokopi isteği oluşturun."}
        dialogContent={dialogContent}
        addButtonText="Yeni İstek"
        title="Fotokopi İstekleri"
        description="Tüm Fotokopi isteklerini yönetin"
        loading={loading}
        customActions={customActions}
        emptyStateText="Henüz Fotokopi isteği bulunmuyor"
      />

      <Dialog open={requesterDialogOpen} onOpenChange={setRequesterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Talep Eden Ekle</DialogTitle>
            <DialogDescription>Yeni bir talep eden kişi ekleyin.</DialogDescription>
          </DialogHeader>
          <Form {...requesterForm}>
            <form onSubmit={requesterForm.handleSubmit(onSubmitRequester)} className="space-y-4">
              <FormField
                control={requesterForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input placeholder="Talep eden kişinin ismini giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRequesterDialogOpen(false)
                    requesterForm.reset()
                  }}
                >
                  İptal
                </Button>
                <Button type="submit">Ekle</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Onaylayan Ekle</DialogTitle>
            <DialogDescription>Yeni bir onaylayan kişi ekleyin.</DialogDescription>
          </DialogHeader>
          <Form {...approverForm}>
            <form onSubmit={approverForm.handleSubmit(onSubmitApprover)} className="space-y-4">
              <FormField
                control={approverForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input placeholder="Onaylayan kişinin ismini giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setApproverDialogOpen(false)
                    approverForm.reset()
                  }}
                >
                  İptal
                </Button>
                <Button type="submit">Ekle</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
