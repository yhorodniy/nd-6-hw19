import React from 'react';
import type { PaginationInfo } from '../../types';
import './Pagination.css';

interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { page, totalPages, hasNext, hasPrev } = pagination;

    const getPageNumbers = () => {
        const pages: number[] = [];
        const startPage = Math.max(0, page - 2);
        const endPage = Math.min(totalPages - 1, page + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            <button
                className="pagination__btn"
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrev}
            >
                Previous
            </button>

            {page > 2 && (
                <>
                    <button
                        className="pagination__btn"
                        onClick={() => onPageChange(0)}
                    >
                        1
                    </button>
                    {page > 3 && <span className="pagination__ellipsis">...</span>}
                </>
            )}

            {getPageNumbers().map((pageNum) => (
                <button
                    key={pageNum}
                    className={`pagination__btn ${
                        pageNum === page ? 'pagination__btn--active' : ''
                    }`}
                    onClick={() => onPageChange(pageNum)}
                >
                    {pageNum + 1}
                </button>
            ))}

            {page < totalPages - 3 && (
                <>
                    {page < totalPages - 4 && <span className="pagination__ellipsis">...</span>}
                    <button
                        className="pagination__btn"
                        onClick={() => onPageChange(totalPages - 1)}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                className="pagination__btn"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNext}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
