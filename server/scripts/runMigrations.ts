import 'reflect-metadata';
import { AppDataSource } from '../config/database';

async function runMigrations() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        await AppDataSource.runMigrations();
        console.log('✅ Migrations executed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

runMigrations();
