'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProviderIcon from '@/components/ui/provider-icon';
import { signInWithEmail, signInWithGoogle, signUpWithEmail, auth } from '@/lib/firebase';
import { initializeUserInFirestore } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await initializeUserInFirestore(user);
        } catch (error) {
          console.error('Error initializing user:', error);
          // Don't block navigation if initialization fails
        }
        router.push('/home');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const [email, setEmail] = useState('');
  const [password] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getMessage(err: unknown) {
    if (!err) return 'An unknown error occurred';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch {
      try {
        await signUpWithEmail(email, password || Math.random().toString(36).slice(2, 10));
      } catch (err2: unknown) {
        setError(getMessage(err2));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(getMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in-up">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 mb-6 shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">CurlAI</h1>
          <p className="text-muted-foreground text-lg">Your AI-powered gym companion</p>
        </div>

        {/* Sign In Form */}
        <div className="glass-card p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleContinue} className="space-y-6">
            <Input
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
            />

            <Button 
              type="submit" 
              disabled={loading || !email} 
              className="w-full"
              size="lg"
            >
              {loading ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                {error}
              </div>
            )}
          </form>

          <div className="divider-text my-8">
            <span>Or continue with</span>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="icon-btn w-14 h-14"
              aria-label="Sign in with Google"
            >
              <ProviderIcon provider="google" />
            </button>
            <button
              type="button"
              disabled={loading}
              className="icon-btn w-14 h-14 opacity-50 cursor-not-allowed"
              aria-label="Sign in with Apple (coming soon)"
            >
              <ProviderIcon provider="apple" />
            </button>
            <button
              type="button"
              disabled={loading}
              className="icon-btn w-14 h-14 opacity-50 cursor-not-allowed"
              aria-label="Sign in with Facebook (coming soon)"
            >
              <ProviderIcon provider="facebook" />
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
