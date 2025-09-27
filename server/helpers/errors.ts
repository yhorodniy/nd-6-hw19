export class ValidationError extends Error {
    constructor(message: string, public details?: any) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class NewspostsServiceError extends Error {
    constructor(message: string, public originalError?: Error) {
        super(message);
        this.name = 'NewspostsServiceError';
        Object.setPrototypeOf(this, NewspostsServiceError.prototype);
    }
}

export class AuthServiceError extends Error {
    public statusCode: number;
    
    constructor(message: string, statusCode: number = 500, public originalError?: Error) {
        super(message);
        this.name = 'AuthServiceError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AuthServiceError.prototype);
    }
}
