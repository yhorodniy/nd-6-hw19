import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const categories = ['Technology', 'Health', 'Business', 'Other'];

async function createStandardUser(): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if standard user already exists
    const existingUser = await userRepository.findOne({ 
        where: { email: 'admin@example.com' } 
    });
    
    if (existingUser) {
        console.log('✅ Standard user already exists');
        return existingUser;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const standardUser = userRepository.create({
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        deleted: false
    });
    
    await userRepository.save(standardUser);
    console.log('✅ Created standard user: admin@example.com');
    return standardUser;
}

async function generatePostContent(): Promise<{ header: string; content: string; excerpt: string }> {
    // Use jsonplaceholder for some posts and faker for others
    const useJsonPlaceholder = Math.random() > 0.5;
    
    if (useJsonPlaceholder) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${Math.floor(Math.random() * 100) + 1}`);
            const data = await response.json();
            
            return {
                header: data.title,
                content: data.body.repeat(Math.floor(Math.random() * 5) + 3), // Make content longer
                excerpt: data.body.substring(0, 150) + '...'
            };
        } catch (error) {
            console.log('Fallback to faker due to API error');
        }
    }
    
    // Fallback to faker
    const header = faker.lorem.sentence(Math.floor(Math.random() * 8) + 4);
    const content = faker.lorem.paragraphs(Math.floor(Math.random() * 5) + 3, '\n\n');
    const excerpt = faker.lorem.paragraph().substring(0, 150) + '...';
    
    return { header, content, excerpt };
}

function generateSlug(header: string): string {
    return header
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
}

async function createPosts(author: User): Promise<void> {
    const postRepository = AppDataSource.getRepository(Post);
    
    // Check if posts already exist
    const existingPostsCount = await postRepository.count();
    if (existingPostsCount >= 20) {
        console.log('✅ Posts already exist, skipping creation');
        return;
    }
    
    console.log('🔄 Creating 20 posts...');
    
    const posts: Partial<Post>[] = [];
    
    for (let i = 0; i < 20; i++) {
        const { header, content, excerpt } = await generatePostContent();
        const slug = generateSlug(header) + '-' + Date.now() + '-' + i;
        
        const post = {
            header,
            content,
            excerpt,
            image: faker.image.url(),
            category: categories[Math.floor(Math.random() * categories.length)],
            tags: faker.lorem.words(Math.floor(Math.random() * 5) + 1).split(' '),
            author,
            authorId: author.id,
            isPublished: Math.random() > 0.1, // 90% published
            isFeatured: Math.random() > 0.8, // 20% featured
            viewsCount: Math.floor(Math.random() * 1000),
            likesCount: Math.floor(Math.random() * 100),
            slug,
            metaTitle: header.substring(0, 60),
            metaDescription: excerpt,
            readingTime: Math.floor(Math.random() * 10) + 1,
            publishedAt: Math.random() > 0.1 ? faker.date.recent({ days: 30 }) : undefined,
            deleted: false
        };
        
        posts.push(post);
    }
    
    // Save posts in batches
    for (let i = 0; i < posts.length; i += 5) {
        const batch = posts.slice(i, i + 5);
        const createdPosts = postRepository.create(batch);
        await postRepository.save(createdPosts);
        console.log(`✅ Created posts ${i + 1}-${Math.min(i + 5, posts.length)}`);
    }
    
    console.log('🎉 Successfully created 20 posts');
}

async function runSeeding() {
    try {
        console.log('🚀 Starting seeding process...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Database connection established');
        }
        
        // Create standard user
        const standardUser = await createStandardUser();
        
        // Create posts
        await createPosts(standardUser);
        
        console.log('🎉 Seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('✅ Database connection closed');
        }
    }
}

// Run seeding if called directly
if (require.main === module) {
    runSeeding().catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
}

export { runSeeding };
