"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ChevronDown, X, Filter } from "lucide-react"
import type { PrintRequestFilters as Filters, Requester, Approver } from "@/lib/api"

interface PrintRequestFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  requesters: Requester[]
  approvers: Approver[]
  onSearchRequesters: (query: string) => void
  onSearchApprovers: (query: string) => void
  requesterSearchLoading: boolean
  approverSearchLoading: boolean
}

export function PrintRequestFilters({
  filters,
  onFiltersChange,
  requesters,
  approvers,
  onSearchRequesters,
  onSearchApprovers,
  requesterSearchLoading,
  approverSearchLoading,
}: PrintRequestFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== null && value !== "")

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
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Aktif</span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Requester Names Filter */}
              <div className="space-y-2">
                <Label>Talep Eden</Label>
                <SearchableSelect
                  value={filters.requester_names || ""}
                  onValueChange={(value) => handleFilterChange("requester_names", value)}
                  placeholder="Talep eden seçiniz"
                  searchPlaceholder="Talep eden ara... (3+ karakter)"
                  emptyText="Talep eden bulunamadı"
                  options={requesters.map((requester) => ({
                    value: requester.name,
                    label: requester.name,
                  }))}
                  onSearch={onSearchRequesters}
                  loading={requesterSearchLoading}
                />
              </div>

              {/* Approver Names Filter */}
              <div className="space-y-2">
                <Label>Onaylayan</Label>
                <SearchableSelect
                  value={filters.approver_names || ""}
                  onValueChange={(value) => handleFilterChange("approver_names", value)}
                  placeholder="Onaylayan seçiniz"
                  searchPlaceholder="Onaylayan ara... (3+ karakter)"
                  emptyText="Onaylayan bulunamadı"
                  options={approvers.map((approver) => ({
                    value: approver.name,
                    label: approver.name,
                  }))}
                  onSearch={onSearchApprovers}
                  loading={approverSearchLoading}
                />
              </div>

              {/* Description Filter */}
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  placeholder="Açıklama ara..."
                  value={filters.description || ""}
                  onChange={(e) => handleFilterChange("description", e.target.value)}
                />
              </div>

              {/* Color Copies Range */}
              <div className="space-y-2">
                <Label>Renkli Kopya (Min)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Min değer"
                  value={filters.color_copies_min || ""}
                  onChange={(e) =>
                    handleFilterChange("color_copies_min", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Renkli Kopya (Max)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max değer"
                  value={filters.color_copies_max || ""}
                  onChange={(e) =>
                    handleFilterChange("color_copies_max", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              {/* BW Copies Range */}
              <div className="space-y-2">
                <Label>S/B Kopya (Min)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Min değer"
                  value={filters.bw_copies_min || ""}
                  onChange={(e) =>
                    handleFilterChange("bw_copies_min", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>S/B Kopya (Max)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max değer"
                  value={filters.bw_copies_max || ""}
                  onChange={(e) =>
                    handleFilterChange("bw_copies_max", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>İstek Tarihi (Başlangıç)</Label>
                <Input
                  type="date"
                  value={filters.requested_at_from || ""}
                  onChange={(e) => handleFilterChange("requested_at_from", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>İstek Tarihi (Bitiş)</Label>
                <Input
                  type="date"
                  value={filters.requested_at_to || ""}
                  onChange={(e) => handleFilterChange("requested_at_to", e.target.value)}
                />
              </div>
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
  )
}
