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
import { authorsAPI, PaginationInfo, SortParams, Author } from '@/lib/api';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import page from '../page';

const authorSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir'),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'id',
    sort_direction: 'desc'
  });

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchAuthors = async (page: number = currentPage, sort: SortParams = sortParams) => {
    try {
      const response = await authorsAPI.getAll(page, itemsPerPage, sort);
      setAuthors(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchAuthors(currentPage, sortParams);
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchAuthors(1, sortParams);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchAuthors(1, sortParams);
  }, [sortParams]);

  const onSubmit = async (data: AuthorFormValues) => {
    try {
      if (editingAuthor) {
        await authorsAPI.update(editingAuthor.id, data);
        toast.success('Yazar başarıyla güncellendi');
      } else {
        await authorsAPI.create(data);
        toast.success('Yazar başarıyla eklendi');
      }
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      setDialogOpen(false);
      setEditingAuthor(null);
      fetchAuthors();
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    form.reset({ name: author.name });
    setDialogOpen(true);
  };

  const handleDelete = async (author: Author) => {
    if (!confirm(`${author.name} yazarını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await authorsAPI.delete(author.id);
      toast.success('Yazar başarıyla silindi');
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      fetchAuthors();
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
  };

  const handleSortChange = (newSortParams: SortParams) => {
    setSortParams(newSortParams);
  };

  const handleNewAuthor = () => {
    setEditingAuthor(null);
    form.reset({ name: '' });
    setDialogOpen(true);
  };

  const columns: Column<Author>[] = [
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
          <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingAuthor(null); form.reset(); }}>
            İptal
          </Button>
          <Button type="submit">
            {editingAuthor ? 'Güncelle' : 'Ekle'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <DataTable
      data={authors}
      columns={columns}
      pagination={pagination || undefined}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={setItemsPerPage}
      sortParams={sortParams}
      onSortChange={handleSortChange}
      onAdd={handleNewAuthor}
      onEdit={handleEdit}
      onDelete={handleDelete}
      dialogOpen={dialogOpen}
      onDialogOpenChange={setDialogOpen}
      dialogTitle={editingAuthor ? 'Yazar Düzenle' : 'Yeni Yazar Ekle'}
      dialogDescription={editingAuthor
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
