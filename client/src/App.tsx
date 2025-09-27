
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import UnauthorizedView from './components/UnauthorizedView/UnauthorizedView';
import HomePage from './pages/HomePage/HomePage';
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';
import PostFormPage from './pages/PostFormPage/PostFormPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute fallback={<UnauthorizedView />}>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post/:id" 
              element={
                <ProtectedRoute fallback={<UnauthorizedView />}>
                  <PostDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute fallback={<UnauthorizedView />}>
                  <PostFormPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <ProtectedRoute fallback={<UnauthorizedView />}>
                  <PostFormPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
