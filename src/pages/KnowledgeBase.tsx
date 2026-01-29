import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KnowledgeBase from '@/components/KnowledgeBase';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const KnowledgeBasePage: React.FC = () => {
  const { setCurrentView, showLogin, setShowLogin, showSignup, setShowSignup } = useAppContext();
  const navigate = useNavigate();

  const handleViewChange = (view: 'upload' | 'search' | 'home' | 'dashboard' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base') => {
    setCurrentView(view);
    if (view === 'home') {
      navigate('/');
    } else if (view === 'search') {
      navigate('/');
      // Trigger search view on home page
      setTimeout(() => {
        setCurrentView('search');
      }, 100);
    }
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentView="knowledge-base"
        onViewChange={handleViewChange}
        onHomeClick={handleHomeClick}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <main className="flex-1">
        <KnowledgeBase />
      </main>
      <Footer />
      
      {showLogin && (
        <LoginForm onClose={handleLoginClose} />
      )}
      
      {showSignup && (
        <SignupForm onClose={handleSignupClose} />
      )}
    </div>
  );
};

export default KnowledgeBasePage;