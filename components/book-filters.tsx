"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X, Filter } from "lucide-react";
import type {
  BookFilters as ImportedFilters,
  Author,
  Publisher,
  BookLevel,
} from "@/lib/api";

// Extended filters interface to include all properties used in component
interface BookFilters extends ImportedFilters {
  author_id?: number;
  publisher_id?: number;
  level?: BookLevel;
  name?: string;
  is_donation?: boolean;
  with_relations?: boolean;
}

interface BookFiltersProps {
  filters: BookFilters;
  onFiltersChange: (filters: BookFilters) => void;
  authors: Author[];
  publishers: Publisher[];
  onSearchAuthors: (query: string) => void;
  onSearchPublishers: (query: string) => void;
  authorSearchLoading: boolean;
  publisherSearchLoading: boolean;
}

export function BookFilters({
  filters,
  onFiltersChange,
  authors,
  publishers,
  onSearchAuthors,
  onSearchPublishers,
  authorSearchLoading,
  publisherSearchLoading,
}: BookFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = <K extends keyof BookFilters>(
    key: K,
    value: BookFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({ with_relations: true });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "with_relations") return false;
    return (
      value !== undefined && value !== null && value !== "" && value !== false
    );
  });

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtreler
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Aktif
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Author Filter */}
              <div className="space-y-2">
                <Label>Yazar</Label>
                <SearchableSelect
                  value={filters.author_id?.toString() || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "author_id",
                      value === "all" ? undefined : Number(value)
                    )
                  }
                  placeholder="Yazar seçiniz"
                  searchPlaceholder="Yazar ara... (3+ karakter)"
                  emptyText="Yazar bulunamadı"
                  options={[
                    { value: "all", label: "Tümü" },
                    ...authors.map((author) => ({
                      value: author.id.toString(),
                      label: author.name,
                    })),
                  ]}
                  onSearch={onSearchAuthors}
                  loading={authorSearchLoading}
                />
              </div>

              {/* Publisher Filter */}
              <div className="space-y-2">
                <Label>Yayınevi</Label>
                <SearchableSelect
                  value={filters.publisher_id?.toString() || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "publisher_id",
                      value === "all" ? undefined : Number(value)
                    )
                  }
                  placeholder="Yayınevi seçiniz"
                  searchPlaceholder="Yayınevi ara... (3+ karakter)"
                  emptyText="Yayınevi bulunamadı"
                  options={[
                    { value: "all", label: "Tümü" },
                    ...publishers.map((publisher) => ({
                      value: publisher.id.toString(),
                      label: publisher.name,
                    })),
                  ]}
                  onSearch={onSearchPublishers}
                  loading={publisherSearchLoading}
                />
              </div>

              {/* Book Name Filter */}
              <div className="space-y-2">
                <Label>Kitap Adı</Label>
                <Input
                  placeholder="Kitap adı ara..."
                  value={filters.name || ""}
                  onChange={(e) =>
                    handleFilterChange("name", e.target.value || undefined)
                  }
                />
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <Label>Kademe</Label>
                <Select
                  value={filters.level || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "level",
                      value === "all" ? undefined : (value as BookLevel)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kademe seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="ilkokul">İlkokul</SelectItem>
                    <SelectItem value="ortaokul">Ortaokul</SelectItem>
                    <SelectItem value="ortak">Ortak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Donation Filter */}
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox
                id="is_donation_filter"
                checked={filters.is_donation || false}
                onCheckedChange={(checked) =>
                  handleFilterChange("is_donation", Boolean(checked))
                }
              />
              <Label htmlFor="is_donation_filter">Sadece Bağış Kitapları</Label>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
