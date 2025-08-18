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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { printRequestsAPI, requestersAPI, approversAPI, PrintRequest, Requester, Approver } from '@/lib/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
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

  const fetchData = async () => {
    try {
      const [requestsResponse, requestersResponse, approversResponse] = await Promise.all([
        printRequestsAPI.getAll(),
        requestersAPI.getAll(),
        approversAPI.getAll(),
      ]);

      setRequests(requestsResponse.data);
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

  const handleDelete = async (id: number) => {
    if (confirm('Bu isteği silmek istediğinizden emin misiniz?')) {
      try {
        await printRequestsAPI.delete(id);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Fotokopi İstekleri</h1>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fotokopi İstekleri</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Tüm Fotokopi isteklerini yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewRequest}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni İstek
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'İstek Düzenle' : 'Yeni İstek Oluştur'}
              </DialogTitle>
              <DialogDescription>
                {editingRequest 
                  ? 'Mevcut isteği düzenleyin.' 
                  : 'Yeni bir Fotokopi isteği oluşturun.'
                }
              </DialogDescription>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İstekler Listesi</CardTitle>
          <CardDescription>
            Tüm Fotokopi isteklerinin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talep Eden</TableHead>
                    <TableHead>Onaylayan</TableHead>
                    <TableHead>Renkli Kopya</TableHead>
                    <TableHead>S/B Kopya</TableHead>
                    <TableHead>Toplam</TableHead>
                    <TableHead>İstek Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.requester?.name || 'Bilinmiyor'}
                      </TableCell>
                      <TableCell>
                        {request.approver?.name || 'Bilinmiyor'}
                      </TableCell>
                      <TableCell>{request.color_copies}</TableCell>
                      <TableCell>{request.bw_copies}</TableCell>
                      <TableCell className="font-medium">
                        {request.color_copies + request.bw_copies}
                      </TableCell>
                      <TableCell>
                        {new Date(request.requested_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
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
                            onClick={() => handleDelete(request.id)}
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
              Henüz Fotokopi isteği bulunmuyor
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
