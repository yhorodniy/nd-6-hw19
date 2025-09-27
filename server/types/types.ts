export enum NewsGenre {
    BUSINESS = 'Business',
    HEALTH = 'Health',
    TECHNOLOGY = 'Technology',
    OTHER = 'Other'
}

export interface Post {
    id: string;
    header: string;
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
    deleted?: boolean;
}

export interface PostCreateRequest {
    header: string;
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
    header?: string;
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

export interface PaginationParams {
    page: number;
    size: number;
}

export interface PostQueryParams extends PaginationParams {
    genre?: NewsGenre;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        size: number;
        total: number;
        totalPages: number;
    };
}

export interface ErrorResponse {
    message: string;
    status: number;
    stack?: string;
    originalMessage?: string;
}

export interface Repository<T> {
    getAll(params?: PostQueryParams): Promise<PaginatedResponse<T>>;
    getById(id: string): Promise<T | null>;
    create(data: Omit<T, 'id' | 'createDate'>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

export interface Service<T> extends Repository<T> {}

export interface User {
    id: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
    deleted?: boolean;
}

export interface UserCreateRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}
