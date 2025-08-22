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
import { approversAPI, Approver, PaginationInfo, SortParams } from '@/lib/api';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const approverSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir'),
});

type ApproverForm = z.infer<typeof approverSchema>;

export default function ApproversPage() {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApprover, setEditingApprover] = useState<Approver | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'id',
    sort_direction: 'desc'
  });

  const form = useForm<ApproverForm>({
    resolver: zodResolver(approverSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchApprovers = async (page: number = currentPage, sort: SortParams = sortParams) => {
    try {
      const response = await approversAPI.getAll(page, itemsPerPage, sort);
      setApprovers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovers();
  }, []);

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchApprovers(currentPage, sortParams);
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchApprovers(1, sortParams);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchApprovers(1, sortParams);
  }, [sortParams]);

  const onSubmit = async (data: ApproverForm) => {
    try {
      if (editingApprover) {
        await approversAPI.update(editingApprover.id, data);
        toast.success('Onaylayan başarıyla güncellendi');
      } else {
        await approversAPI.create(data);
        toast.success('Onaylayan başarıyla oluşturuldu');
      }

      await fetchApprovers();
      setDialogOpen(false);
      setEditingApprover(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleEdit = (approver: Approver) => {
    setEditingApprover(approver);
    form.reset({
      name: approver.name,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (approver: Approver) => {
    if (confirm('Bu onaylayanı silmek istediğinizden emin misiniz?')) {
      try {
        await approversAPI.delete(approver.id);
        toast.success('Onaylayan başarıyla silindi');
        await fetchApprovers();
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

  const handleNewApprover = () => {
    setEditingApprover(null);
    form.reset({
      name: '',
    });
    setDialogOpen(true);
  };

  const columns: Column<Approver>[] = [
    // {
    //   key: 'id',
    //   label: 'ID',
    //   sortable: true,
    //   sortKey: 'id'
    // },
    {
      key: 'name',
      label: 'İsim',
      sortable: true,
      sortKey: 'name'
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
              setDialogOpen(false);
              setEditingApprover(null);
              form.reset();
            }}
          >
            İptal
          </Button>
          <Button type="submit">
            {editingApprover ? 'Güncelle' : 'Ekle'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <DataTable
      data={approvers}
      columns={columns}
      pagination={pagination || undefined}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={setItemsPerPage}
      sortParams={sortParams}
      onSortChange={handleSortChange}
      onAdd={handleNewApprover}
      onEdit={handleEdit}
      onDelete={handleDelete}
      dialogOpen={dialogOpen}
      onDialogOpenChange={setDialogOpen}
      dialogTitle={editingApprover ? 'Onaylayan Düzenle' : 'Yeni Onaylayan Ekle'}
      dialogDescription={editingApprover 
        ? 'Mevcut onaylayanın bilgilerini düzenleyin.' 
        : 'Yeni bir onaylayan ekleyin.'
      }
      dialogContent={dialogContent}
      addButtonText="Yeni Onaylayan"
      title="Onaylayanlar"
      description="Fotokopi isteklerini onaylayan kişileri yönetin"
      loading={loading}
      emptyStateText="Henüz onaylayan bulunmuyor"
    />
  );
}
