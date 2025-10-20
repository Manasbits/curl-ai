'use client'
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      const data = await getUserProfile(user.uid);
      setProfile(data);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6">No profile found.</div>;

  async function handleSave() {
    setSaving(true);
    try {
      if (!profile) return;
      // Merge the profile fields allowed to change
      await updateUserProfile(auth.currentUser!.uid, {
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        goal: profile.goal,
        experience_level: profile.experience_level,
        profile_pic_url: profile.profile_pic_url,
      });
      // optionally show a toast
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      setSaving(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfile((p) => (p ? { ...p, profile_pic_url: result } : p));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b">
        <h1 className="text-center text-xl font-semibold">Profile</h1>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {profile.profile_pic_url ? (
                // using native img for data URL simplicity
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profile_pic_url} alt="profile" className="w-full h-full object-cover" />
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
                <div className="mt-1 text-sm text-gray-800">{profile.name || '—'}</div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Email</label>
                <div className="mt-1 text-sm text-gray-800">{profile.email || '—'}</div>
              </div>

              <div>
                <Input
                  label="Height (cm)"
                  value={profile.height_cm}
                  onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Weight (kg)"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Goal</label>
                <div className="mt-2 flex gap-2">
                  {['muscle_gain', 'fat_loss', 'endurance'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProfile({ ...profile, goal: g })}
                      className={`px-3 py-2 rounded-lg border ${profile.goal === g ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
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
                      onClick={() => setProfile({ ...profile, experience_level: lvl })}
                      className={`px-3 py-2 rounded-lg border ${profile.experience_level === lvl ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
