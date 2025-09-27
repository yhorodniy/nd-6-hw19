import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import { formatDate } from '../../services/dateFormatter';
import './PostCard.css';
import { useAuth } from '../../contexts/AuthContext';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const { categories } = useAuth();
    const getGenreColor = (category: string | undefined) => {
        const currentCategory = categories.find(c => c.slug === category);
        return currentCategory ? currentCategory.color : '#6c757d';
    };

    return (
        <div className="post-card">
            <Link to={`/post/${post.id}`} className="post-card__link">
                <div className="post-card__header">
                    <span 
                        className="post-card__genre"
                        style={{ backgroundColor: getGenreColor(post.category) }}
                    >
                        {post.category || 'Other'}
                    </span>
                    {post.is_featured && (
                        <span className="post-card__featured">⭐ Featured</span>
                    )}
                </div>
                <h3 className="post-card__title">{post.header}</h3>
                <p className="post-card__text">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                </p>
                <div className="post-card__footer">
                    <div className="post-card__meta">
                        <div className="post-card__date">
                            {formatDate(post.created_at)}
                        </div>
                        {post.author_email && (
                            <div className="post-card__author">
                                By: {post.author_email}
                            </div>
                        )}
                    </div>
                    <div className="post-card__stats">
                        {(post.views_count || 0) > 0 && (
                            <span className="post-card__views">👁 {post.views_count}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PostCard;
