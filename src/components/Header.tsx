import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search, Users, Shield, Book } from 'lucide-react';
import AuthButtons from './AuthButtons';
import MobileNav from './MobileNav';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  currentView: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base';
  onViewChange: (view: 'upload' | 'search' | 'home' | 'dashboard' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base') => void;
  onHomeClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onViewChange, 
  onHomeClick,
  onLoginClick,
  onSignupClick
}) => {
  const { setCurrentView, user, isTrustee } = useAppContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleHomeClick = () => {
    setCurrentView('home');
    navigate('/');
  };

  const handleDashboardClick = () => {
    setCurrentView('dashboard');
    navigate('/dashboard');
  };

  const handleSearchClick = () => {
    setCurrentView('search');
    if (currentView === 'dashboard') {
      navigate('/');
      setTimeout(() => {
        onViewChange('search');
      }, 100);
    } else {
      onViewChange('search');
    }
  };

  const handleKnowledgeBaseClick = () => {
    setCurrentView('knowledge-base');
    navigate('/knowledge-base');
  };

  const handleRecordClick = () => {
    if (user) {
      setCurrentView('upload');
      if (currentView === 'dashboard') {
        navigate('/');
        setTimeout(() => {
          onViewChange('upload');
        }, 100);
      } else {
        onViewChange('upload');
      }
    } else {
      navigate('/login');
    }
  };

  const handleTrusteeUploadClick = () => {
    setCurrentView('trustee-upload');
    if (currentView === 'dashboard') {
      navigate('/');
      setTimeout(() => {
        onViewChange('trustee-upload');
      }, 100);
    } else {
      onViewChange('trustee-upload');
    }
  };

  const handleTrusteeDashboardClick = () => {
    setCurrentView('trustee-dashboard');
    if (currentView === 'dashboard') {
      navigate('/');
      setTimeout(() => {
        onViewChange('trustee-dashboard');
      }, 100);
    } else {
      onViewChange('trustee-dashboard');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-4">
        {isMobile ? (
          <div className="flex flex-col items-center space-y-4">
            {/* Logo centered on top */}
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/6861f3c0c0cbadd2708caff8_1751650684187_b3ba2cc2.png" 
                alt="Sovereign Ledger Logo" 
                className="h-12 w-auto"
              />
            </button>
            
            {/* Navigation menu centered below logo */}
            <div className="flex items-center justify-center w-full space-x-4">
              <AuthButtons 
                onLoginClick={onLoginClick}
                onSignupClick={onSignupClick}
              />
              
              <MobileNav 
                currentView={currentView}
                onViewChange={onViewChange}
                onHomeClick={onHomeClick}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/6861f3c0c0cbadd2708caff8_1751650684187_b3ba2cc2.png" 
                alt="Sovereign Ledger Logo" 
                className="h-12 sm:h-16 w-auto"
              />
            </button>
            
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2 lg:gap-4">
                {!user && (
                  <Button
                    variant={currentView === 'home' ? 'default' : 'ghost'}
                    onClick={handleHomeClick}
                    className={`text-sm ${currentView === 'home' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'hover:bg-amber-100 hover:text-amber-800'}`}
                  >
                    Home
                  </Button>
                )}
                
                <Button
                  variant={currentView === 'search' ? 'default' : 'ghost'}
                  onClick={handleSearchClick}
                  className={`text-sm ${currentView === 'search' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'hover:bg-amber-100 hover:text-amber-800'}`}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                
                <Button
                  variant={currentView === 'knowledge-base' ? 'default' : 'ghost'}
                  onClick={handleKnowledgeBaseClick}
                  className={`text-sm ${currentView === 'knowledge-base' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'hover:bg-amber-100 hover:text-amber-800'}`}
                >
                  <Book className="mr-2 h-4 w-4" />
                  FAQ
                </Button>
                
                {user && (
                  <>
                    {!isTrustee && (
                      <>
                        <Button
                          variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                          onClick={handleDashboardClick}
                          className={`text-sm ${currentView === 'dashboard' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'hover:bg-amber-100 hover:text-amber-800'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button
                          variant={currentView === 'upload' ? 'default' : 'ghost'}
                          onClick={handleRecordClick}
                          className={`text-sm ${currentView === 'upload' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'hover:bg-amber-100 hover:text-amber-800'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Record
                        </Button>
                      </>
                    )}
                    {isTrustee && (
                      <>
                        <Button
                          variant={currentView === 'trustee-upload' ? 'default' : 'ghost'}
                          onClick={handleTrusteeUploadClick}
                          className={`text-sm ${currentView === 'trustee-upload' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-100 hover:text-blue-800'}`}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                        <Button
                          variant={currentView === 'trustee-dashboard' ? 'default' : 'ghost'}
                          onClick={handleTrusteeDashboardClick}
                          className={`text-sm ${currentView === 'trustee-dashboard' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-100 hover:text-blue-800'}`}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </>
                    )}
                  </>
                )}
              </nav>
              
              <AuthButtons 
                onLoginClick={onLoginClick}
                onSignupClick={onSignupClick}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;