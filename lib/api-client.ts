const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : 'https://enoughh-backend-production.up.railway.app')

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'user' | 'moderator'
  created_at: string
  updated_at: string
}

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

interface OrderCommunication {
  id: string
  order_id: string
  sender_id: string
  sender_type: 'customer' | 'admin' | 'system'
  message: string
  is_internal: boolean
  is_read: boolean
  read_at: string | null
  attachments: {
    files: string[]
    type: string
  } | null
  created_at: string
  updated_at: string
}

interface OrderCommunicationResponse {
  data: OrderCommunication[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UnreadCountResponse {
  count: number
}

export interface CreateOrderRequest {
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  shipping_info: {
    shipping_full_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_department: string;
    shipping_postal_code?: string;
    shipping_phone?: string;
    shipping_email?: string;
    shipping_document_type?: string;
    shipping_document_number?: string;
    shipping_neighborhood?: string;
    shipping_additional_info?: string;
  };
  notes?: string;
  status?: string;
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      console.log('Token cargado del localStorage:', this.token ? this.token.substring(0, 20) + '...' : 'No hay token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      console.log('Token guardado en localStorage:', token ? token.substring(0, 20) + '...' : 'Token vacío')
    }
  }


  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Método para recargar el token del localStorage
  reloadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      console.log('Token recargado del localStorage:', this.token ? this.token.substring(0, 20) + '...' : 'No hay token')
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Recargar token del localStorage en cada petición
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }

    // Agregar token de autenticación si existe
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
      console.log('Token enviado:', this.token ? this.token.substring(0, 20) + '...' : 'Token vacío')
    } else {
      console.log('No hay token disponible')
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        }
      }

      return {
        success: true,
        data: data.data || data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Métodos de autenticación
  async signUp(email: string, password: string, fullName: string) {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    })

    if (response.success && response.data) {
      this.setToken(response.data.access_token)
    }

    return response
  }

  async signIn(email: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      this.setToken(response.data.access_token)
    }

    return response
  }

  async signOut() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })

    this.clearToken()
    return response
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me')
  }

  async resetPassword(email: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // Métodos de perfil
  async updateProfile(updates: Partial<AuthResponse['user']>) {
    return this.request<AuthResponse['user']>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Métodos de productos
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    gender?: string
  }) {
    let endpoint = '/products'
    
    if (params) {
      const searchParams = new URLSearchParams()
      
      // Parámetros básicos
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.search) searchParams.append('search', params.search)
      if (params.gender) searchParams.append('gender', params.gender)
      
      // Parámetros de precio
      if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString())
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString())
      
      // Parámetros de categoría
      if (params.category) {
        endpoint = `/products/category/${params.category}`
      }
      
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }
    
    return this.request(endpoint)
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  // Métodos específicos para filtros de productos
  async getProductsByCategory(category: string, page: number = 1, limit: number = 20) {
    return this.request(`/products/category/${category}?page=${page}&limit=${limit}`)
  }

  async getProductsByGender(gender: string, page: number = 1, limit: number = 20) {
    return this.request(`/products/gender/${gender}?page=${page}&limit=${limit}`)
  }

  async getProductsByGenderWithSearch(gender: string, search: string, page: number = 1, limit: number = 20) {
    return this.request(`/products/gender/${gender}?search=${search}&page=${page}&limit=${limit}`)
  }

  async getProductsOnDiscount(page: number = 1, limit: number = 20) {
    return this.request(`/products/discount/on-sale?page=${page}&limit=${limit}`)
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number, page: number = 1, limit: number = 20) {
    return this.request(`/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&limit=${limit}`)
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadProductImages(files: File[]) {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    
    const url = `${this.baseURL}/products/upload-images`
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async updateProductImages(productId: string, imageUrls: string[]) {
    return this.request(`/products/${productId}/images`, {
      method: 'PATCH',
      body: JSON.stringify({ image_urls: imageUrls }),
    })
  }

  async deleteProductImage(productId: string, imageUrl: string) {
    return this.request(`/products/${productId}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ image_url: imageUrl }),
    })
  }

  async getCart() {
    return this.request('/cart')
  }

  async getCartTotal() {
    return this.request('/cart/total')
  }

  async addToCart(productId: string, quantity: number, size?: string) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, size }),
    })
  }

  async updateCartItem(id: string, quantity: number) {
    return this.request(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(id: string) {
    return this.request(`/cart/${id}`, {
      method: 'DELETE',
    })
  }

  async removeFromCartByProduct(productId: string, size: string) {
    return this.request(`/cart/${productId}/${size}`, {
      method: 'DELETE',
    })
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    })
  }

  // Métodos de órdenes
  async getOrders(page: number = 1, limit: number = 20) {
    return this.request(`/orders?page=${page}&limit=${limit}`)
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`)
  }

  async createOrder(orderData: CreateOrderRequest) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async updateOrderStatus(id: string, status: string, notes?: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
  }

  async completeOrder(id: string) {
    return this.request(`/orders/${id}/complete`, {
      method: 'POST',
    })
  }

  // Métodos de pagos
  async processPayment(paymentData: any) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  async verifyPayment(orderId: string) {
    return this.request(`/payments/verify?order_id=${orderId}`)
  }

  // Métodos de wishlist
  async getWishlist() {
    return this.request('/wishlist')
  }

  async addToWishlist(productId: string) {
    return this.request('/wishlist/products', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    })
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/wishlist/products/${productId}`, {
      method: 'DELETE',
    })
  }

  async shareWishlist() {
    return this.request('/wishlist', {
      method: 'GET',
    })
  }

  async getSharedWishlist(shareId: string) {
    return this.request(`/wishlist/public/${shareId}`)
  }

  async getAdminOrders(page: number = 1, limit: number = 20) {
    return this.request(`/orders/admin`)
  }

  async getAdminCustomers(page: number = 1, limit: number = 20) {
    return this.request(`/auth/admin/users?page=${page}&limit=${limit}`)
  }

  async getAdminProducts(page: number = 1, limit: number = 20) {
    return this.request(`/products?page=${page}&limit=${limit}`)
  }

  async getAdminAnalytics() {
    return this.request('/admin/analytics')
  }


  async addShippingTracking(orderId: string, trackingData: any) {
    return this.request(`/orders/${orderId}/tracking`, {
      method: 'POST',
      body: JSON.stringify(trackingData),
    })
  }

  async sendMessageToCustomer(orderId: string, message: string) {
    return this.request(`/admin/orders/${orderId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  async getAdminOrderCommunications(page: number = 1, limit: number = 20) {
    return this.request<OrderCommunicationResponse>(`/admin/order-communications?page=${page}&limit=${limit}`)
  }

  async getAdminOrderCommunicationsByOrder(orderId: string, page: number = 1, limit: number = 20) {
    return this.request<OrderCommunicationResponse>(`/admin/order-communications/order/${orderId}?page=${page}&limit=${limit}`)
  }

  async sendAdminOrderMessage(orderId: string, message: string, isInternal: boolean = false, attachments?: { files: string[], type: string }) {
    return this.request<OrderCommunication>(`/admin/order-communications/order/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        message,
        is_internal: isInternal,
        attachments
      }),
    })
  }

  async getAdminOrderStatusHistory(page: number = 1, limit: number = 20) {
    return this.request(`/admin/order-status-history?page=${page}&limit=${limit}`)
  }

  async getAdminOrderStatusHistoryByOrder(orderId: string, page: number = 1, limit: number = 20) {
    return this.request(`/admin/order-status-history/order/${orderId}?page=${page}&limit=${limit}`)
  }

  async createAdminOrderStatusHistory(orderId: string, status: string, previousStatus?: string, notes?: string) {
    return this.request(`/admin/order-status-history/order/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        previous_status: previousStatus,
        notes,
        updated_by_type: 'admin'
      }),
    })
  }

  async changeOrderStatusAdmin(orderId: string, status: string, notes?: string) {
    return this.request(`/admin/order-status-history/order/${orderId}/change-status`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        notes
      }),
    })
  }

  async updateOrderStatusAdmin(orderId: string, status: string, notes?: string) {
    return this.request(`/orders/admin/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
  }

  async getOrderTracking(orderId: string) {
    return this.request(`/orders/${orderId}/tracking`)
  }

  async getOrderHistory(orderId: string) {
    return this.request(`/orders/${orderId}/history`)
  }

  async getOrderStatusHistory(orderId: string, page: number = 1, limit: number = 20) {
    return this.request(`/orders/${orderId}/status-history?page=${page}&limit=${limit}`)
  }

  async getOrderStatusTimeline(orderId: string) {
    return this.request(`/orders/${orderId}/status-history/timeline`)
  }

  async getOrderCurrentStatus(orderId: string) {
    return this.request(`/orders/${orderId}/status-history/current`)
  }

  async getOrderStatusStatistics(orderId: string) {
    return this.request(`/orders/${orderId}/status-history/statistics`)
  }

  async getOrderStatusHistoryEntry(orderId: string, historyId: string) {
    return this.request(`/orders/${orderId}/status-history/${historyId}`)
  }

  async updateOrderStatusHistoryNotes(orderId: string, historyId: string, notes: string) {
    return this.request(`/orders/${orderId}/status-history/${historyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    })
  }

  async deleteOrderStatusHistoryEntry(orderId: string, historyId: string) {
    return this.request(`/orders/${orderId}/status-history/${historyId}`, {
      method: 'DELETE',
    })
  }


  async getOrderCommunications(orderId: string, page: number = 1, limit: number = 20) {
    return this.request<OrderCommunicationResponse>(`/orders/${orderId}/communications?page=${page}&limit=${limit}`)
  }

  async sendOrderMessage(orderId: string, message: string, isInternal: boolean = false, attachments?: { files: string[], type: string }) {
    return this.request<OrderCommunication>(`/orders/${orderId}/communications`, {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        message,
        is_internal: isInternal,
        attachments
      }),
    })
  }

  async getOrderCommunicationUnreadCount(orderId: string) {
    return this.request<UnreadCountResponse>(`/orders/${orderId}/communications/unread-count`)
  }


  async getOrderCommunicationById(orderId: string, messageId: string) {
    return this.request<OrderCommunication>(`/orders/${orderId}/communications/${messageId}`)
  }

  async updateOrderCommunication(orderId: string, messageId: string, updates: { message?: string, attachments?: { files: string[], type: string } }) {
    return this.request<OrderCommunication>(`/orders/${orderId}/communications/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }


  async deleteOrderCommunication(orderId: string, messageId: string) {
    return this.request(`/orders/${orderId}/communications/${messageId}`, {
      method: 'DELETE',
    })
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return !!this.token
  }

  // Obtener token actual
  getToken(): string | null {
    return this.token
  }
}

// Crear instancia singleton
export const apiClient = new ApiClient(API_BASE_URL)

// Exportar tipos
export type { 
  ApiResponse, 
  AuthResponse, 
  User, 
  OrderCommunication, 
  OrderCommunicationResponse, 
  UnreadCountResponse 
}

export type { 
  ProductImages,
  ImageUploadResponse,
  UpdateImagesRequest,
  DeleteImageRequest,
  mapProductImages,
  getMainImage,
  getAllImages
} from '@/components/types/Product'
