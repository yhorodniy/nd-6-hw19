import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../../services/api';
import PostCard from '../../components/PostCard/PostCard';
import Pagination from '../../components/Pagination/Pagination';
import GenreFilter from '../../components/GenreFilter/GenreFilter';
import UserNav from '../../components/UserNav/UserNav';
import type { Post, PaginatedResponse } from '../../types';
import './HomePage.css';
import Loading from '../../components/Loading/Loading';
import Error from '../../components/Error/Error';

const HomePage: React.FC = () => {
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Post> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const pageSize: number = 10;

    const fetchPosts = async (page: number = 0, genre: string | null = null) => {
        try {
            setLoading(true);
            const params = { page, size: pageSize };
            if (genre) {
                (params as any).genre = genre;
            }
            const data = await newsAPI.getAllPosts(params);
            setPaginatedData(data);
            setError('');
        } catch (err) {
            setError('Error fetching posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage, selectedGenre);
    }, [currentPage, selectedGenre]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleGenreChange = (genre: string | null) => {
        setSelectedGenre(genre);
        setCurrentPage(0);
    };

    const displayedPosts = paginatedData?.data || [];
    const pagination = paginatedData?.pagination || null;

    if (error) return <Error message={error} />

    if (!loading && !paginatedData) return <Error message="No data available" />

    return (
        <div className="home-page">
            <header className="home-page__header">
                <h1>News</h1>
                <div className="home-page__actions">
                    <Link to="/create" className="btn btn--primary">
                        Add News
                    </Link>
                    <UserNav />
                </div>
            </header>

            <div className="home-page__content">
                <GenreFilter 
                    selectedGenre={selectedGenre}
                    onGenreChange={handleGenreChange}
                />

                {loading ? <Loading /> : displayedPosts.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {selectedGenre 
                                ? `No posts available for "${selectedGenre}" genre`
                                : "No posts available"
                            }
                        </p>
                        <Link to="/create" className="btn btn--secondary">
                            Create First Post
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="posts-info">
                            <p>
                                Showing {(pagination?.page || 0) * (pagination?.size || 10) + 1} - {Math.min(((pagination?.page || 0) + 1) * (pagination?.size || 10), pagination?.total || 0)} of {pagination?.total || 0} posts
                                {selectedGenre && ` in "${selectedGenre}" genre`}
                            </p>
                        </div>
                        <div className="posts-grid">
                            {displayedPosts.map((post) => (
                                <PostCard 
                                    key={post.id} 
                                    post={post}
                                />
                            ))}
                        </div>
                        {pagination && pagination.totalPages > 1 && (
                            <Pagination
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
