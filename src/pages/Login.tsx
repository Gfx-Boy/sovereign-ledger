import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/utils/supabaseUtils';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, authInitialized } = useAppContext();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (authInitialized && user) {
      console.log('Login: User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [authInitialized, user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Login error:', authError);
        throw authError;
      }

      console.log('Login successful:', data.user?.email);
      
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      });

      // Navigate to dashboard - auth state change will handle the user state
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string, userRole: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting signup for:', email);

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please wait a moment and try again.');
        }
        throw authError;
      }

      if (data.user) {
        console.log('Signup successful:', data.user.email);
        
        // Create user profile
        const profileResult = await createUserProfile(data.user.id, email, name, userRole);
        if (!profileResult.success) {
          console.error('Failed to create user profile:', profileResult.error);
        }

        toast({
          title: 'Success',
          description: 'Account created successfully!',
        });

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    toast({
      title: 'Password Reset',
      description: 'Password reset functionality coming soon!',
    });
  };

  // Show loading while checking auth
  if (!authInitialized) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => setMode('signup')}
              onForgotPassword={handleForgotPassword}
              loading={loading}
              error={error}
            />
          ) : (
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setMode('login')}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;