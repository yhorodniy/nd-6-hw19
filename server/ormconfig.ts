import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { Category } from './entities/Category';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'nd_hw13',
    synchronize: false,
    logging: true,
    entities: [User, Post, Category],
    migrations: ['migrations/*.ts'],
    subscribers: ['subscribers/*.ts'],
});
