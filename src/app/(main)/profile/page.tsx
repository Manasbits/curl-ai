'use client'
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { type UserProfile } from '@/lib/firestore';
import { useUpdateProfile } from '@/hooks/use-profile';
import { ErrorBoundary } from '@/components/error-boundary';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Camera, User, Mail, Ruler, Scale, Target, Zap, Save } from 'lucide-react';

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const updateProfile = useUpdateProfile();
  const [saving, setSaving] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const { user } = useAuth();

  useEffect(() => {
    setEditableProfile(profile ? { ...profile } : null);
  }, [profile]);

  useEffect(() => {
    // Only redirect if user is not authenticated (not just missing profile)
    // New users might not have profile yet, but they're still authenticated
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }
  
  // If user is authenticated but profile hasn't loaded yet, show loading
  // This can happen briefly after sign-in while profile is being created
  if (user && !profile && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
        <p className="text-muted-foreground ml-3">Loading profile...</p>
      </div>
    );
  }
  
  // If no user at all, redirect will happen in useEffect
  if (!user) {
    return null;
  }
  
  // If profile still doesn't exist after loading, create a default one
  if (!editableProfile && user) {
    // Create a default profile structure
    const defaultProfile: UserProfile = {
      name: user.displayName || '',
      email: user.email || '',
      profile_pic_url: user.photoURL || '',
      height_cm: 'n/a',
      weight_kg: 'n/a',
      goal: 'n/a',
      experience_level: 'n/a',
    };
    setEditableProfile(defaultProfile);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  async function handleSave() {
    if (!editableProfile) return;
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    setSaving(true);
    updateProfile.mutate(
      { userId: uid, updates: {
        height_cm: editableProfile.height_cm,
        weight_kg: editableProfile.weight_kg,
        goal: editableProfile.goal,
        experience_level: editableProfile.experience_level,
        profile_pic_url: editableProfile.profile_pic_url,
      }},
      {
        onSuccess: () => setSaving(false),
        onError: (err) => {
          setSaving(false);
          console.error('Failed to save', err);
        },
      }
    );
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setEditableProfile((p) => (p ? { ...p, profile_pic_url: result } : p));
    };
    reader.readAsDataURL(file);
  }

  const goals = [
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { value: 'fat_loss', label: 'Fat Loss', icon: '🔥' },
    { value: 'endurance', label: 'Endurance', icon: '🏃' },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="page-header flex items-center gap-4">
          <button
            onClick={() => router.push('/home')}
            className="icon-btn w-10 h-10"
            aria-label="Back to home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title flex-1 text-center pr-10">Profile</h1>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-md mx-auto space-y-6 animate-fade-in-up">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden flex items-center justify-center border-2 border-[rgba(255,255,255,0.1)]">
                  {editableProfile?.profile_pic_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={editableProfile.profile_pic_url} 
                      alt="profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <Camera className="w-6 h-6 text-white" />
                  <input 
                    onChange={onFileChange} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                  />
                </label>
              </div>
              <button 
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                className="text-sm text-primary mt-3 hover:underline"
              >
                Change photo
              </button>
            </div>

            {/* Profile Info Card */}
            <Card>
              <div className="space-y-4">
                {/* Name & Email (Read-only) */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-foreground font-medium">{editableProfile?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium">{editableProfile?.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="divider" />

                {/* Editable Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Height"
                    value={editableProfile?.height_cm || ''}
                    onChange={(e) => setEditableProfile((p) => p ? { ...p, height_cm: e.target.value } : p)}
                    placeholder="cm"
                    icon={<Ruler className="w-4 h-4" />}
                  />
                  <Input
                    label="Weight"
                    value={editableProfile?.weight_kg || ''}
                    onChange={(e) => setEditableProfile((p) => p ? { ...p, weight_kg: e.target.value } : p)}
                    placeholder="kg"
                    icon={<Scale className="w-4 h-4" />}
                  />
                </div>
              </div>
            </Card>

            {/* Goal Selection */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Fitness Goal</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setEditableProfile((p) => p ? { ...p, goal: g.value } : p)}
                    className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                      editableProfile?.goal === g.value
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-muted-foreground hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{g.icon}</span>
                    <span className="text-xs font-medium">{g.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Experience Level */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Experience Level</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {levels.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setEditableProfile((p) => p ? { ...p, experience_level: lvl.value } : p)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                      editableProfile?.experience_level === lvl.value
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-muted-foreground hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving || updateProfile.isPending}
              className="w-full"
              size="lg"
            >
              {saving || updateProfile.isPending ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
