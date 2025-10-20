
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { app } from './firebase';

const db = getFirestore(app);

// --- Types ---
export interface UserProfile {
  name: string;
  email: string;
  profile_pic_url: string;
  height_cm: string; // 'n/a' or number as string
  weight_kg: string; // 'n/a' or number as string
  goal: string; // 'n/a' or muscle_gain | fat_loss | endurance
  experience_level: string; // 'n/a' or beginner | intermediate | advanced
  last_1rm?: Record<string, number>;
}

export interface Workout {
  title: string;
  start_time: string; // ISO string
  end_time: string | null;
  duration_seconds: number;
  notes: string;
}

export interface Exercise {
  exercise_ref: string; // e.g. "exercise_catalog/bench_press"
  superset_id: string | null;
  notes: string;
}

export interface SetData {
  set_index: number;
  set_type: string;
  weight_lbs: number;
  reps: number;
  rpe: number;
  distance_miles?: number | null;
  duration_seconds?: number | null;
}

export interface ProgressHistory {
  date: string; // ISO string
  metrics: Record<string, { one_rep_max: number; volume_lifted: number }>;
  total_duration: number;
}

export interface CustomExercise {
  exercise_title: string;
  muscle_groups: string[];
  equipment: string;
}

// --- User Profile Creation ---
export async function initializeUserInFirestore(user: User) {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) return;

  const initialUserData: UserProfile = {
    name: user.displayName || '',
    email: user.email || '',
    profile_pic_url: user.photoURL || '',
    height_cm: 'n/a',
    weight_kg: 'n/a',
    goal: 'n/a',
    experience_level: 'n/a',
    last_1rm: {}
  };

  await setDoc(userDocRef, initialUserData);
}

// --- Helper Functions for Subcollections ---
export async function addWorkout(userId: string, workout: Workout) {
  const workoutsCol = collection(db, `users/${userId}/workouts`);
  return addDoc(workoutsCol, workout);
}

export async function addExercise(userId: string, workoutId: string, exercise: Exercise) {
  const exercisesCol = collection(db, `users/${userId}/workouts/${workoutId}/exercises`);
  return addDoc(exercisesCol, exercise);
}

export async function addSet(userId: string, workoutId: string, exerciseId: string, set: SetData) {
  const setsCol = collection(db, `users/${userId}/workouts/${workoutId}/exercises/${exerciseId}/sets`);
  return addDoc(setsCol, set);
}

export async function addProgressHistory(userId: string, entry: ProgressHistory) {
  const progressCol = collection(db, `users/${userId}/progress_history`);
  return addDoc(progressCol, entry);
}

export async function addCustomExercise(userId: string, exercise: CustomExercise) {
  const customCol = collection(db, `users/${userId}/custom_exercises`);
  return addDoc(customCol, exercise);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}