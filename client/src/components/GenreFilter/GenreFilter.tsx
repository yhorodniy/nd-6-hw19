import React from 'react';
import './GenreFilter.css';
import { useAuth } from '../../contexts/AuthContext';

interface GenreFilterProps {
    selectedGenre: string | null;
    onGenreChange: (genre: string | null) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ selectedGenre, onGenreChange }) => {
    const { categories } = useAuth();

    if (!selectedGenre && categories) {
        selectedGenre = categories.find(el => el.name === 'ALL')?.slug || null;
    }

    return (
        <div className="genre-filter">
            <label className="genre-filter__label">Filter by genre:</label>
            <div className="genre-filter__buttons">
                {categories.map((category) => {
                    const isActive = selectedGenre === category.slug;
                    
                    return (
                        <button
                            key={category.id || 'all'}
                            onClick={() => onGenreChange(category.slug)}
                            className={`genre-filter__button ${
                                isActive ? 'genre-filter__button--active' : ''
                            }`}
                            style={{
                                backgroundColor: isActive ? category.color_active : 'white',
                                borderColor: category.color,
                                color: isActive ? 'white' : category.color,
                            }}
                        >
                            {category.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GenreFilter;
