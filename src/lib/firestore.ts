
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, getDocs, query, where, orderBy, limit, Timestamp, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { app } from './firebase';

import type { Routine, Workout, ExerciseProgress } from './types/workout';
import { PREDEFINED_ROUTINES } from './types/workout';
import type { ExerciseHistory, GlobalExercise, GlobalRoutine } from './types/schema';


const db = getFirestore(app);

// --- Types ---
// Existing user profile type, extended with new fields from the schema plan.
export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'mi';
  defaultRestTimer: number;   // seconds
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
  totalWorkouts: number;
  totalVolume: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: Date;
}

export interface UserProfile {
  // Legacy fields (already used throughout the app)
  name: string;
  email: string;
  profile_pic_url: string;
  height_cm: string; // 'n/a' or number as string
  weight_kg: string; // 'n/a' or number as string
  goal: string; // 'n/a' or muscle_gain | fat_loss | endurance
  experience_level: string; // 'n/a' or beginner | intermediate | advanced
  last_1rm?: Record<string, number>;

  // New fields (optional for backward compatibility)
  displayName?: string;
  avatarUrl?: string;
  isPro?: boolean;
  proExpiresAt?: Date;
  preferences?: UserPreferences;
  stats?: UserStats;
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
    last_1rm: {},
    // seed new fields with sane defaults
    displayName: user.displayName || '',
    avatarUrl: user.photoURL || '',
    isPro: false,
    preferences: {
      weightUnit: 'kg',
      distanceUnit: 'km',
      defaultRestTimer: 60,
      theme: 'dark',
    },
    stats: {
      totalWorkouts: 0,
      totalVolume: 0,
      currentStreak: 0,
      longestStreak: 0,
      // lastWorkoutDate is optional, omit it from initial data (Firestore doesn't allow undefined)
    },
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

/**
 * Clone a global routine to user's routines collection.
 * Converts GlobalRoutine (with RoutineExercise[]) to Routine (with Exercise[]).
 * Fetches exercise names from global_exercises when available.
 */
export async function cloneGlobalRoutineToUser(userId: string, globalRoutine: GlobalRoutine): Promise<string> {
  const routinesRef = collection(db, `users/${userId}/routines`);
  const routineRef = doc(routinesRef);
  
  // Fetch exercise details from global_exercises for all exercises in the routine
  const exercisePromises = globalRoutine.exercises.map(routineEx => 
    getGlobalExercise(routineEx.exerciseId).catch(() => null)
  );
  const exerciseDetails = await Promise.all(exercisePromises);
  
  // Convert RoutineExercise[] to Exercise[]
  const exercises: Exercise[] = globalRoutine.exercises.map((routineEx, index) => {
    const exerciseDetail = exerciseDetails[index];
    
    // Parse reps - handle both number and string (e.g., "8-12", "AMRAP")
    const repsValue = typeof routineEx.reps === 'string' 
      ? parseInt(routineEx.reps.split('-')[0]) || 8  // Use first number if range
      : routineEx.reps;
    
    // Create sets array with default values
    const sets: Set[] = Array(routineEx.sets).fill(null).map(() => ({
      weight_kg: 0,
      reps: repsValue,
      completed: false,
      saved_at: new Date()
    }));
    
    return {
      id: routineEx.exerciseId,
      name: exerciseDetail?.name || routineEx.exerciseId, // Use fetched name or fallback to ID
      category: exerciseDetail?.primaryMuscle || 'General', // Use primary muscle as category
      sets,
      break_seconds: routineEx.restAfter || 60, // Use restAfter as break_seconds
      is_warmup: false
    };
  });
  
  // Create user routine with source tracking
  const userRoutine: Omit<Routine, 'id' | 'created_at' | 'updated_at'> = {
    name: globalRoutine.name,
    type: 'predefined', // Mark as predefined since it's cloned from global
    description: globalRoutine.description || '',
    is_favorite: false,
    favorite_count: 0,
    exercises
  };
  
  await setDoc(routineRef, {
    ...userRoutine,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    // Add source tracking fields (for future migration)
    sourceType: 'global',
    sourceId: globalRoutine.routineId
  });
  
  return routineRef.id;
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

export async function finishWorkout(
  userId: string, 
  workoutId: string, 
  endTime: Date, 
  durationSeconds: number,
  totalVolume?: number,
  totalReps?: number,
  totalSets?: number
) {
  const workoutRef = doc(db, `users/${userId}/workouts/${workoutId}`);
  const updateData: Record<string, any> = {
    end_time: Timestamp.fromDate(endTime),
    duration_seconds: durationSeconds,
    status: 'completed',
    updated_at: serverTimestamp()
  };
  
  // Add new metrics if provided (for gradual migration)
  if (totalVolume !== undefined) updateData.totalVolume = totalVolume;
  if (totalReps !== undefined) updateData.totalReps = totalReps;
  if (totalSets !== undefined) updateData.totalSets = totalSets;
  
  // Add date field for daily aggregations (YYYY-MM-DD format)
  const dateStr = endTime.toISOString().split('T')[0];
  updateData.date = dateStr;
  
  await updateDoc(workoutRef, updateData);
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

// ---------------------------------------------------------------------------
// Global Collections Helpers (New Schema)
// ---------------------------------------------------------------------------

/**
 * Fetch all active global exercises from Firestore
 * Falls back to empty array if collection doesn't exist or query fails
 */
export async function getGlobalExercises(): Promise<GlobalExercise[]> {
  try {
    const exercisesRef = collection(db, 'global_exercises');
    const q = query(exercisesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      exerciseId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as GlobalExercise[];
  } catch (error) {
    console.warn('Error fetching global exercises, falling back to empty array:', error);
    return [];
  }
}

/**
 * Fetch a single global exercise by ID
 */
export async function getGlobalExercise(exerciseId: string): Promise<GlobalExercise | null> {
  try {
    const exerciseRef = doc(db, 'global_exercises', exerciseId);
    const exerciseDoc = await getDoc(exerciseRef);
    if (!exerciseDoc.exists()) return null;
    return {
      exerciseId: exerciseDoc.id,
      ...exerciseDoc.data(),
      createdAt: exerciseDoc.data().createdAt?.toDate() || new Date(),
    } as GlobalExercise;
  } catch (error) {
    console.error('Error fetching global exercise:', error);
    return null;
  }
}

/**
 * Fetch all global routines from Firestore
 * Falls back to empty array if collection doesn't exist or query fails
 */
export async function getGlobalRoutines(): Promise<GlobalRoutine[]> {
  try {
    const routinesRef = collection(db, 'global_routines');
    const snapshot = await getDocs(routinesRef);
    return snapshot.docs.map(doc => ({
      routineId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as GlobalRoutine[];
  } catch (error) {
    console.warn('Error fetching global routines, falling back to empty array:', error);
    return [];
  }
}

/**
 * Fetch a single global routine by ID
 */
export async function getGlobalRoutine(routineId: string): Promise<GlobalRoutine | null> {
  try {
    const routineRef = doc(db, 'global_routines', routineId);
    const routineDoc = await getDoc(routineRef);
    if (!routineDoc.exists()) return null;
    return {
      routineId: routineDoc.id,
      ...routineDoc.data(),
      createdAt: routineDoc.data().createdAt?.toDate() || new Date(),
    } as GlobalRoutine;
  } catch (error) {
    console.error('Error fetching global routine:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Exercise History Helpers (New Schema)
// ---------------------------------------------------------------------------

/**
 * Fetch a single exercise_history document by exerciseId (document ID).
 */
export async function getExerciseHistoryById(userId: string, exerciseId: string): Promise<ExerciseHistory | null> {
  try {
    const historyRef = doc(db, `users/${userId}/exercise_history/${exerciseId}`);
    const historyDoc = await getDoc(historyRef);
    if (!historyDoc.exists()) return null;
    const data = historyDoc.data() as any;
    return {
      exerciseId: historyDoc.id,
      ...data,
      lastPerformed: data.lastPerformed?.toDate ? data.lastPerformed.toDate() : data.lastPerformed || new Date(),
    } as ExerciseHistory;
  } catch (error) {
    console.error('Error fetching exercise history by id:', error);
    return null;
  }
}

/**
 * Fetch exercise_history by exerciseName (non-breaking bridge while UI still selects by name).
 * Returns the first match (names are expected to be unique in MVP).
 */
export async function getExerciseHistoryByName(userId: string, exerciseName: string): Promise<ExerciseHistory | null> {
  try {
    const historyCol = collection(db, `users/${userId}/exercise_history`);
    const q = query(historyCol, where('exerciseName', '==', exerciseName), limit(1));
    const snapshot = await getDocs(q);
    const first = snapshot.docs[0];
    if (!first) return null;
    const data = first.data() as any;
    return {
      exerciseId: first.id,
      ...data,
      lastPerformed: data.lastPerformed?.toDate ? data.lastPerformed.toDate() : data.lastPerformed || new Date(),
    } as ExerciseHistory;
  } catch (error) {
    console.warn('Error fetching exercise history by name (fallback to legacy progress):', error);
    return null;
  }
}
