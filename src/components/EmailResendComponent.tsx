import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Mail, Clock } from 'lucide-react';

interface EmailResendComponentProps {
  email: string;
}

const EmailResendComponent: React.FC<EmailResendComponentProps> = ({ email }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage('Confirmation email sent! Please check your inbox.');
      
      // Start cooldown timer
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <Alert className="border-green-200 bg-green-50">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Didn't receive the email? You can request a new one.
        </p>
        
        <Button
          onClick={handleResendEmail}
          disabled={loading || cooldown > 0}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            'Sending...'
          ) : cooldown > 0 ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Resend in {cooldown}s
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Confirmation Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailResendComponent;