import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import ProfilePage from '@/components/ProfilePage';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const { currentView, user } = useAppContext();
  const navigate = useNavigate();

  // Redirect to dashboard if user is logged in
  React.useEffect(() => {
    if (user && currentView === 'home') {
      navigate('/dashboard');
    }
  }, [user, currentView, navigate]);

  // Handle profile view
  if (currentView === 'profile' && user) {
    return (
      <ProfilePage 
        userEmail={user.email || ''} 
        onBack={() => navigate('/dashboard')} 
      />
    );
  }

  // Handle dashboard view
  if (currentView === 'dashboard' && user) {
    return <Dashboard />;
  }

  return <AppLayout />;
};

export default Index;