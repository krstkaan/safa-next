'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(z.object({
      name: z.string().min(1, 'İsim gereklidir'),
      email: z.string().email('Geçerli bir email adresi giriniz'),
      password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
      password_confirmation: z.string().min(6, 'Şifre onayı gereklidir'),
    }).refine(data => data.password === data.password_confirmation, {
      message: 'Şifreler eşleşmiyor',
      path: ['password_confirmation'],
    })),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Başarıyla giriş yapıldı!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: any) => {
    setIsLoading(true);
    try {
      await register(data.name, data.email, data.password, data.password_confirmation);
      toast.success('Başarıyla kayıt olundu!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Safa Kütüphane Sistemi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister ? 'Hesap oluşturun' : 'Hesabınıza giriş yapın'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</CardTitle>
            <CardDescription>
              {isRegister 
                ? 'Yeni hesap oluşturmak için bilgilerinizi giriniz'
                : 'Email ve şifrenizi girerek giriş yapın'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRegister ? (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İsim</FormLabel>
                        <FormControl>
                          <Input placeholder="İsminizi giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email adresinizi giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Şifrenizi giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre Onayı</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Şifrenizi tekrar giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email adresinizi giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Şifrenizi giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm"
              >
                {isRegister 
                  ? 'Zaten hesabınız var mı? Giriş yapın' 
                  : 'Hesabınız yok mu? Kayıt olun'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
