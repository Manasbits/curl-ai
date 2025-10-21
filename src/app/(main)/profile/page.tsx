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

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const updateProfile = useUpdateProfile();
  const [saving, setSaving] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // initialize local editable copy when context profile changes
    setEditableProfile(profile ? { ...profile } : null);
  }, [profile]);

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/');
    }
  }, [loading, profile, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!editableProfile) return <div className="p-6">No profile found.</div>;

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="p-4 bg-white border-b flex items-center">
          <button
            onClick={() => router.push('/home')}
            aria-label="Back to home"
            className="mr-4 text-2xl"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-xl font-semibold">Profile</h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {editableProfile?.profile_pic_url ? (
                  // using native img for data URL simplicity
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editableProfile.profile_pic_url} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">No Photo</div>
                )}
              </div>
              <label className="text-sm text-gray-600 cursor-pointer">
                <input onChange={onFileChange} type="file" accept="image/*" className="hidden" />
                <span className="underline">Change profile photo</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <div className="mt-1 text-sm text-gray-800">{editableProfile?.name || '—'}</div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <div className="mt-1 text-sm text-gray-800">{editableProfile?.email || '—'}</div>
                </div>

                <div>
                  <Input
                    label="Height (cm)"
                    value={editableProfile?.height_cm || ''}
                    onChange={(e) => setEditableProfile((p) => p ? { ...p, height_cm: e.target.value } : p)}
                  />
                </div>

                <div>
                  <Input
                    label="Weight (kg)"
                    value={editableProfile?.weight_kg || ''}
                    onChange={(e) => setEditableProfile((p) => p ? { ...p, weight_kg: e.target.value } : p)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Goal</label>
                  <div className="mt-2 flex gap-2">
                    {['muscle_gain', 'fat_loss', 'endurance'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditableProfile((p) => p ? { ...p, goal: g } : p)}
                        className={`px-3 py-2 rounded-lg border ${editableProfile?.goal === g ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                      >
                        {g === 'muscle_gain' ? 'Muscle Gain' : g === 'fat_loss' ? 'Fat Loss' : 'Endurance'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Experience Level</label>
                  <div className="mt-2 flex gap-2">
                    {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEditableProfile((p) => p ? { ...p, experience_level: lvl } : p)}
                        className={`px-3 py-2 rounded-lg border ${editableProfile?.experience_level === lvl ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                      >
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Button onClick={handleSave} disabled={saving || updateProfile.isPending}>
                    {saving || updateProfile.isPending ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
