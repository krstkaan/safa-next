'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, Column } from '@/components/ui/data-table';
import { printRequestsAPI, requestersAPI, approversAPI, PrintRequest, Requester, Approver, PaginationInfo, SortParams } from '@/lib/api';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const requestSchema = z.object({
  requester_id: z.string().min(1, 'Talep eden seçilmelidir'),
  approver_id: z.string().min(1, 'Onaylayan seçilmelidir'),
  color_copies: z.string().min(1, 'Renkli kopya sayısı gereklidir'),
  bw_copies: z.string().min(1, 'Siyah-beyaz kopya sayısı gereklidir'),
  requested_at: z.string().min(1, 'İstek tarihi gereklidir'),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function PrintRequestsPage() {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrintRequest | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'id',
    sort_direction: 'desc'
  });

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requester_id: '',
      approver_id: '',
      color_copies: '',
      bw_copies: '',
      requested_at: new Date().toISOString().slice(0, 16),
    },
  });

  const fetchData = async (page: number = currentPage, sort: SortParams = sortParams) => {
    try {
      const [requestsResponse, requestersResponse, approversResponse] = await Promise.all([
        printRequestsAPI.getAll(page, itemsPerPage, sort),
        requestersAPI.getAllUnpaginated(),
        approversAPI.getAllUnpaginated(),
      ]);

      setRequests(requestsResponse.data);
      setPagination(requestsResponse.pagination);
      setRequesters(requestersResponse.data);
      setApprovers(approversResponse.data);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchData(currentPage, sortParams);
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData(1, sortParams);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData(1, sortParams);
  }, [sortParams]);

  const onSubmit = async (data: RequestForm) => {
    try {
      const requestData = {
        requester_id: Number(data.requester_id),
        approver_id: Number(data.approver_id),
        color_copies: Number(data.color_copies),
        bw_copies: Number(data.bw_copies),
        requested_at: data.requested_at,
      };

      if (editingRequest) {
        await printRequestsAPI.update(editingRequest.id, requestData);
        toast.success('İstek başarıyla güncellendi');
      } else {
        await printRequestsAPI.create(requestData);
        toast.success('İstek başarıyla oluşturuldu');
      }

      await fetchData();
      setDialogOpen(false);
      setEditingRequest(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
  };

  const handleSortChange = (newSortParams: SortParams) => {
    setSortParams(newSortParams);
    setLoading(true);
  };

  const handleEdit = (request: PrintRequest) => {
    setEditingRequest(request);
    form.reset({
      requester_id: request.requester_id.toString(),
      approver_id: request.approver_id.toString(),
      color_copies: request.color_copies.toString(),
      bw_copies: request.bw_copies.toString(),
      requested_at: new Date(request.requested_at).toISOString().slice(0, 16),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (request: PrintRequest) => {
    if (confirm('Bu isteği silmek istediğinizden emin misiniz?')) {
      try {
        await printRequestsAPI.delete(request.id);
        toast.success('İstek başarıyla silindi');
        await fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Silme işlemi başarısız');
      }
    }
  };

  const handleNewRequest = () => {
    setEditingRequest(null);
    form.reset({
      requester_id: '',
      approver_id: '',
      color_copies: '',
      bw_copies: '',
      requested_at: new Date().toISOString().slice(0, 16),
    });
    setDialogOpen(true);
  };

  // Define columns for the data table
  const columns: Column<PrintRequest>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      sortKey: 'id'
    },
    {
      key: 'requester_id',
      label: 'Talep Eden',
      sortable: true,
      sortKey: 'requester_id',
      render: (_, row) => row.requester?.name || 'Bilinmiyor'
    },
    {
      key: 'approver_id',
      label: 'Onaylayan',
      sortable: true,
      sortKey: 'approver_id',
      render: (_, row) => row.approver?.name || 'Bilinmiyor'
    },
    {
      key: 'color_copies',
      label: 'Renkli Kopya',
      sortable: true,
      sortKey: 'color_copies'
    },
    {
      key: 'bw_copies',
      label: 'S/B Kopya',
      sortable: true,
      sortKey: 'bw_copies'
    },
    {
      key: 'total_copies',
      label: 'Toplam',
      render: (_, row) => (
        <span className="font-medium">
          {row.color_copies + row.bw_copies}
        </span>
      )
    },
    {
      key: 'requested_at',
      label: 'İstek Tarihi',
      sortable: true,
      sortKey: 'requested_at',
      render: (value) => new Date(value).toLocaleDateString('tr-TR')
    },
    {
      key: 'created_at',
      label: 'Oluşturulma Tarihi',
      sortable: true,
      sortKey: 'created_at',
      render: (value) => new Date(value).toLocaleDateString('tr-TR')
    },
    {
      key: 'actions',
      label: 'İşlemler',
    },
  ];

  // Form content for the dialog
  const dialogContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="requester_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Talep Eden</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Talep eden seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {requesters.map((requester) => (
                    <SelectItem key={requester.id} value={requester.id.toString()}>
                      {requester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Onaylayan seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {approvers.map((approver) => (
                    <SelectItem key={approver.id} value={approver.id.toString()}>
                      {approver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setDialogOpen(false);
              setEditingRequest(null);
              form.reset();
            }}
          >
            İptal
          </Button>
          <Button type="submit">
            {editingRequest ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Form>
  );

  // Custom actions for the table
  const customActions = (request: PrintRequest) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(request)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(request)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
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
      dialogTitle={editingRequest ? 'İstek Düzenle' : 'Yeni İstek Oluştur'}
      dialogDescription={
        editingRequest 
          ? 'Mevcut isteği düzenleyin.' 
          : 'Yeni bir Fotokopi isteği oluşturun.'
      }
      dialogContent={dialogContent}
      addButtonText="Yeni İstek"
      title="Fotokopi İstekleri"
      description="Tüm Fotokopi isteklerini yönetin"
      loading={loading}
      customActions={customActions}
      emptyStateText="Henüz Fotokopi isteği bulunmuyor"
    />
  );
}
