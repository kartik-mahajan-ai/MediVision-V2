const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Token management
const getToken = (): string | null => {
    return localStorage.getItem('medivision_token');
};

const setToken = (token: string): void => {
    localStorage.setItem('medivision_token', token);
};

const removeToken = (): void => {
    localStorage.removeItem('medivision_token');
};

// API request helper
const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        if (import.meta.env.DEV) {
            console.log(`API Request: ${options.method || 'GET'} ${endpoint}`, options.body ? 'with body' : '');
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (import.meta.env.DEV) {
                console.error('API Error Response:', response.status, errorText);
            }
            let error;
            try {
                error = JSON.parse(errorText);
            } catch {
                error = { error: errorText || 'Request failed' };
            }
            throw new Error(error.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (import.meta.env.DEV) {
            console.log(`API Success: ${endpoint}`, data);
        }
        return data;
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
};

// User type
export interface User {
    id: string;
    email: string;
    full_name?: string;
    user_metadata?: {
        full_name?: string;
    };
}

// Auth API
export const authAPI = {
    register: async (email: string, password: string, fullName: string) => {
        const data = await apiRequest<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name: fullName }),
        });
        setToken(data.token);
        return { user: data.user, error: null };
    },

    login: async (email: string, password: string) => {
        const data = await apiRequest<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        return { user: data.user, error: null };
    },

    logout: async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            removeToken();
        }
    },

    getSession: async () => {
        const token = getToken();
        if (!token) return { user: null };

        try {
            const data = await apiRequest<{ user: User }>('/auth/session');
            return { user: data.user };
        } catch {
            removeToken();
            return { user: null };
        }
    },

    updateProfile: async (data: { full_name?: string; password?: string }) => {
        const response = await apiRequest<{ user: User }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { user: response.user };
    },
};

// X-Ray API
export const xrayAPI = {
    getAll: () => apiRequest<any[]>('/xray'),

    getRecent: (limit = 5) => apiRequest<any[]>(`/xray/recent?limit=${limit}`),

    getCount: () => apiRequest<{ count: number }>('/xray/count'),

    create: (data: {
        image_url: string;
        image_data?: string;
        prediction: string;
        confidence: number;
        all_predictions: Record<string, number>;
        notes?: string;
    }) => apiRequest<any>('/xray', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    upload: (data: {
        image_data: string;
        notes?: string;
    }) => apiRequest<{ analysis: any; publicUrl: string }>('/xray/upload', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    uploadStream: async (data: {
        image_data: string;
        notes?: string;
    }) => {
        const token = getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`${API_BASE_URL}/xray/upload/stream`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Stream request failed with status ${response.status}`);
        }
        return response;
    },
};

// Symptoms API
export const symptomsAPI = {
    getAll: () => apiRequest<any[]>('/symptoms'),

    getRecent: (limit = 5) => apiRequest<any[]>(`/symptoms/recent?limit=${limit}`),

    getCount: () => apiRequest<{ count: number }>('/symptoms/count'),

    create: (data: {
        symptoms: any;
        additional_info?: string;
        analysis_result?: any;
        risk_level?: string;
        recommendations?: string[];
    }) => apiRequest<any>('/symptoms', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Chat API
export const chatAPI = {
    getMessages: (conversationId: string) =>
        apiRequest<any[]>(`/chat/messages/${conversationId}`),

    getContext: () => apiRequest<{ xrays: any[]; symptoms: any[] }>('/chat/context'),

    createMessage: (data: {
        conversation_id: string;
        role: string;
        content: string;
        metadata?: any;
    }) => apiRequest<any>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    chat: (message: string, conversationId: string) =>
        apiRequest<{ response: string; messageId: string }>('/chat/chat', {
            method: 'POST',
            body: JSON.stringify({ message, conversationId }),
        }),
};

// Stats API
export const statsAPI = {
    getGlobal: () => apiRequest<{
        profiles: number;
        xray_analyses: number;
        symptom_checks: number;
    }>('/stats/global'),

    getUser: () => apiRequest<{
        xray_analyses: number;
        symptom_checks: number;
        total: number;
    }>('/stats/user'),
};

export { getToken, setToken, removeToken };
