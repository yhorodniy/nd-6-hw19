export interface Post {
    id: string;
    header: string; // renamed from title
    content: string;
    excerpt?: string;
    image?: string;
    category?: string;
    tags?: string[];
    author_id?: string;
    author_email?: string;
    is_published?: boolean;
    is_featured?: boolean;
    views_count?: number;
    likes_count?: number;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    reading_time?: number;
    created_at: string;
    updated_at: string;
    published_at?: string;
    deleted?: boolean; // new field
}

export interface PostCreateRequest {
    header: string; // renamed from title
    content: string;
    excerpt?: string;
    image?: string;
    category?: string;
    tags?: string[];
    is_published?: boolean;
    is_featured?: boolean;
    meta_title?: string;
    meta_description?: string;
}

export interface PostUpdateRequest {
    header?: string; // renamed from title
    content?: string;
    excerpt?: string;
    image?: string;
    category?: string;
    tags?: string[];
    is_published?: boolean;
    is_featured?: boolean;
    meta_title?: string;
    meta_description?: string;
}

export interface PostQueryParams {
    page: number;
    size: number;
    genre?: string;
}

export interface PaginationInfo {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

export interface User {
    id: string;
    email: string;
}

export interface Categories {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    color_active: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  categories: Categories[];
  loading: boolean;
  signUp: (email: string, password: string, confirmPassword: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface RegisterResponse {
  token?: string;
  user: {
    id: string;
    email: string;
  };
  message: string;
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
  };
}
