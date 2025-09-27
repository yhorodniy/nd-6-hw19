import { MigrationInterface, QueryRunner } from 'typeorm';

export class SafeCreateTables1699000000001 implements MigrationInterface {
    name = 'SafeCreateTables1699000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create extension for UUID generation if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Check and create users table
        const usersTableExists = await queryRunner.hasTable('users');
        if (!usersTableExists) {
            console.log('Creating users table...');
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "email" character varying NOT NULL,
                    "password_hash" character varying NOT NULL,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
                )
            `);
            console.log('✅ Users table created');
        } else {
            console.log('✅ Users table already exists');
        }

        // Check and create categories table
        const categoriesTableExists = await queryRunner.hasTable('categories');
        if (!categoriesTableExists) {
            console.log('Creating categories table...');
            await queryRunner.query(`
                CREATE TABLE "categories" (
                    "id" SERIAL NOT NULL,
                    "name" character varying NOT NULL,
                    "description" text,
                    "slug" character varying,
                    "color" character varying,
                    "color_active" character varying,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"),
                    CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
                )
            `);
            console.log('✅ Categories table created');
        } else {
            console.log('✅ Categories table already exists');
        }

        // Check and create posts table
        const postsTableExists = await queryRunner.hasTable('posts');
        if (!postsTableExists) {
            console.log('Creating posts table...');
            await queryRunner.query(`
                CREATE TABLE "posts" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "title" character varying NOT NULL,
                    "content" text NOT NULL,
                    "excerpt" text,
                    "image" character varying,
                    "category" character varying,
                    "tags" text array,
                    "author_id" uuid NOT NULL,
                    "is_published" boolean NOT NULL DEFAULT true,
                    "is_featured" boolean NOT NULL DEFAULT false,
                    "views_count" integer NOT NULL DEFAULT '0',
                    "likes_count" integer NOT NULL DEFAULT '0',
                    "slug" character varying,
                    "meta_title" character varying,
                    "meta_description" text,
                    "reading_time" integer NOT NULL DEFAULT '1',
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "published_at" TIMESTAMP,
                    CONSTRAINT "UQ_54ddf9075260407dcfdd724857c" UNIQUE ("slug"),
                    CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
                )
            `);

            // Create foreign key constraint if both tables exist
            const usersExists = await queryRunner.hasTable('users');
            if (usersExists) {
                await queryRunner.query(`
                    ALTER TABLE "posts" 
                    ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" 
                    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
                `);
            }

            // Create indexes
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_author_id" ON "posts" ("author_id")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_is_published" ON "posts" ("is_published")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_category" ON "posts" ("category")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_created_at" ON "posts" ("created_at")`);
            
            console.log('✅ Posts table created');
        } else {
            console.log('✅ Posts table already exists');
            
            // Check if foreign key exists and create if needed
            const foreignKeyExists = await queryRunner.query(`
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'FK_c5a322ad12a7bf95460c958e80e' 
                AND table_name = 'posts'
            `);
            
            if (foreignKeyExists.length === 0) {
                console.log('Adding missing foreign key constraint...');
                await queryRunner.query(`
                    ALTER TABLE "posts" 
                    ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" 
                    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
                `);
                console.log('✅ Foreign key constraint added');
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const postsExists = await queryRunner.hasTable('posts');
        const categoriesExists = await queryRunner.hasTable('categories');
        const usersExists = await queryRunner.hasTable('users');

        if (postsExists) {
            await queryRunner.query(`DROP TABLE "posts"`);
        }
        if (categoriesExists) {
            await queryRunner.query(`DROP TABLE "categories"`);
        }
        if (usersExists) {
            await queryRunner.query(`DROP TABLE "users"`);
        }
    }
}
