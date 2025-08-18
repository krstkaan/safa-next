'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// Generic types for the data table
export interface Column<T> {
  key: keyof T | 'actions' | string;
  label: string;
  sortable?: boolean;
  sortKey?: string; // Backend field name for sorting
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortParams {
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
}

export interface DataTableProps<T> {
  // Data and columns
  data: T[];
  columns: Column<T>[];
  
  // Pagination
  pagination?: PaginationInfo;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  
  // Sorting
  sortParams?: SortParams;
  onSortChange?: (sortParams: SortParams) => void;
  
  // CRUD Operations
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  
  // Dialog/Form
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  dialogTitle?: string;
  dialogDescription?: string;
  dialogContent?: React.ReactNode;
  addButtonText?: string;
  
  // Card props
  title: string;
  description?: string;
  
  // Loading state
  loading?: boolean;
  
  // Custom actions
  customActions?: (item: T) => React.ReactNode;
  
  // Empty state
  emptyStateText?: string;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  sortParams,
  onSortChange,
  onAdd,
  onEdit,
  onDelete,
  onView,
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogDescription,
  dialogContent,
  addButtonText = 'Yeni Ekle',
  title,
  description,
  loading = false,
  customActions,
  emptyStateText = 'Henüz veri bulunmuyor',
}: DataTableProps<T>) {
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return;
    
    const sortKey = column.sortKey || String(column.key);
    const isCurrentSort = sortParams?.sort_by === sortKey;
    const newDirection = isCurrentSort && sortParams?.sort_direction === 'asc' ? 'desc' : 'asc';
    
    onSortChange({
      sort_by: sortKey,
      sort_direction: newDirection,
    });
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const sortKey = column.sortKey || String(column.key);
    const isCurrentSort = sortParams?.sort_by === sortKey;
    
    if (!isCurrentSort) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    return sortParams?.sort_direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const renderActionButtons = (item: T) => {
    if (customActions) {
      return customActions(item);
    }

    return (
      <div className="flex space-x-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderCell = (column: Column<T>, item: T): React.ReactNode => {
    if (column.key === 'actions') {
      return renderActionButtons(item);
    }

    const value = item[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, item);
    }

    // Convert value to string if it's not already a ReactNode
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object' && !React.isValidElement(value)) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{title}</h1>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Items per page selector - only show if pagination exists */}
          {pagination && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sayfa başına:</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => onItemsPerPageChange(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Add button with dialog */}
          {onAdd && (
            <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>
                <Button onClick={onAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  {addButtonText}
                </Button>
              </DialogTrigger>
              {dialogContent && (
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                  </DialogHeader>
                  {dialogContent}
                </DialogContent>
              )}
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title} Listesi</CardTitle>
          <CardDescription>
            {pagination ? `Toplam ${pagination.total} kayıt` : `Tüm ${title.toLowerCase()} kayıtlarının listesi`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={String(column.key)}>
                          {column.sortable ? (
                            <Button
                              variant="ghost"
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                              onClick={() => handleSort(column)}
                            >
                              <span className="flex items-center gap-2">
                                {column.label}
                                {getSortIcon(column)}
                              </span>
                            </Button>
                          ) : (
                            column.label
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        {columns.map((column) => (
                          <TableCell 
                            key={String(column.key)}
                            className={column.key === 'actions' ? '' : (
                              column.key === columns[0].key ? 'font-medium' : ''
                            )}
                          >
                            {renderCell(column, item)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-gray-700">
                    <span>
                      Toplam <span className="font-medium">{pagination.total}</span> kayıttan{' '}
                      <span className="font-medium">
                        {((pagination.current_page - 1) * pagination.per_page) + 1}
                      </span>
                      -{' '}
                      <span className="font-medium">
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                      </span>{' '}
                      arası gösteriliyor
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Önceki
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                        let pageNumber;
                        if (pagination.total_pages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= pagination.total_pages - 2) {
                          pageNumber = pagination.total_pages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-10"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.has_next_page}
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {emptyStateText}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
