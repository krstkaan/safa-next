'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requestersAPI, Requester } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

  const form = useForm<RequesterForm>({
    resolver: zodResolver(requesterSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchRequesters = async () => {
    try {
      const response = await requestersAPI.getAll();
      setRequesters(response.data);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequesters();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (confirm('Bu talep edeni silmek istediğinizden emin misiniz?')) {
      try {
        await requestersAPI.delete(id);
        toast.success('Talep eden başarıyla silindi');
        await fetchRequesters();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Silme işlemi başarısız');
      }
    }
  };

  const handleNewRequester = () => {
    setEditingRequester(null);
    form.reset({
      name: '',
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Talep Edenler</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Talep Edenler</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Fotokopi talebinde bulunan kişileri yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewRequester}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Talep Eden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRequester ? 'Talep Eden Düzenle' : 'Yeni Talep Eden Ekle'}
              </DialogTitle>
              <DialogDescription>
                {editingRequester 
                  ? 'Mevcut talep edenin bilgilerini düzenleyin.' 
                  : 'Yeni bir talep eden ekleyin.'
                }
              </DialogDescription>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talep Edenler Listesi</CardTitle>
          <CardDescription>
            Fotokopi talebinde bulunan kişilerin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requesters.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Oluşturulma Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requesters.map((requester) => (
                    <TableRow key={requester.id}>
                      <TableCell className="font-medium">
                        {requester.id}
                      </TableCell>
                      <TableCell>
                        {requester.name}
                      </TableCell>
                      <TableCell>
                        {new Date(requester.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(requester)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(requester.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Henüz talep eden bulunmuyor
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
