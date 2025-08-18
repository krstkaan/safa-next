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
import { approversAPI, Approver } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

  const form = useForm<ApproverForm>({
    resolver: zodResolver(approverSchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchApprovers = async () => {
    try {
      const response = await approversAPI.getAll();
      setApprovers(response.data);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovers();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (confirm('Bu onaylayanı silmek istediğinizden emin misiniz?')) {
      try {
        await approversAPI.delete(id);
        toast.success('Onaylayan başarıyla silindi');
        await fetchApprovers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Silme işlemi başarısız');
      }
    }
  };

  const handleNewApprover = () => {
    setEditingApprover(null);
    form.reset({
      name: '',
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Onaylayanlar</h1>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Onaylayanlar</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Fotokopi isteklerini onaylayan kişileri yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewApprover}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Onaylayan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingApprover ? 'Onaylayan Düzenle' : 'Yeni Onaylayan Ekle'}
              </DialogTitle>
              <DialogDescription>
                {editingApprover 
                  ? 'Mevcut onaylayanın bilgilerini düzenleyin.' 
                  : 'Yeni bir onaylayan ekleyin.'
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
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onaylayanlar Listesi</CardTitle>
          <CardDescription>
            Fotokopi isteklerini onaylayan kişilerin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvers.length > 0 ? (
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
                  {approvers.map((approver) => (
                    <TableRow key={approver.id}>
                      <TableCell className="font-medium">
                        {approver.id}
                      </TableCell>
                      <TableCell>
                        {approver.name}
                      </TableCell>
                      <TableCell>
                        {new Date(approver.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(approver)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(approver.id)}
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
              Henüz onaylayan bulunmuyor
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
