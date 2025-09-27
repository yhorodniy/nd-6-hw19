import Validator from 'fastest-validator';
import { ValidationError } from './errors';
import { NewsGenre } from '../types/types';

const validator = new Validator();

const genreValues = Object.values(NewsGenre);

export const newspostSchema = {
    id: { type: "number", positive: true, integer: true, optional: true },
    title: { 
        type: "string", 
        min: 1, 
        max: 50, 
        messages: {
            stringMin: "Title must have at least 1 character",
            stringMax: "Title cannot exceed 50 characters"
        }
    },
    text: { 
        type: "string", 
        min: 1, 
        max: 256,
        messages: {
            stringMin: "Text must have at least 1 character", 
            stringMax: "Text cannot exceed 256 characters"
        }
    },
    genre: { 
        type: "enum", 
        values: genreValues,
        messages: {
            enumValue: `Genre must be one of: ${genreValues.join(', ')}`
        }
    },
    isPrivate: { 
        type: "boolean",
        messages: {
            boolean: "isPrivate must be true or false"
        }
    },
    createDate: { type: "date", optional: true }
};

export const createNewspostSchema = {
    title: newspostSchema.title,
    text: newspostSchema.text,
    genre: newspostSchema.genre,
    isPrivate: newspostSchema.isPrivate
};

export const updateNewspostSchema = {
    title: { ...newspostSchema.title, optional: true },
    text: { ...newspostSchema.text, optional: true },
    genre: { ...newspostSchema.genre, optional: true },
    isPrivate: { ...newspostSchema.isPrivate, optional: true }
};

export const validateCreateNewspost = validator.compile(createNewspostSchema);
export const validateUpdateNewspost = validator.compile(updateNewspostSchema);

export function validateData(data: any, validateFn: any, errorPrefix: string = 'Validation failed'): void {
    const result = validateFn(data);
    if (result !== true) {
        const errorMessage = result.map((error: any) => error.message).join(', ');
        throw new ValidationError(`${errorPrefix}: ${errorMessage}`, result);
    }
}
