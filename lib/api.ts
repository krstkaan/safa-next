import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types
export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Requester {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Approver {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface PrintRequest {
  id: number
  requester_id: number
  approver_id: number
  color_copies: number
  bw_copies: number
  requested_at: string
  description?: string
  created_at: string
  updated_at: string
  requester?: Requester
  approver?: Approver
}

export interface ApiResponse<T> {
  status: string
  data: T
  message: string
}

export interface PaginationInfo {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next_page: boolean
}

export interface PaginatedApiResponse<T> {
  status: string
  data: T[]
  message: string
  pagination: PaginationInfo
}

export interface ApiError {
  status: string
  message: string
  errors?: any
}

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>("/login", {
      email,
      password,
    })
    return response.data
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>("/register", {
      name,
      email,
      password,
      password_confirmation,
    })
    return response.data
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>("/logout")
    return response.data
  },

  getUser: async () => {
    const response = await api.get<ApiResponse<User>>("/user")
    return response.data
  },
}

// Sort types
export interface SortParams {
  sort_by?: string
  sort_direction?: "asc" | "desc"
}

// Filter parameters interface for print requests
export interface PrintRequestFilters {
  requester_names?: string
  approver_names?: string
  color_copies_min?: number
  color_copies_max?: number
  bw_copies_min?: number
  bw_copies_max?: number
  requested_at_from?: string
  requested_at_to?: string
  description?: string
}

// Print Requests APIs
export const printRequestsAPI = {
  getAll: async (page = 1, limit = 10, sortParams?: SortParams, filters?: PrintRequestFilters) => {
    let url = `/print-requests?page=${page}&limit=${limit}`
    if (sortParams?.sort_by) {
      url += `&sort_by=${sortParams.sort_by}&sort_direction=${sortParams.sort_direction || "asc"}`
    }

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url += `&${key}=${encodeURIComponent(value)}`
        }
      })
    }

    const response = await api.get<PaginatedApiResponse<PrintRequest>>(url)
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<PrintRequest>>(`/print-requests/${id}`)
    return response.data
  },

  create: async (data: Omit<PrintRequest, "id" | "created_at" | "updated_at" | "requester" | "approver">) => {
    const response = await api.post<ApiResponse<PrintRequest>>("/print-requests", data)
    return response.data
  },

  update: async (
    id: number,
    data: Omit<PrintRequest, "id" | "created_at" | "updated_at" | "requester" | "approver">,
  ) => {
    const response = await api.put<ApiResponse<PrintRequest>>(`/print-requests/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/print-requests/${id}`)
    return response.data
  },

  getReport: async (start_date: string, end_date: string) => {
    const response = await api.get(
      `/print-requests/export/by-requester?start_date=${start_date}&end_date=${end_date}`,
      {
        responseType: 'blob', // Excel dosyası için blob response
      }
    )
    
    // Backend'den gelen dosya adını header'dan al (eğer varsa), yoksa varsayılan ad oluştur
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
    let fileName = `fotokopi_raporu_${start_date}_${end_date}.xlsx`
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/) || 
                           contentDisposition.match(/filename\*=UTF-8''(.+)/)
      if (fileNameMatch) {
        fileName = decodeURIComponent(fileNameMatch[1])
      }
    }
    
    // Blob'u indirilebilir dosya olarak işle
    const url = window.URL.createObjectURL(new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return response.data
  },

  getComparisonReport: async (
    first_start_date: string, 
    first_end_date: string, 
    second_start_date: string, 
    second_end_date: string
  ) => {
    const response = await api.get(
      `/print-requests/export/comparison?first_start_date=${first_start_date}&first_end_date=${first_end_date}&second_start_date=${second_start_date}&second_end_date=${second_end_date}`,
      {
        responseType: 'blob', // Excel dosyası için blob response
      }
    )
    
    // Backend'den gelen dosya adını header'dan al (eğer varsa), yoksa varsayılan ad oluştur
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
    let fileName = `fotokopi_karsilastirma_raporu_${first_start_date}_${first_end_date}_vs_${second_start_date}_${second_end_date}.xlsx`
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/) || 
                           contentDisposition.match(/filename\*=UTF-8''(.+)/)
      if (fileNameMatch) {
        fileName = decodeURIComponent(fileNameMatch[1])
      }
    }
    
    // Blob'u indirilebilir dosya olarak işle
    const url = window.URL.createObjectURL(new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return response.data
  }
}

// Requesters APIs
export const requestersAPI = {
  getAll: async (page = 1, limit = 10, sortParams?: SortParams, search?: string) => {
    let url = `/requesters?page=${page}&limit=${limit}`
    if (sortParams?.sort_by) {
      url += `&sort_by=${sortParams.sort_by}&sort_direction=${sortParams.sort_direction || "asc"}`
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    const response = await api.get<PaginatedApiResponse<Requester>>(url)
    return response.data
  },

  getAllUnpaginated: async (search?: string) => {
    let url = "/requesters"
    if (search) {
      url += `?search=${encodeURIComponent(search)}`
    }
    const response = await api.get<ApiResponse<Requester[]>>(url)
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Requester>>(`/requesters/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Requester>>("/requesters", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Requester>>(`/requesters/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/requesters/${id}`)
    return response.data
  },
}

// Approvers APIs
export const approversAPI = {
  getAll: async (page = 1, limit = 10, sortParams?: SortParams, search?: string) => {
    let url = `/approvers?page=${page}&limit=${limit}`
    if (sortParams?.sort_by) {
      url += `&sort_by=${sortParams.sort_by}&sort_direction=${sortParams.sort_direction || "asc"}`
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    const response = await api.get<PaginatedApiResponse<Approver>>(url)
    return response.data
  },

  getAllUnpaginated: async (search?: string) => {
    let url = "/approvers"
    if (search) {
      url += `?search=${encodeURIComponent(search)}`
    }
    const response = await api.get<ApiResponse<Approver[]>>(url)
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Approver>>(`/approvers/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Approver>>("/approvers", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Approver>>(`/approvers/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/approvers/${id}`)
    return response.data
  },
}

// Book-related interfaces
export interface Author {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Publisher {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export type BookLevel = "ilkokul" | "ortaokul" | "ortak"

export interface Book {
  id: number
  name: string
  type?: string
  language?: string
  page_count?: number
  is_donation: boolean
  barcode?: string
  shelf_code?: string
  fixture_no?: string
  author_id: number
  publisher_id: number
  level: BookLevel
  created_at: string
  updated_at: string
  deleted_at?: string
  author?: Author
  publisher?: Publisher
}

// Book filter parameters
export interface BookFilters {
  search?: string
  author_id?: number
  publisher_id?: number
  level?: BookLevel
  is_donation?: boolean
  with_relations?: boolean
}

// Authors APIs
export const authorsAPI = {
  getAll: async (page = 1, limit = 10, sortParams?: SortParams, search?: string) => {
    let url = `/authors?page=${page}&limit=${limit}`
    if (sortParams?.sort_by) {
      url += `&sort_by=${sortParams.sort_by}&sort_direction=${sortParams.sort_direction || "asc"}`
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    const response = await api.get<PaginatedApiResponse<Author>>(url)
    return response.data
  },

  getAllUnpaginated: async (search?: string) => {
    let url = "/authors"
    if (search) {
      url += `?search=${encodeURIComponent(search)}`
    }
    const response = await api.get<ApiResponse<Author[]>>(url)
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Author>>(`/authors/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Author>>("/authors", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Author>>(`/authors/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/authors/${id}`)
    return response.data
  },
}

// Publishers APIs
export const publishersAPI = {
  getAll: async (page = 1, limit = 10, sortParams?: SortParams, search?: string) => {
    let url = `/publishers?page=${page}&limit=${limit}`
    if (sortParams?.sort_by) {
      url += `&sort_by=${sortParams.sort_by}&sort_direction=${sortParams.sort_direction || "asc"}`
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }
    const response = await api.get<PaginatedApiResponse<Publisher>>(url)
    return response.data
  },

  getAllUnpaginated: async (search?: string) => {
    let url = "/publishers"
    if (search) {
      url += `?search=${encodeURIComponent(search)}`
    }
    const response = await api.get<ApiResponse<Publisher[]>>(url)
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Publisher>>(`/publishers/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Publisher>>("/publishers", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Publisher>>(`/publishers/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/publishers/${id}`)
    return response.data
  },
}

// Books APIs
export const booksAPI = {
  getAll: async (page = 1, limit = 10, sortParams?: SortParams, filters?: BookFilters) => {
    let url = `/books?page=${page}&limit=${limit}`
    if (sortParams?.sort_by) {
      url += `&sort_by=${sortParams.sort_by}&sort_direction=${sortParams.sort_direction || "asc"}`
    }

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url += `&${key}=${encodeURIComponent(value)}`
        }
      })
    }

    const response = await api.get<PaginatedApiResponse<Book>>(url)
    return response.data
  },

  getAllUnpaginated: async (filters?: BookFilters) => {
    let url = "/books"
    
    if (filters) {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    const response = await api.get<ApiResponse<Book[]>>(url)
    return response.data
  },

  getById: async (id: number, withRelations = false) => {
    let url = `/books/${id}`
    if (withRelations) {
      url += "?with_relations=true"
    }
    const response = await api.get<ApiResponse<Book>>(url)
    return response.data
  },

  create: async (data: {
    name: string
    type?: string
    language?: string
    page_count?: number
    is_donation: boolean
    barcode?: string
    shelf_code?: string
    fixture_no?: string
    author_id: number
    publisher_id: number
    level: BookLevel
  }) => {
    const response = await api.post<ApiResponse<Book>>("/books", data)
    return response.data
  },

  update: async (id: number, data: {
    name: string
    type?: string
    language?: string
    page_count?: number
    is_donation: boolean
    barcode?: string
    shelf_code?: string
    fixture_no?: string
    author_id: number
    publisher_id: number
    level: BookLevel
  }) => {
    const response = await api.put<ApiResponse<Book>>(`/books/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/books/${id}`)
    return response.data
  },
}