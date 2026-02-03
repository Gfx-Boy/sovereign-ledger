import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  currentView: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base';
  setCurrentView: (view: 'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base') => void;
  refreshProfile: () => Promise<void>;
  isTrustee: boolean;
  logout: () => Promise<void>;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showSignup: boolean;
  setShowSignup: (show: boolean) => void;
  authInitialized: boolean;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  user: null,
  setUser: () => {},
  userProfile: null,
  setUserProfile: () => {},
  currentView: 'home',
  setCurrentView: () => {},
  refreshProfile: async () => {},
  isTrustee: false,
  logout: async () => {},
  showLogin: false,
  setShowLogin: () => {},
  showSignup: false,
  setShowSignup: () => {},
  authInitialized: false,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'search' | 'certificate' | 'dashboard' | 'profile' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base'>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const mountedRef = useRef(true);
  const authInitializedRef = useRef(false);

  const isTrustee = userProfile?.user_role === 'trustee';

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data && mountedRef.current) {
        console.log('User profile loaded:', data);
        setUserProfile(data);
      } else {
        console.log('No user profile found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user && mountedRef.current) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      if (mountedRef.current) {
        setUser(null);
        setUserProfile(null);
        setCurrentView('home');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    const initializeAuth = async () => {
      if (authInitializedRef.current) return;
      
      try {
        console.log('AppContext: Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        if (mountedRef.current) {
          console.log('AppContext: Session check complete, user exists:', !!session?.user);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          authInitializedRef.current = true;
          setAuthInitialized(true);
          console.log('AppContext: Auth initialized');
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setAuthInitialized(true); // Still mark as initialized even on error
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setCurrentView('home');
      } else if (session?.user) {
        setUser(session.user);
        // Reset login/signup modals when user is authenticated
        setShowLogin(false);
        setShowSignup(false);
        await fetchUserProfile(session.user.id);
      }
      
      // Make sure auth is marked as initialized after any auth state change
      if (!authInitializedRef.current) {
        authInitializedRef.current = true;
        setAuthInitialized(true);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        user,
        setUser,
        userProfile,
        setUserProfile,
        currentView,
        setCurrentView,
        refreshProfile,
        isTrustee,
        logout,
        showLogin,
        setShowLogin,
        showSignup,
        setShowSignup,
        authInitialized,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};