
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, getDocs, query, where, orderBy, limit, Timestamp, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { app } from './firebase';

import type { Routine, Workout, ExerciseProgress } from './types/workout';
import { PREDEFINED_ROUTINES } from './types/workout';


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


// --- Routine Management ---
export async function createRoutine(userId: string, routine: Omit<Routine, 'id' | 'created_at' | 'updated_at'>) {
  const routinesRef = collection(db, `users/${userId}/routines`);
  const routineRef = doc(routinesRef);
  await setDoc(routineRef, {
    ...routine,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  return routineRef.id;
}

export async function getUserRoutines(userId: string) {
  const routinesRef = collection(db, `users/${userId}/routines`);
  const q = query(routinesRef, orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Routine[];
}

export async function toggleRoutineFavorite(userId: string, routineId: string, isFavorite: boolean) {
  const routineRef = doc(db, `users/${userId}/routines/${routineId}`);
  await updateDoc(routineRef, { is_favorite: isFavorite });
}

// --- Workout Management ---
export async function createWorkout(userId: string, workout: Omit<Workout, 'id'>) {
  const workoutsRef = collection(db, `users/${userId}/workouts`);
  const workoutRef = doc(workoutsRef);
  await setDoc(workoutRef, {
    ...workout,
    start_time: workout.start_time || serverTimestamp()
  });
  return workoutRef.id;
}

export async function finishWorkout(userId: string, workoutId: string, endTime: Date, durationSeconds: number) {
  const workoutRef = doc(db, `users/${userId}/workouts/${workoutId}`);
  await updateDoc(workoutRef, {
    end_time: Timestamp.fromDate(endTime),
    duration_seconds: durationSeconds,
    status: 'completed',
    updated_at: serverTimestamp()
  });
}

export async function toggleWorkoutFavorite(userId: string, workoutId: string, isFavorite: boolean) {
  const workoutRef = doc(db, `users/${userId}/workouts/${workoutId}`);
  await updateDoc(workoutRef, { is_favorite: isFavorite });
}

// --- Real-Time Set Save ---
import type { Set as WorkoutSet } from './types/workout';
export async function saveSetRealtime(userId: string, workoutId: string, exerciseId: string, set: WorkoutSet) {
  const setsCol = collection(db, `users/${userId}/workouts/${workoutId}/exercises/${exerciseId}/sets`);
  return addDoc(setsCol, set);
}

// --- Progress Tracking ---
export async function updateExerciseProgress(userId: string, progress: Omit<ExerciseProgress, 'id'>) {
  const progressRef = doc(db, `users/${userId}/exercise_progress/${progress.exercise_name}_${progress.date}`);
  await setDoc(progressRef, progress, { merge: true });
}

export async function getExerciseProgress(userId: string, exerciseName: string, startDate: string, endDate: string) {
  const progressRef = collection(db, `users/${userId}/exercise_progress`);
  const q = query(
    progressRef,
    where('exercise_name', '==', exerciseName),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data()) as ExerciseProgress[];
}

// --- Workout History ---
export async function getCompletedWorkouts(userId: string, limitCount = 20) {
  try {
    const workoutsRef = collection(db, `users/${userId}/workouts`);
    // Fetch ordered by start_time and filter completed in-memory to avoid composite index
    const q = query(
      workoutsRef,
      orderBy('start_time', 'desc'), // order by start_time only (no where) to avoid composite index
      limit(limitCount * 2) // fetch extra to account for in-memory filtering
    );
    const snapshot = await getDocs(q);

    const workouts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start_time: data.start_time?.toDate ? data.start_time.toDate() : data.start_time || new Date(),
        end_time: data.end_time?.toDate ? data.end_time.toDate() : data.end_time || null
      } as Workout;
    });

    return workouts
      .filter(w => w.status === 'completed')
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching completed workouts:', error);
    return [];  // Return empty array as fallback
  }
}

export async function getFavoriteWorkouts(userId: string, limitCount = 20) {
  try {
    const workoutsRef = collection(db, `users/${userId}/workouts`);
    // Only query by is_favorite, no orderBy needed
    const q = query(
      workoutsRef,
      where('is_favorite', '==', true),
      limit(limitCount * 2)  // Fetch extra to account for filtering
    );
    const snapshot = await getDocs(q);
    
    // Filter completed workouts and sort by start_time in memory
    const workouts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start_time: data.start_time?.toDate() || new Date(),
        end_time: data.end_time?.toDate() || null
      } as Workout;
    });

    return workouts
      .filter(workout => workout.status === 'completed')
      .sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
      .slice(0, limitCount);  // Limit to requested count
  } catch (error) {
    console.error('Error fetching favorite workouts:', error);
    return [];  // Return empty array as fallback
  }
}

// --- AI Suggestions ---
export async function updateAISuggestions(userId: string, workoutId: string, suggestions: string[]) {
  const workoutRef = doc(db, `users/${userId}/workouts/${workoutId}`);
  await updateDoc(workoutRef, { ai_suggestions: suggestions });
}

// --- Predefined Routines Initialization ---
export async function initializePredefinedRoutines(userId: string) {
  const routinesRef = collection(db, `users/${userId}/routines`);
  // Fetch existing predefined routines by name
  const existingSnapshot = await getDocs(routinesRef);
  const existingNames = new Set(
    existingSnapshot.docs
      .filter(doc => doc.data().type === 'predefined')
      .map(doc => doc.data().name)
  );
  const batch = writeBatch(db);
  PREDEFINED_ROUTINES.forEach((routine) => {
    if (!existingNames.has(routine.name)) {
      const routineRef = doc(routinesRef);
      batch.set(routineRef, {
        ...routine,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }
  });
  await batch.commit();
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}

// Merge updates into the user profile document
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, updates, { merge: true });
}