import 'reflect-metadata';
import { AppDataSource } from '../config/database';

async function safeSchemaSetup() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        // Check if tables exist and synchronize only if needed
        const queryRunner = AppDataSource.createQueryRunner();
        
        // Check if users table exists
        const usersTableExists = await queryRunner.hasTable('users');
        const postsTableExists = await queryRunner.hasTable('posts');
        const categoriesTableExists = await queryRunner.hasTable('categories');
        
        console.log('📊 Table existence check:');
        console.log(`   Users: ${usersTableExists ? '✅' : '❌'}`);
        console.log(`   Posts: ${postsTableExists ? '✅' : '❌'}`);
        console.log(`   Categories: ${categoriesTableExists ? '✅' : '❌'}`);

        if (!usersTableExists || !postsTableExists || !categoriesTableExists) {
            console.log('🔄 Some tables missing, synchronizing schema...');
            await AppDataSource.synchronize(false); // false = don't drop existing tables
            console.log('✅ Schema synchronized safely');
        } else {
            console.log('✅ All tables exist, no synchronization needed');
        }

        await queryRunner.release();
        console.log('✅ Safe schema setup completed successfully!');
    } catch (error) {
        console.error('❌ Error during safe schema setup:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

safeSchemaSetup();
