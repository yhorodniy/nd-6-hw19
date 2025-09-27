import React from 'react'
import { Link } from 'react-router-dom'

const Error: React.FC<{ message: string, isShowBack?: boolean }> = ({ message, isShowBack = false }) => {
  return (
    <div className="home-page">
        <div className="error">{message}</div>
        {isShowBack && (
            <Link to="/" className="btn btn--secondary">
                ← Back to list
            </Link>
        )}
    </div>
  )
}

export default Error
