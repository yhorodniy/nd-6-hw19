import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    slug?: string;

    @Column({ nullable: true })
    color?: string;

    @Column({ name: 'color_active', nullable: true })
    colorActive?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
