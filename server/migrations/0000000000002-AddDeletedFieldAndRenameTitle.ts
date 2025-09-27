import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedFieldAndRenameTitle1699000000002 implements MigrationInterface {
    name = 'AddDeletedFieldAndRenameTitle1699000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Starting migration: Add deleted field and rename title to header...');

        // Add deleted field to users table
        const usersTableExists = await queryRunner.hasTable('users');
        if (usersTableExists) {
            const deletedColumnExistsInUsers = await queryRunner.hasColumn('users', 'deleted');
            if (!deletedColumnExistsInUsers) {
                console.log('Adding deleted field to users table...');
                await queryRunner.query(`
                    ALTER TABLE "users" 
                    ADD COLUMN "deleted" boolean NOT NULL DEFAULT false
                `);
                console.log('✅ Added deleted field to users table');
            } else {
                console.log('✅ Deleted field already exists in users table');
            }

            // Add index for deleted field in users table
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_deleted" ON "users" ("deleted")`);
            console.log('✅ Added index for deleted field in users table');
        }

        // Add deleted field to posts table and rename title to header
        const postsTableExists = await queryRunner.hasTable('posts');
        if (postsTableExists) {
            // Add deleted field
            const deletedColumnExistsInPosts = await queryRunner.hasColumn('posts', 'deleted');
            if (!deletedColumnExistsInPosts) {
                console.log('Adding deleted field to posts table...');
                await queryRunner.query(`
                    ALTER TABLE "posts" 
                    ADD COLUMN "deleted" boolean NOT NULL DEFAULT false
                `);
                console.log('✅ Added deleted field to posts table');
            } else {
                console.log('✅ Deleted field already exists in posts table');
            }

            // Rename title to header
            const titleColumnExists = await queryRunner.hasColumn('posts', 'title');
            const headerColumnExists = await queryRunner.hasColumn('posts', 'header');
            
            if (titleColumnExists && !headerColumnExists) {
                console.log('Renaming title column to header in posts table...');
                await queryRunner.query(`
                    ALTER TABLE "posts" 
                    RENAME COLUMN "title" TO "header"
                `);
                console.log('✅ Renamed title to header in posts table');
            } else if (headerColumnExists) {
                console.log('✅ Header column already exists in posts table');
            }

            // Add indexes for performance optimization
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_deleted" ON "posts" ("deleted")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_header" ON "posts" ("header")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_published_at" ON "posts" ("published_at")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_views_count" ON "posts" ("views_count")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_likes_count" ON "posts" ("likes_count")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_is_featured" ON "posts" ("is_featured")`);
            
            console.log('✅ Added indexes for posts table');
        }

        // Add additional useful indexes for users table
        if (usersTableExists) {
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_created_at" ON "users" ("created_at")`);
            console.log('✅ Added additional indexes for users table');
        }

        console.log('🎉 Migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting migration: Remove deleted field and rename header back to title...');

        const postsTableExists = await queryRunner.hasTable('posts');
        const usersTableExists = await queryRunner.hasTable('users');

        // Revert posts table changes
        if (postsTableExists) {
            // Drop indexes
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_deleted"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_header"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_published_at"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_views_count"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_likes_count"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_is_featured"`);

            // Rename header back to title
            const headerColumnExists = await queryRunner.hasColumn('posts', 'header');
            if (headerColumnExists) {
                await queryRunner.query(`
                    ALTER TABLE "posts" 
                    RENAME COLUMN "header" TO "title"
                `);
                console.log('✅ Renamed header back to title in posts table');
            }

            // Remove deleted column
            const deletedColumnExists = await queryRunner.hasColumn('posts', 'deleted');
            if (deletedColumnExists) {
                await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "deleted"`);
                console.log('✅ Removed deleted field from posts table');
            }
        }

        // Revert users table changes
        if (usersTableExists) {
            // Drop indexes
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_deleted"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_created_at"`);

            // Remove deleted column
            const deletedColumnExists = await queryRunner.hasColumn('users', 'deleted');
            if (deletedColumnExists) {
                await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted"`);
                console.log('✅ Removed deleted field from users table');
            }
        }

        console.log('🎉 Migration rollback completed successfully!');
    }
}
