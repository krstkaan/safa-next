'use client';

import { use, useEffect, useState } from 'react';
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
import { publishersAPI, PaginationInfo, SortParams, Publisher } from '@/lib/api';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import page from '../page';

const publisherSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir'),
});

type PublisherFormValues = z.infer<typeof publisherSchema>;

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'id',
    sort_direction: 'desc'
  });

  const form = useForm<PublisherFormValues>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchPublishers = async (page: number = currentPage, sort: SortParams = sortParams) => {
    try {
      const response = await publishersAPI.getAll(page, itemsPerPage, sort);
      setPublishers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchPublishers(currentPage, sortParams);
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPublishers(1, sortParams);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPublishers(1, sortParams);
  }, [sortParams]);

  const onSubmit = async (data: PublisherFormValues) => {
    try {
      if (editingPublisher) {
        await publishersAPI.update(editingPublisher.id, data);
        toast.success('Yazar başarıyla güncellendi');
      } else {
        await publishersAPI.create(data);
        toast.success('Yazar başarıyla eklendi');
      }
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      setDialogOpen(false);
      setEditingPublisher(null);
      fetchPublishers();
    }
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    form.reset({ name: publisher.name });
    setDialogOpen(true);
  };

  const handleDelete = async (publisher: Publisher) => {
    if (!confirm(`${publisher.name} yazarını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await publishersAPI.delete(publisher.id);
      toast.success('Yazar başarıyla silindi');
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      fetchPublishers();
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
  };

  const handleSortChange = (newSortParams: SortParams) => {
    setSortParams(newSortParams);
  };

  const handleNewPublisher = () => {
    setEditingPublisher(null);
    form.reset({ name: '' });
    setDialogOpen(true);
  };

  const columns: Column<Publisher>[] = [
    {
      key: 'name',
      label: 'İsim',
    },
    {
      key: 'actions',
      label: 'Aksiyonlar',
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
                <Input placeholder="Yazar ismini giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end space-x-2'>
          <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingPublisher(null); form.reset(); }}>
            İptal
          </Button>
          <Button type="submit">
            {editingPublisher ? 'Güncelle' : 'Ekle'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <DataTable
      data={publishers}
      columns={columns}
      pagination={pagination || undefined}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={setItemsPerPage}
      sortParams={sortParams}
      onSortChange={handleSortChange}
      onAdd={handleNewPublisher}
      onEdit={handleEdit}
      onDelete={handleDelete}
      dialogOpen={dialogOpen}
      onDialogOpenChange={setDialogOpen}
      dialogTitle={editingPublisher ? 'Yazar Düzenle' : 'Yeni Yazar Ekle'}
      dialogDescription={editingPublisher
        ? 'Mevcut yazarın bilgilerini düzenleyin.'
        : 'Yeni bir yazar ekleyin.'
      }
      dialogContent={dialogContent}
      addButtonText="Yeni Yazar"
      title="Yazarlar"
      description="Fotokopi talebinde bulunan kişileri yönetin"
      loading={loading}
      emptyStateText="Henüz yazar bulunmuyor"
    />
  );
}
