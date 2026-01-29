import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useAppContext } from '@/contexts/AppContext';

interface AuthButtonsProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onLoginClick, onSignupClick }) => {
  const { user, setCurrentView, refreshProfile } = useAppContext();

  const handleViewProfile = async () => {
    await refreshProfile();
    setCurrentView('profile');
  };

  const handleLogout = () => {
    // This is handled by ProfileDropdown using the centralized logout
  };

  if (user) {
    return (
      <ProfileDropdown
        userEmail={user.email || ''}
        onViewProfile={handleViewProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={onLoginClick}
        className="text-sm hover:bg-amber-100 hover:text-amber-800"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
      <Button
        onClick={onSignupClick}
        className="text-sm bg-amber-600 hover:bg-amber-700 text-white"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;