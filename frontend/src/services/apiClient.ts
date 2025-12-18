/**
 * Cliente HTTP centralizado para comunicação com API
 * 
 * Funcionalidades:
 * - Interceptor de requisição para adicionar token JWT
 * - Interceptor de resposta para tratamento de erros
 * - Retry automático para erros de rede
 * - Tratamento de erros amigável
 */

// Detecta automaticamente a URL da API baseado no ambiente
export const getApiBaseUrl = (): string => {
    // Se variável de ambiente estiver definida, usa ela
    if (import.meta.env.VITE_API_URL) {
        console.log('[API] Usando VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    
    // Detecta pelo domínio atual
    const hostname = window.location.hostname;
    const fullUrl = window.location.href;
    
    console.log('[API] Detectando ambiente - hostname:', hostname, 'url:', fullUrl);
    
    // ========================================
    // STAGING - painel-sgjt-stag-*
    // ========================================
    if (hostname.includes('stag') && hostname.includes('tjgo.jus.br')) {
        console.log('[API] Ambiente: STAGING');
        return 'https://painel-sgjt-stag-api.apps.ocp-prd.tjgo.jus.br';
    }
    
    // ========================================
    // PRODUÇÃO - Qualquer domínio tjgo.jus.br (exceto staging)
    // Tanto kaizen.tjgo.jus.br quanto painel-sgjt-prd-* usam a mesma API
    // ========================================
    if (hostname.includes('tjgo.jus.br')) {
        console.log('[API] Ambiente: PRODUÇÃO -> https://kaizen-api.tjgo.jus.br');
        return 'https://kaizen-api.tjgo.jus.br';
    }
    
    // ========================================
    // DESENVOLVIMENTO LOCAL
    // ========================================
    console.log('[API] Ambiente: DESENVOLVIMENTO LOCAL');
    return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

// Tipos de erro customizados
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Erro de conexão. Verifique sua internet.') {
        super(message);
        this.name = 'NetworkError';
    }
}

export class AuthError extends Error {
    constructor(message: string = 'Sessão expirada. Faça login novamente.') {
        super(message);
        this.name = 'AuthError';
    }
}

export class ApiClient {
    private baseURL: string;
    private maxRetries: number = 2;
    private retryDelay: number = 1000;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Obtém o token JWT do localStorage
     */
    private getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Remove dados de autenticação e redireciona para login
     */
    private handleAuthError(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirecionar para login se não estiver na página de login
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    /**
     * Aguarda antes de retry
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Mapeia código de status HTTP para mensagem amigável
     */
    private getErrorMessage(status: number, serverMessage?: string): string {
        if (serverMessage) return serverMessage;

        switch (status) {
            case 400:
                return 'Dados inválidos. Verifique as informações e tente novamente.';
            case 401:
                return 'Sessão expirada. Faça login novamente.';
            case 403:
                return 'Você não tem permissão para realizar esta ação.';
            case 404:
                return 'Recurso não encontrado.';
            case 409:
                return 'Conflito de dados. Este registro já existe.';
            case 422:
                return 'Dados de entrada inválidos.';
            case 429:
                return 'Muitas requisições. Aguarde um momento.';
            case 500:
                return 'Erro interno do servidor. Tente novamente mais tarde.';
            case 502:
            case 503:
            case 504:
                return 'Servidor temporariamente indisponível. Tente novamente.';
            default:
                return `Erro na requisição (${status})`;
        }
    }

    /**
     * Verifica se o erro é recuperável (pode fazer retry)
     */
    private isRetryableError(status: number): boolean {
        return status >= 500 || status === 429 || status === 0;
    }

    /**
     * Executa requisição HTTP com retry automático
     */
    async request<T>(
        endpoint: string,
        options?: RequestInit,
        retryCount: number = 0
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Configurar headers
        // Não adicionar Content-Type se body for FormData (browser adiciona automaticamente com boundary)
        const isFormData = options?.body instanceof FormData;
        const headers: HeadersInit = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...options?.headers,
        };

        // Adicionar token JWT se disponível
        const token = this.getToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
            credentials: 'include',
        };

        try {
            const response = await fetch(url, config);

            // Tratar erros de autenticação
            if (response.status === 401) {
                this.handleAuthError();
                throw new AuthError();
            }

            // Se erro HTTP
            if (!response.ok) {
                let errorMessage = this.getErrorMessage(response.status);
                let errorCode: string | undefined;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    errorCode = errorData.code;
                } catch {
                    // Se não conseguir parsear erro, usar mensagem padrão
                }

                // Tentar retry para erros recuperáveis
                if (this.isRetryableError(response.status) && retryCount < this.maxRetries) {
                    await this.delay(this.retryDelay * (retryCount + 1));
                    return this.request<T>(endpoint, options, retryCount + 1);
                }

                throw new ApiError(errorMessage, response.status, errorCode);
            }

            // Se 204 No Content, retornar objeto vazio
            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            // Tratar erro de rede
            if (error instanceof TypeError && error.message.includes('fetch')) {
                if (retryCount < this.maxRetries) {
                    await this.delay(this.retryDelay * (retryCount + 1));
                    return this.request<T>(endpoint, options, retryCount + 1);
                }
                throw new NetworkError();
            }

            // Re-throw erros conhecidos
            if (error instanceof ApiError || error instanceof AuthError || error instanceof NetworkError) {
                throw error;
            }

            // Erro desconhecido
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    get<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
        return this.request<T>(endpoint, { 
            method: 'GET',
            headers: options?.headers 
        });
    }

    /**
     * POST request
     */
    post<T>(endpoint: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
            headers: options?.headers,
        });
    }

    /**
     * PUT request
     */
    put<T>(endpoint: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
            headers: options?.headers,
        });
    }

    /**
     * PATCH request
     */
    patch<T>(endpoint: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            headers: options?.headers,
        });
    }

    /**
     * DELETE request
     */
    delete<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
        return this.request<T>(endpoint, { 
            method: 'DELETE',
            headers: options?.headers 
        });
    }
}

// Exportar instância singleton
export const apiClient = new ApiClient();

// Exportar funções helper para compatibilidade
export const get = <T>(url: string): Promise<T> => apiClient.get<T>(url);
export const post = <T>(url: string, data?: unknown): Promise<T> => apiClient.post<T>(url, data);
export const put = <T>(url: string, data?: unknown): Promise<T> => apiClient.put<T>(url, data);
export const del = <T>(url: string): Promise<T> => apiClient.delete<T>(url);
