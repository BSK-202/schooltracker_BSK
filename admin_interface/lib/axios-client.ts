import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from '@/hooks/use-toast'

// Types pour les réponses API standardisées
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  meta?: {
    total?: number
    page?: number
    perPage?: number
    [key: string]: any
  }
  error?: {
    code: string
    message: string
    details?: any
  }
  errors?: Record<string, string[]>
}

// Interface pour les erreurs API
export interface ApiError {
  code: string
  message: string
  details?: any
  status?: number
}

class ApiClient {
  private axiosInstance: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request Interceptor - Ajout du token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAuthToken()
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Pour les FormData, on enlève le Content-Type
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response Interceptor - Gestion des erreurs
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Si l'API retourne success: false, on la traite comme une erreur
        if (response.data && response.data.success === false) {
          return Promise.reject(this.createApiError(response.data))
        }
        return response
      },
      (error) => {
        return this.handleError(error)
      }
    )
  }

  private getAuthToken(): string | null {
    // Récupérer depuis localStorage (adaptable à cookies si besoin)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private createApiError(responseData: ApiResponse): ApiError {
    return {
      code: responseData.error?.code || 'UNKNOWN_ERROR',
      message: responseData.error?.message || 'Une erreur est survenue',
      details: responseData.error?.details || responseData.errors,
    }
  }

  private async handleError(error: any): Promise<never> {
    // Log de l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error)
    }

    let apiError: ApiError = {
      code: 'NETWORK_ERROR',
      message: 'Erreur de connexion au serveur',
    }

    if (error.response) {
      // Erreur HTTP avec réponse
      const responseData = error.response.data
      
      apiError = {
        code: responseData?.error?.code || `HTTP_${error.response.status}`,
        message: responseData?.error?.message || error.response.statusText,
        details: responseData?.error?.details || responseData?.errors,
        status: error.response.status,
      }

      // Gestion spécifique par code d'erreur
      switch (error.response.status) {
        case 401:
          this.handleUnauthorized()
          break
        case 403:
          toast({
            title: 'Accès refusé',
            description: 'Vous n\'avez pas les permissions nécessaires.',
            variant: 'destructive',
          })
          break
        case 404:
          apiError.message = 'Ressource non trouvée'
          break
        case 422:
          apiError.message = 'Données invalides'
          break
        case 429:
          toast({
            title: 'Trop de requêtes',
            description: 'Veuillez patienter avant de réessayer.',
            variant: 'destructive',
          })
          break
        case 500:
          apiError.message = 'Erreur interne du serveur'
          break
      }

      // Afficher les erreurs de validation
      if (error.response.status === 422 && responseData?.errors) {
        this.displayValidationErrors(responseData.errors)
      }
    } else if (error.request) {
      // Pas de réponse reçue
      apiError = {
        code: 'NO_RESPONSE',
        message: 'Serveur injoignable. Vérifiez votre connexion.',
      }
      toast({
        title: 'Connexion perdue',
        description: 'Impossible de contacter le serveur.',
        variant: 'destructive',
      })
    }

    return Promise.reject(apiError)
  }

  private handleUnauthorized() {
    // Nettoyer le token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
    }
    
    // Rediriger vers login
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  private displayValidationErrors(errors: Record<string, string[]>) {
    Object.entries(errors).forEach(([field, messages]) => {
      const message = `${field}: ${messages.join(', ')}`
      toast({
        title: 'Erreur de validation',
        description: message,
        variant: 'destructive',
      })
    })
  }

  // Méthodes publiques
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config)
    return response.data.data!
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config)
    return response.data.data!
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config)
    return response.data.data!
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config)
    return response.data.data!
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config)
    return response.data.data!
  }

  // Méthodes utilitaires
  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
    }
  }
}

// Instance singleton
export const apiClient = new ApiClient()