import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Category } from '../entities/Category';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'nd_hw13',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Post, Category],
    migrations: ['migrations/*.ts'],
    subscribers: ['subscribers/*.ts'],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
