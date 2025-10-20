import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { app } from './firebase';

const db = getFirestore(app);

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  profile_pic_url: string;
  height_cm: number;
  weight_kg: number;
  goal: 'muscle_gain' | 'fat_loss' | 'endurance';
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  streak_days: number;
  last_workout_date: Date | null;
  last_1rm: Record<string, number>;
}

export async function initializeUserInFirestore(user: User) {
  const userDocRef = doc(db, 'users', user.uid);
  
  // Check if user document already exists
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return;
  }

  // Create initial user profile
  const initialUserData: UserProfile = {
    userId: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    profile_pic_url: user.photoURL || '',
    height_cm: 0,
    weight_kg: 0,
    goal: 'muscle_gain',
    experience_level: 'beginner',
    streak_days: 0,
    last_workout_date: null,
    last_1rm: {}
  };

  // Create collections and initial documents
  await Promise.all([
    // Create user profile
    setDoc(userDocRef, initialUserData),
    
    // Initialize progress history with empty document
    setDoc(doc(db, 'progress_history', user.uid), {
      entries: []
    }),
    
    // Initialize custom exercises collection
    setDoc(doc(db, `users/${user.uid}/custom_exercises`, 'info'), {
      count: 0
    })
  ]);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
}