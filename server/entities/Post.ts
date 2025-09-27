import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    header!: string;

    @Column('text')
    content!: string;

    @Column({ type: 'text', nullable: true })
    excerpt?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ nullable: true })
    category?: string;

    @Column({ type: 'text', array: true, nullable: true })
    tags?: string[];

    @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author!: User;

    @Column({ name: 'author_id' })
    authorId!: string;

    @Column({ name: 'is_published', default: true })
    isPublished!: boolean;

    @Column({ name: 'is_featured', default: false })
    isFeatured!: boolean;

    @Column({ name: 'views_count', default: 0 })
    viewsCount!: number;

    @Column({ name: 'likes_count', default: 0 })
    likesCount!: number;

    @Column({ unique: true, nullable: true })
    slug?: string;

    @Column({ name: 'meta_title', nullable: true })
    metaTitle?: string;

    @Column({ name: 'meta_description', type: 'text', nullable: true })
    metaDescription?: string;

    @Column({ name: 'reading_time', default: 1 })
    readingTime!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({ name: 'published_at', nullable: true })
    publishedAt?: Date;

    @Column({ default: false })
    deleted!: boolean;
}
