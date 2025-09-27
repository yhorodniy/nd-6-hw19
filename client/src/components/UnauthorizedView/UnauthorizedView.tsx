import React, { useState } from 'react';
import AuthModal from '../AuthModal/AuthModal';
import './UnauthorizedView.css';

const UnauthorizedView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="unauthorized-view">
      <div className="unauthorized-content">
        <div className="unauthorized-hero">
          <h1>Welcome to News Platform</h1>
          <p>
            Discover the latest news, share your thoughts, and stay connected 
            with the world around you.
          </p>
          <button 
            className="btn btn--primary btn--large"
            onClick={() => setIsModalOpen(true)}
          >
            Get Started
          </button>
        </div>

        <div className="unauthorized-features">
          <div className="feature-card">
            <div className="feature-icon">📰</div>
            <h3>Latest News</h3>
            <p>Stay updated with breaking news and trending stories from around the world.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3>Share Stories</h3>
            <p>Create and publish your own news articles and share them with the community.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Categorized Content</h3>
            <p>Browse news by categories to find exactly what interests you most.</p>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default UnauthorizedView;
