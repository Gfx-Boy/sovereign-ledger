import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface EmailConfig {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SITE_URL?: string;
  MAILER_AUTOCONFIRM?: string;
  DISABLE_SIGNUP?: string;
}

interface DebugResponse {
  message: string;
  email: string;
  config: EmailConfig;
  timestamp: string;
}

export default function EmailDebugger() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkEmailConfig = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        'https://pcsxikfvpunrkhfnauqr.supabase.co/functions/v1/dc77ca15-2627-4a4d-8ef6-bd41ede7709c',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Configuration Debugger</CardTitle>
        <CardDescription>
          Check Supabase email configuration to diagnose email delivery issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={checkEmailConfig} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Check Config
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Configuration check completed at {new Date(result.timestamp).toLocaleString()}
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Email Configuration:</h3>
              <div className="space-y-1 text-sm">
                <div><strong>SMTP Host:</strong> {result.config.SMTP_HOST || 'Not configured'}</div>
                <div><strong>SMTP Port:</strong> {result.config.SMTP_PORT || 'Not configured'}</div>
                <div><strong>SMTP User:</strong> {result.config.SMTP_USER || 'Not configured'}</div>
                <div><strong>SMTP Password:</strong> {result.config.SMTP_PASS || 'Not configured'}</div>
                <div><strong>Site URL:</strong> {result.config.SITE_URL || 'Not configured'}</div>
                <div><strong>Auto Confirm:</strong> {result.config.MAILER_AUTOCONFIRM || 'false'}</div>
                <div><strong>Signup Disabled:</strong> {result.config.DISABLE_SIGNUP || 'false'}</div>
              </div>
            </div>
            
            <Alert variant={result.config.SMTP_HOST ? 'default' : 'destructive'}>
              <AlertDescription>
                {result.config.SMTP_HOST 
                  ? 'SMTP configuration appears to be set up. If emails are not being received, check your email provider settings or spam folder.'
                  : 'SMTP configuration is missing! This is likely why emails are not being sent. You need to configure SMTP settings in your Supabase project.'
                }
              </AlertDescription>
            </Alert>

            {!result.config.SMTP_HOST && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How to configure SMTP in Supabase:</h4>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to Authentication &gt; Settings</li>
                  <li>Scroll down to SMTP Settings</li>
                  <li>Configure your email provider (Gmail, SendGrid, etc.)</li>
                  <li>Save the settings and test email delivery</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}