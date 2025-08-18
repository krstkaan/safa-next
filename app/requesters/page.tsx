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
import { DataTable, Column } from '@/components/ui/data-table';
import { requestersAPI, Requester, PaginationInfo, SortParams } from '@/lib/api';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const requesterSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir'),
});

type RequesterForm = z.infer<typeof requesterSchema>;

export default function RequestersPage() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequester, setEditingRequester] = useState<Requester | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'id',
    sort_direction: 'desc'
  });

  const form = useForm<RequesterForm>({
    resolver: zodResolver(requesterSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchRequesters = async (page: number = currentPage, sort: SortParams = sortParams) => {
    try {
      const response = await requestersAPI.getAll(page, itemsPerPage, sort);
      setRequesters(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequesters();
  }, []);

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchRequesters(currentPage, sortParams);
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchRequesters(1, sortParams);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchRequesters(1, sortParams);
  }, [sortParams]);

  const onSubmit = async (data: RequesterForm) => {
    try {
      if (editingRequester) {
        await requestersAPI.update(editingRequester.id, data);
        toast.success('Talep eden başarıyla güncellendi');
      } else {
        await requestersAPI.create(data);
        toast.success('Talep eden başarıyla oluşturuldu');
      }

      await fetchRequesters();
      setDialogOpen(false);
      setEditingRequester(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleEdit = (requester: Requester) => {
    setEditingRequester(requester);
    form.reset({
      name: requester.name,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (requester: Requester) => {
    if (confirm('Bu talep edeni silmek istediğinizden emin misiniz?')) {
      try {
        await requestersAPI.delete(requester.id);
        toast.success('Talep eden başarıyla silindi');
        await fetchRequesters();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Silme işlemi başarısız');
      }
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

  const handleNewRequester = () => {
    setEditingRequester(null);
    form.reset({
      name: '',
    });
    setDialogOpen(true);
  };

  const columns: Column<Requester>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      sortKey: 'id'
    },
    {
      key: 'name',
      label: 'İsim',
      sortable: true,
      sortKey: 'name'
    },
    {
      key: 'created_at',
      label: 'Oluşturulma Tarihi',
      sortable: true,
      sortKey: 'created_at',
      render: (value) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      key: 'actions',
      label: 'İşlemler',
    },
  ];

  const dialogContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
              setDialogOpen(false);
              setEditingRequester(null);
              form.reset();
            }}
          >
            İptal
          </Button>
          <Button type="submit">
            {editingRequester ? 'Güncelle' : 'Ekle'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <DataTable
      data={requesters}
      columns={columns}
      pagination={pagination || undefined}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={setItemsPerPage}
      sortParams={sortParams}
      onSortChange={handleSortChange}
      onAdd={handleNewRequester}
      onEdit={handleEdit}
      onDelete={handleDelete}
      dialogOpen={dialogOpen}
      onDialogOpenChange={setDialogOpen}
      dialogTitle={editingRequester ? 'Talep Eden Düzenle' : 'Yeni Talep Eden Ekle'}
      dialogDescription={editingRequester 
        ? 'Mevcut talep edenin bilgilerini düzenleyin.' 
        : 'Yeni bir talep eden ekleyin.'
      }
      dialogContent={dialogContent}
      addButtonText="Yeni Talep Eden"
      title="Talep Edenler"
      description="Fotokopi talebinde bulunan kişileri yönetin"
      loading={loading}
      emptyStateText="Henüz talep eden bulunmuyor"
    />
  );
}
