import axios from 'axios';
import type {
    Post,
    PostCreateRequest,
    PostUpdateRequest,
    PaginatedResponse,
    PostQueryParams,
    LoginResponse,
    RegisterResponse,
    UserResponse,
    Categories
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';
const USER_SERVICE_URL = 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const newsAPI = {
    getAllPosts: async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
        const queryParams = new URLSearchParams();
        if (params) {
            queryParams.append('page', params.page.toString());
            queryParams.append('size', params.size.toString());
            if (params.genre) {
                queryParams.append('category', params.genre);
            }
        }
        
        const response = await api.get<PaginatedResponse<Post>>(`/newsposts?${queryParams.toString()}`);
        return response.data;
    },

    getPostById: async (id: string): Promise<Post> => {
        const response = await api.get<Post>(`/newsposts/${id}`);
        return response.data;
    },

    createPost: async (post: PostCreateRequest): Promise<Post> => {
        const response = await api.post<Post>('/newsposts', post);
        return response.data;
    },

    updatePost: async (id: string, post: PostUpdateRequest): Promise<Post> => {
        const response = await api.put<Post>(`/newsposts/${id}`, post);
        return response.data;
    },

    deletePost: async (id: string): Promise<void> => {
        await api.delete(`/newsposts/${id}`);
    },

    getCategories: async (): Promise<Categories[]> => {
        const response = await api.get<Categories[]>('/newsposts/categories');
        return response.data;
    }
};

export const authAPI = {
  register: async (email: string, password: string, confirmPassword: string): Promise<RegisterResponse> => {
    const response = await axios.post(`${USER_SERVICE_URL}/users/create`, {
      email,
      password,
      confirmPassword
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post(`${USER_SERVICE_URL}/users/login`, {
      email,
      password
    });
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<UserResponse> => {
    try {
      // Декодуємо JWT токен для отримання userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
      
      const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${id}`);
    return response.data;
  }
};
