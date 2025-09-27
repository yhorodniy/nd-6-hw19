import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { newsAPI } from '../../services/api';
import { formatDate } from '../../services/dateFormatter';
import type { Post } from '../../types';
import './PostDetailPage.css';
import Loading from '../../components/Loading/Loading';
import Error from '../../components/Error/Error';
import { useAuth } from '../../contexts/AuthContext';

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);

    const { categories } = useAuth();

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) {
                setError('News ID not found');
                setLoading(false);
                return;
            }

            try {
                const fetchedPost = await newsAPI.getPostById(id);
                setPost(fetchedPost);
                const currentUserId = localStorage.getItem('user_id');
                setUserId(currentUserId);
            } catch (err) {
                setError('Error fetching post');
                console.error('Error fetching post:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        if (!post || !id) return;

        const confirmed = window.confirm('Are you sure you want to delete this post?');
        if (!confirmed) return;

        try {
            await newsAPI.deletePost(id);
            navigate('/');
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Error deleting post');
        }
    };

    const getGenreColor = (category: string | undefined) => {
        const currentCategory = categories.find(c => c.slug === category);
        return currentCategory ? currentCategory.color : '#6c757d';
    };

    if (loading) return <Loading />;

    if (error || !post) return  <Error message={error || 'Post not found'} isShowBack={true} />;

    return (
        <div className="post-detail-page">
            <div className="post-detail__actions">
                <Link to="/" className="btn btn--secondary">
                    ← Back to list
                </Link>
                {userId === post.author_id && 
                    <div className="post-detail__actions-right">
                        <Link to={`/edit/${post.id}`} className="btn btn--primary">
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="btn btn--danger"
                        >
                            Delete
                        </button>
                    </div>
                }
            </div>

            <article className="post-detail__content">
                <header className="post-detail__header">
                    <div className="post-detail__meta">
                        <span 
                            className="post-detail__genre"
                            style={{ backgroundColor: getGenreColor(post.category) }}
                        >
                            {post.category || 'Other'}
                        </span>
                        {post.is_featured && (
                            <span className="post-detail__featured">⭐ Featured</span>
                        )}
                    </div>
                    <h1 className="post-detail__title">{post.header}</h1>
                    {post.excerpt && (
                        <div className="post-detail__excerpt">{post.excerpt}</div>
                    )}
                    <div className="post-detail__meta-info">
                        <div className="post-detail__info-left">
                            <div className="post-detail__date">
                                {formatDate(post.created_at)}
                            </div>
                            {post.author_email && (
                                <div className="post-detail__author">
                                    By: {post.author_email}
                                </div>
                            )}
                        </div>
                        <div className="post-detail__stats">
                            {(post.views_count || 0) > 0 && (
                                <span className="post-detail__views">👁 {post.views_count} views</span>
                            )}
                            {post.reading_time && (
                                <span className="post-detail__reading-time">⏱ {post.reading_time} min read</span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="post-detail__text">
                    {post.content.split('\n').map((paragraph: string, index: number) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="post-detail__tags">
                        <h4>Tags:</h4>
                        <div className="post-detail__tags-list">
                            {post.tags.map((tag: string, index: number) => (
                                <span key={index} className="post-detail__tag">#{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
};

export default PostDetailPage;
