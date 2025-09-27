import { PaginatedResponse, Post as PostType, PostCreateRequest, PostUpdateRequest } from '../types/types';
import { AppDataSource } from '../config/database';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { Repository } from 'typeorm';

export class PostsService {
    private postRepository: Repository<Post>;
    private userRepository: Repository<User>;
    private categoryRepository: Repository<Category>;

    constructor() {
        this.postRepository = AppDataSource.getRepository(Post);
        this.userRepository = AppDataSource.getRepository(User);
        this.categoryRepository = AppDataSource.getRepository(Category);
    }

    private createSlug(header: string): string {
        return header
            .toLowerCase()
            .replace(/['\"""'']/g, '')
            .replace(/[^a-zа-яё0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    async getAllPosts(
        page: number = 0,
        size: number = 10,
        category?: string,
        userId?: string
    ): Promise<PaginatedResponse<PostType>> {
        try {
            const queryBuilder = this.postRepository.createQueryBuilder('post')
                .leftJoinAndSelect('post.author', 'author')
                .where('post.deleted = :deleted', { deleted: false });

            if (userId) {
                queryBuilder.andWhere(
                    '(post.isPublished = :published OR (post.isPublished = :unpublished AND post.authorId = :userId))',
                    { published: true, unpublished: false, userId }
                );
            } else {
                queryBuilder.andWhere('post.isPublished = :published', { published: true });
            }

            if (category) {
                queryBuilder.andWhere('post.category = :category', { category });
            }

            const total = await queryBuilder.getCount();
            
            const from = page * size;
            const posts = await queryBuilder
                .orderBy('post.createdAt', 'DESC')
                .limit(size)
                .offset(from)
                .getMany();
                
            const totalPages = Math.ceil(total / size);

            const data = posts.map(post => ({
                id: post.id,
                header: post.header,
                content: post.content,
                excerpt: post.excerpt,
                image: post.image,
                category: post.category,
                tags: post.tags,
                author_id: post.authorId,
                author_email: post.author?.email || 'Unknown',
                is_published: post.isPublished,
                is_featured: post.isFeatured,
                views_count: post.viewsCount,
                likes_count: post.likesCount,
                slug: post.slug,
                meta_title: post.metaTitle,
                meta_description: post.metaDescription,
                reading_time: post.readingTime,
                created_at: post.createdAt.toISOString(),
                updated_at: post.updatedAt.toISOString(),
                published_at: post.publishedAt?.toISOString(),
                deleted: post.deleted
            }));

            return {
                data,
                pagination: {
                    page,
                    size,
                    total,
                    totalPages
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
    }

    async getPostById(id: string, userId?: string): Promise<PostType> {
        try {
            const post = await this.postRepository.findOne({
                where: { id, deleted: false },
                relations: ['author']
            });

            if (!post) {
                throw new Error('Post not found');
            }

            if (!post.isPublished && post.authorId !== userId) {
                throw new Error('Post not found or not accessible');
            }

            if (post.isPublished) {
                await this.postRepository.update(id, {
                    viewsCount: post.viewsCount + 1
                });
                post.viewsCount = post.viewsCount + 1;
            }

            return {
                id: post.id,
                header: post.header,
                content: post.content,
                excerpt: post.excerpt,
                image: post.image,
                category: post.category,
                tags: post.tags,
                author_id: post.authorId,
                author_email: post.author?.email || 'Unknown',
                is_published: post.isPublished,
                is_featured: post.isFeatured,
                views_count: post.viewsCount,
                likes_count: post.likesCount,
                slug: post.slug,
                meta_title: post.metaTitle,
                meta_description: post.metaDescription,
                reading_time: post.readingTime,
                created_at: post.createdAt.toISOString(),
                updated_at: post.updatedAt.toISOString(),
                published_at: post.publishedAt?.toISOString(),
                deleted: post.deleted
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch post: ${error.message}`);
        }
    }

    async createPost(postData: PostCreateRequest, authorId: string): Promise<PostType> {
        try {
            const author = await this.userRepository.findOne({
                where: { id: authorId }
            });

            if (!author) {
                throw new Error('Author not found');
            }

            const slug = this.createSlug(postData.header);
            const readingTime = this.calculateReadingTime(postData.content);
            
            const post = this.postRepository.create({
                ...postData,
                authorId,
                slug,
                readingTime,
                isPublished: postData.is_published ?? true,
                isFeatured: postData.is_featured ?? false,
                viewsCount: 0,
                likesCount: 0,
                publishedAt: postData.is_published ? new Date() : undefined
            });

            const savedPost = await this.postRepository.save(post);

            // Reload with author relation
            const postWithAuthor = await this.postRepository.findOne({
                where: { id: savedPost.id },
                relations: ['author']
            });

            return {
                id: savedPost.id,
                header: savedPost.header,
                content: savedPost.content,
                excerpt: savedPost.excerpt,
                image: savedPost.image,
                category: savedPost.category,
                tags: savedPost.tags,
                author_id: savedPost.authorId,
                author_email: postWithAuthor?.author?.email || author.email,
                is_published: savedPost.isPublished,
                is_featured: savedPost.isFeatured,
                views_count: savedPost.viewsCount,
                likes_count: savedPost.likesCount,
                slug: savedPost.slug,
                meta_title: savedPost.metaTitle,
                meta_description: savedPost.metaDescription,
                reading_time: savedPost.readingTime,
                created_at: savedPost.createdAt.toISOString(),
                updated_at: savedPost.updatedAt.toISOString(),
                published_at: savedPost.publishedAt?.toISOString()
            };
        } catch (error: any) {
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    async updatePost(id: string, postData: PostUpdateRequest, authorId: string): Promise<PostType> {
        try {
            const existingPost = await this.postRepository.findOne({
                where: { id },
                select: ['id', 'authorId', 'header', 'content']
            });

            if (!existingPost) {
                throw new Error('Post not found');
            }

            if (existingPost.authorId !== authorId) {
                throw new Error('Unauthorized: You can only update your own posts');
            }

            const updateData: Partial<Post> = { ...postData };

            if (postData.header && postData.header !== existingPost.header) {
                updateData.slug = this.createSlug(postData.header);
            }

            if (postData.content && postData.content !== existingPost.content) {
                updateData.readingTime = this.calculateReadingTime(postData.content);
            }

            if (postData.is_published !== undefined) {
                updateData.isPublished = postData.is_published;
                if (postData.is_published && !existingPost.isPublished) {
                    updateData.publishedAt = new Date();
                }
            }

            if (postData.is_featured !== undefined) {
                updateData.isFeatured = postData.is_featured;
            }

            await this.postRepository.update(id, updateData);

            const updatedPost = await this.postRepository.findOne({
                where: { id },
                relations: ['author']
            });

            if (!updatedPost) {
                throw new Error('Failed to retrieve updated post');
            }

            return {
                id: updatedPost.id,
                header: updatedPost.header,
                content: updatedPost.content,
                excerpt: updatedPost.excerpt,
                image: updatedPost.image,
                category: updatedPost.category,
                tags: updatedPost.tags,
                author_id: updatedPost.authorId,
                author_email: updatedPost.author?.email || 'Unknown',
                is_published: updatedPost.isPublished,
                is_featured: updatedPost.isFeatured,
                views_count: updatedPost.viewsCount,
                likes_count: updatedPost.likesCount,
                slug: updatedPost.slug,
                meta_title: updatedPost.metaTitle,
                meta_description: updatedPost.metaDescription,
                reading_time: updatedPost.readingTime,
                created_at: updatedPost.createdAt.toISOString(),
                updated_at: updatedPost.updatedAt.toISOString(),
                published_at: updatedPost.publishedAt?.toISOString(),
                deleted: updatedPost.deleted
            };
        } catch (error: any) {
            throw new Error(`Failed to update post: ${error.message}`);
        }
    }

    async deletePost(id: string, authorId: string): Promise<void> {
        try {
            const existingPost = await this.postRepository.findOne({
                where: { id },
                select: ['id', 'authorId']
            });

            if (!existingPost) {
                throw new Error('Post not found');
            }

            if (existingPost.authorId !== authorId) {
                throw new Error('Unauthorized: You can only delete your own posts');
            }

            await this.postRepository.delete(id);
        } catch (error: any) {
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    async getCategories(): Promise<any[]> {
        try {
            const categories = await this.categoryRepository.find({
                order: { name: 'ASC' }
            });
            return categories;
        } catch (error: any) {
            throw new Error(`Failed to fetch categories: ${error.message}`);
        }
    }
}
