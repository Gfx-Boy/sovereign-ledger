import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  profile_image_url?: string;
  user_role?: 'individual' | 'trustee';
}

interface AppContextType {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // Auth state
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  authInitialized: boolean;
  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  // View management
  currentView: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base';
  setCurrentView: (view: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base') => void;
  // Modals
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showSignup: boolean;
  setShowSignup: (show: boolean) => void;
  // Computed
  isTrustee: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base'>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const isTrustee = userProfile?.user_role === 'trustee';

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        console.log('Profile loaded:', data);
        setUserProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  // Logout
  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setCurrentView('home');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;
    console.log('AppContext: Starting auth initialization...');

    const initAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (isMounted) {
          console.log('AppContext: Session retrieved:', !!currentSession);
          
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchUserProfile(currentSession.user.id);
          }
          
          setIsLoading(false);
          setAuthInitialized(true);
          console.log('AppContext: Auth initialized, user:', !!currentSession?.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Initialize auth
    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, !!newSession?.user);

        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          setShowLogin(false);
          setShowSignup(false);
          await fetchUserProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setCurrentView('home');
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
          setUser(newSession.user);
        }
        
        // Mark as initialized on any auth event
        if (!authInitialized) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, authInitialized]);

  const value: AppContextType = {
    sidebarOpen,
    toggleSidebar,
    user,
    session,
    userProfile,
    isLoading,
    authInitialized,
    setUser,
    setUserProfile,
    refreshProfile,
    logout,
    currentView,
    setCurrentView,
    showLogin,
    setShowLogin,
    showSignup,
    setShowSignup,
    isTrustee,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};