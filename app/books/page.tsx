"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Edit, Trash2, Plus, BookOpen, Users, Building } from "lucide-react";
import { BookFilters } from "@/components/book-filters"; // Fixed import name
import {
  booksAPI,
  authorsAPI,
  publishersAPI,
  gradesAPI,
  type Book as BookType,
  type Author,
  type Publisher,
  type Grade,
  type BookFilters as BookFiltersType,
  type SortParams,
  type PaginationInfo,
} from "@/lib/api";

const bookSchema = z.object({
  name: z.string().min(1, "Kitap adı gereklidir"),
  language: z.string().optional(),
  page_count: z.string().optional(),
  is_donation: z.boolean(),
  barcode: z.string().optional(),
  shelf_code: z.string().optional(),
  fixture_no: z.string().optional(),
  author_id: z.string().min(1, "Yazar seçilmelidir"),
  publisher_id: z.string().min(1, "Yayınevi seçilmelidir"),
  grade_ids: z.array(z.number()).optional(),
});

const authorSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
});

const publisherSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
});

type BookForm = z.infer<typeof bookSchema>;
type AuthorForm = z.infer<typeof authorSchema>;
type PublisherForm = z.infer<typeof publisherSchema>;

export default function BooksPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [publisherDialogOpen, setPublisherDialogOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: "created_at",
    sort_direction: "desc",
  });
  const [authorSearchLoading, setAuthorSearchLoading] = useState(false);
  const [publisherSearchLoading, setPublisherSearchLoading] = useState(false);
  const [filters, setFilters] = useState<BookFiltersType>({
    with_relations: true,
  });

  const form = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      name: "",
      language: "Türkçe",
      page_count: "",
      is_donation: false,
      barcode: "",
      shelf_code: "",
      fixture_no: "",
      author_id: "", // Changed to empty string to trigger validation
      publisher_id: "", // Changed to empty string to trigger validation
      grade_ids: [],
    },
  });

  const authorForm = useForm<AuthorForm>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: "",
    },
  });

  const publisherForm = useForm<PublisherForm>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchData = async (
    page: number = currentPage,
    sort: SortParams = sortParams,
    currentFilters: BookFiltersType = filters
  ) => {
    try {
      const [
        booksResponse,
        authorsResponse,
        publishersResponse,
        gradesResponse,
      ] = await Promise.all([
        booksAPI.getAll(page, itemsPerPage, sort, currentFilters),
        authorsAPI.getAllUnpaginated(),
        publishersAPI.getAllUnpaginated(),
        gradesAPI.getAllUnpaginated(),
      ]);

      setBooks(booksResponse.data);
      setPagination(booksResponse.pagination);
      setAuthors(authorsResponse.data);
      setPublishers(publishersResponse.data);
      setGrades(gradesResponse.data);
    } catch (error) {
      toast.error("Veri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentPage > 1 || pagination) {
      fetchData(currentPage, sortParams, filters);
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData(1, sortParams, filters);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData(1, sortParams, filters);
  }, [sortParams]);

  useEffect(() => {
    setCurrentPage(1);
    setLoading(true);
    fetchData(1, sortParams, filters);
  }, [filters]);

  const onSubmit = async (data: BookForm) => {
    try {
      const bookData = {
        name: data.name,
        language: data.language || undefined,
        page_count: data.page_count
          ? Number.parseInt(data.page_count)
          : undefined,
        is_donation: data.is_donation,
        barcode: data.barcode || undefined,
        shelf_code: data.shelf_code || undefined,
        fixture_no: data.fixture_no || undefined,
        author_id: Number.parseInt(data.author_id),
        publisher_id: Number.parseInt(data.publisher_id),
        grade_ids:
          data.grade_ids && data.grade_ids.length > 0
            ? data.grade_ids
            : undefined,
      };

      if (editingBook) {
        await booksAPI.update(editingBook.id, bookData);
        toast.success("Kitap başarıyla güncellendi");
      } else {
        await booksAPI.create(bookData);
        toast.success("Kitap başarıyla eklendi");
      }

      await fetchData();
      setDialogOpen(false);
      setEditingBook(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu");
    }
  };

  const onSubmitAuthor = async (data: AuthorForm) => {
    try {
      const response = await authorsAPI.create(data);
      const newAuthor = response.data;
      toast.success("Yazar başarıyla oluşturuldu");
      setAuthors((prev) => [...prev, newAuthor]);
      form.setValue("author_id", newAuthor.id.toString());
      setAuthorDialogOpen(false);
      authorForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu");
    }
  };

  const onSubmitPublisher = async (data: PublisherForm) => {
    try {
      const response = await publishersAPI.create(data);
      const newPublisher = response.data;
      toast.success("Yayınevi başarıyla oluşturuldu");
      setPublishers((prev) => [...prev, newPublisher]);
      form.setValue("publisher_id", newPublisher.id.toString());
      setPublisherDialogOpen(false);
      publisherForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu");
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

  const handleEdit = (book: BookType) => {
    setEditingBook(book);
    form.reset({
      name: book.name,
      language: book.language || "",
      page_count: book.page_count?.toString() || "",
      is_donation: book.is_donation,
      barcode: book.barcode || "",
      shelf_code: book.shelf_code || "",
      fixture_no: book.fixture_no || "",
      author_id: book.author_id.toString(),
      publisher_id: book.publisher_id.toString(),
      grade_ids: book.grades?.map((g) => g.id) || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (book: BookType) => {
    if (confirm("Bu kitabı silmek istediğinizden emin misiniz?")) {
      try {
        await booksAPI.delete(book.id);
        toast.success("Kitap başarıyla silindi");
        await fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Silme işlemi başarısız");
      }
    }
  };

  const handleNewBook = () => {
    setEditingBook(null);
    form.reset({
      name: "",
      language: "Türkçe",
      page_count: "",
      is_donation: false,
      barcode: "",
      shelf_code: "",
      fixture_no: "",
      author_id: "", // Empty string for validation
      publisher_id: "", // Empty string for validation
      grade_ids: [],
    });
    setDialogOpen(true);
  };

  const handleGradeToggle = (gradeId: number) => {
    const currentGrades = form.getValues("grade_ids") || [];
    const newGrades = currentGrades.includes(gradeId)
      ? currentGrades.filter((id) => id !== gradeId)
      : [...currentGrades, gradeId];
    form.setValue("grade_ids", newGrades);
  };

  const handleGradeGroupToggle = (gradeGroup: "ilkokul" | "ortaokul") => {
    const ilkokulIds = [1, 2, 3, 4];
    const ortaokulIds = [5, 6, 7, 8];
    const currentGrades = form.getValues("grade_ids") || [];

    if (gradeGroup === "ilkokul") {
      const hasAllIlkokul = ilkokulIds.every((id) =>
        currentGrades.includes(id)
      );
      if (hasAllIlkokul) {
        // Tüm ilkokul sınıflarını kaldır
        const newGrades = currentGrades.filter(
          (id) => !ilkokulIds.includes(id)
        );
        form.setValue("grade_ids", newGrades, { shouldValidate: true });
      } else {
        // Tüm ilkokul sınıflarını ekle (ortaokul sınıfları varsa onları koru)
        const withoutIlkokul = currentGrades.filter(
          (id) => !ilkokulIds.includes(id)
        );
        const newGrades = [...withoutIlkokul, ...ilkokulIds];
        form.setValue("grade_ids", newGrades, { shouldValidate: true });
      }
    } else {
      const hasAllOrtaokul = ortaokulIds.every((id) =>
        currentGrades.includes(id)
      );
      if (hasAllOrtaokul) {
        // Tüm ortaokul sınıflarını kaldır
        const newGrades = currentGrades.filter(
          (id) => !ortaokulIds.includes(id)
        );
        form.setValue("grade_ids", newGrades, { shouldValidate: true });
      } else {
        // Tüm ortaokul sınıflarını ekle (ilkokul sınıfları varsa onları koru)
        const withoutOrtaokul = currentGrades.filter(
          (id) => !ortaokulIds.includes(id)
        );
        const newGrades = [...withoutOrtaokul, ...ortaokulIds];
        form.setValue("grade_ids", newGrades, { shouldValidate: true });
      }
    }
  };

  const getGradeGroupText = (gradeIds: number[]) => {
    const ilkokulIds = [1, 2, 3, 4];
    const ortaokulIds = [5, 6, 7, 8];

    const hasIlkokul = gradeIds.some((id) => ilkokulIds.includes(id));
    const hasOrtaokul = gradeIds.some((id) => ortaokulIds.includes(id));

    if (hasIlkokul && hasOrtaokul) {
      return "İlkokul, Ortaokul";
    } else if (hasIlkokul) {
      return "İlkokul";
    } else if (hasOrtaokul) {
      return "Ortaokul";
    }
    return "-";
  };

  const columns: Column<BookType>[] = [
    {
      key: "name",
      label: "Kitap Adı",
      sortable: true,
      sortKey: "name",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <div>
            <div className="font-medium">{row.name}</div>
            {row.page_count && (
              <div className="text-sm text-gray-500">
                {row.page_count} sayfa
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "author_id",
      label: "Yazar",
      sortable: true,
      sortKey: "author_id",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span>{row.author?.name || "Bilinmiyor"}</span>
        </div>
      ),
    },
    {
      key: "publisher_id",
      label: "Yayınevi",
      sortable: true,
      sortKey: "publisher_id",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-blue-500" />
          <span>{row.publisher?.name || "Bilinmiyor"}</span>
        </div>
      ),
    },
    {
      key: "language",
      label: "Dil",
      render: (value) => value || "-",
    },
    {
      key: "grades",
      label: "Sınıflar",
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.grades && row.grades.length > 0 ? (
            <Badge variant="outline" className="text-xs">
              {getGradeGroupText(row.grades.map((g) => g.id))}
            </Badge>
          ) : (
            <span className="text-gray-500 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: "details",
      label: "Detaylar",
      render: (_, row) => (
        <div className="text-sm space-y-1">
          {row.barcode && (
            <div className="text-gray-600">Barkod: {row.barcode}</div>
          )}
          {row.shelf_code && (
            <div className="text-gray-600">Raf: {row.shelf_code}</div>
          )}
          {row.fixture_no && (
            <div className="text-gray-600">Demirbaş: {row.fixture_no}</div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "İşlemler",
    },
  ];

  const searchAuthorsForFilter = async (query: string) => {
    if (query.length < 3) return;
    setAuthorSearchLoading(true);
    try {
      const response = await authorsAPI.getAllUnpaginated(query);
      setAuthors(response.data);
    } catch (error) {
      console.error("Error searching authors:", error);
    } finally {
      setAuthorSearchLoading(false);
    }
  };

  const searchPublishersForFilter = async (query: string) => {
    if (query.length < 3) return;
    setPublisherSearchLoading(true);
    try {
      const response = await publishersAPI.getAllUnpaginated(query);
      setPublishers(response.data);
    } catch (error) {
      console.error("Error searching publishers:", error);
    } finally {
      setPublisherSearchLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: BookFiltersType) => {
    setFilters(newFilters);
  };

  const dialogContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kitap Adı *</FormLabel>
                <FormControl>
                  <Input placeholder="Kitap adını giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dil</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Dil seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Türkçe">Türkçe</SelectItem>
                    <SelectItem value="İngilizce">İngilizce</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="page_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sayfa Sayısı</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="author_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yazar *</FormLabel>
                <div className="flex gap-2">
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Yazar seçiniz"
                    searchPlaceholder="Yazar ara... (3+ karakter)"
                    emptyText="Yazar bulunamadı"
                    options={authors.map((author) => ({
                      value: author.id.toString(),
                      label: author.name,
                    }))}
                    onSearch={searchAuthorsForFilter}
                    loading={authorSearchLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setAuthorDialogOpen(true)}
                    title="Yeni yazar ekle"
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
            name="publisher_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yayınevi *</FormLabel>
                <div className="flex gap-2">
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Yayınevi seçiniz"
                    searchPlaceholder="Yayınevi ara... (3+ karakter)"
                    emptyText="Yayınevi bulunamadı"
                    options={publishers.map((publisher) => ({
                      value: publisher.id.toString(),
                      label: publisher.name,
                    }))}
                    onSearch={searchPublishersForFilter}
                    loading={publisherSearchLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPublisherDialogOpen(true)}
                    title="Yeni yayınevi ekle"
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
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barkod</FormLabel>
                <FormControl>
                  <Input placeholder="Barkod numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shelf_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raf Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="Raf kodu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fixture_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demirbaş No</FormLabel>
                <FormControl>
                  <Input placeholder="Demirbaş numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_donation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Bağış Kitabı</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div>
          <Label>Sınıflar</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <FormField
              control={form.control}
              name="grade_ids"
              render={({ field }) => {
                const currentGrades = field.value || [];
                const ilkokulIds = [1, 2, 3, 4];
                const ortaokulIds = [5, 6, 7, 8];

                return (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ilkokul"
                        checked={ilkokulIds.every((id) =>
                          currentGrades.includes(id)
                        )}
                        onCheckedChange={() =>
                          handleGradeGroupToggle("ilkokul")
                        }
                      />
                      <Label htmlFor="ilkokul" className="cursor-pointer">
                        İlkokul (1-4. Sınıf)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ortaokul"
                        checked={ortaokulIds.every((id) =>
                          currentGrades.includes(id)
                        )}
                        onCheckedChange={() =>
                          handleGradeGroupToggle("ortaokul")
                        }
                      />
                      <Label htmlFor="ortaokul" className="cursor-pointer">
                        Ortaokul (5-8. Sınıf)
                      </Label>
                    </div>
                  </>
                );
              }}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDialogOpen(false);
              setEditingBook(null);
              form.reset();
            }}
          >
            İptal
          </Button>
          <Button type="submit">{editingBook ? "Güncelle" : "Oluştur"}</Button>
        </div>
      </form>
    </Form>
  );

  const customActions = (book: BookType) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(book)}
        style={{ color: "#2563eb", borderColor: "#2563eb" }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(book)}
        style={{ color: "#dc2626", borderColor: "#dc2626" }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <BookFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        authors={authors}
        publishers={publishers}
        grades={grades}
        onSearchAuthors={searchAuthorsForFilter}
        onSearchPublishers={searchPublishersForFilter}
        authorSearchLoading={authorSearchLoading}
        publisherSearchLoading={publisherSearchLoading}
      />

      <DataTable
        data={books}
        columns={columns}
        pagination={pagination || undefined}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={setItemsPerPage}
        sortParams={sortParams}
        onSortChange={handleSortChange}
        onAdd={handleNewBook}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        dialogTitle={editingBook ? "Kitap Düzenle" : "Yeni Kitap Oluştur"}
        dialogDescription={
          editingBook
            ? "Mevcut kitabı düzenleyin."
            : "Yeni bir kitap oluşturun."
        }
        dialogContent={dialogContent}
        addButtonText="Yeni Kitap"
        title="Kitaplar"
        description="Kütüphane kitap koleksiyonu yönetim sistemi"
        loading={loading}
        customActions={customActions}
        emptyStateText="Henüz kitap bulunmuyor"
      />

      <Dialog open={authorDialogOpen} onOpenChange={setAuthorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Yazar Ekle</DialogTitle>
            <DialogDescription>Yeni bir yazar ekleyin.</DialogDescription>
          </DialogHeader>
          <Form {...authorForm}>
            <form
              onSubmit={authorForm.handleSubmit(onSubmitAuthor)}
              className="space-y-4"
            >
              <FormField
                control={authorForm.control}
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
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAuthorDialogOpen(false);
                    authorForm.reset();
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

      <Dialog open={publisherDialogOpen} onOpenChange={setPublisherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Yayınevi Ekle</DialogTitle>
            <DialogDescription>Yeni bir yayınevi ekleyin.</DialogDescription>
          </DialogHeader>
          <Form {...publisherForm}>
            <form
              onSubmit={publisherForm.handleSubmit(onSubmitPublisher)}
              className="space-y-4"
            >
              <FormField
                control={publisherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input placeholder="Yayınevi ismini giriniz" {...field} />
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
                    setPublisherDialogOpen(false);
                    publisherForm.reset();
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
  );
}
