'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProviderIcon from '@/components/ui/provider-icon';
import { signInWithEmail, signInWithGoogle, signUpWithEmail, auth } from '@/lib/firebase';
import { initializeUserInFirestore } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Initialize user data in Firestore
        await initializeUserInFirestore(user);
        // Redirect to home page
        router.push('/main/home');
      }
    });

    return () => unsubscribe();
  }, [router]);
  const [email, setEmail] = useState('');
  // password is optional for initial sign-in (magic link / passwordless flow)
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
      // on success: redirect or show toast (left as TODO)
    } catch {
      // If not found, try sign up fallback
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full">
        <header className="flex items-center gap-4 mb-6">
          <button aria-label="back" className="text-2xl">←</button>
          <h1 className="flex-1 text-center text-3xl font-bold">Sign In</h1>
        </header>

        <form onSubmit={handleContinue} className="bg-white rounded-2xl p-6 shadow-sm">
          <Input
            label="Email Address"
            placeholder="Enter email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Continue'}
            </Button>
          </div>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account? <a className="font-medium text-gray-800">Create Account</a>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="text-gray-400 text-sm">Or</div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button type="button" onClick={handleGoogle} aria-label="google" className="p-0">
              <ProviderIcon provider="google" />
            </button>
            <button type="button" aria-label="apple" className="p-0">
              <ProviderIcon provider="apple" />
            </button>
            <button type="button" aria-label="facebook" className="p-0">
              <ProviderIcon provider="facebook" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
