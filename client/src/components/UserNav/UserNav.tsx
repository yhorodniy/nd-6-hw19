import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserNav.css';

const UserNav: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <div className="user-nav">
      <div className="user-info">
        <span className="user-email">{user.email}</span>
      </div>
      <button 
        className="btn btn--secondary btn--small"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserNav;
