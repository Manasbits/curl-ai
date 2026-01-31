// Unified schema types for the new Firestore architecture.
// These are based on SCHEMA_MIGRATION_PLAN.md and are intended to guide
// migration of existing collections and documents.
//
// NOTE: Many of these types are not yet fully wired into read/write code.
// During migration we will:
// - Keep legacy types in `workout.ts` for backwards compatibility
// - Gradually move consumers to these richer types
// - Adjust Firestore reads/writes to match the new shapes

// ---------------------------------------------------------------------------
// Global Collections
// ---------------------------------------------------------------------------

// /global_exercises/{exerciseId}
export interface GlobalExercise {
  exerciseId: string;           // document ID
  name: string;                 // "Barbell Bench Press"
  primaryMuscle: string;        // "Chest"
  secondaryMuscles: string[];   // ["Triceps", "Shoulders"]
  equipment: string;            // "Barbell"
  category: 'compound' | 'isolation' | 'cardio';
  defaultSetType: 'weight_reps' | 'bodyweight' | 'duration' | 'distance';

  // SEO / discovery
  aliases: string[];            // ["bench press", "flat bench"]

  // Metadata
  createdAt: Date;
  isActive: boolean;            // soft delete flag
}

// /global_exercises/{exerciseId}/how_to/{locale}
export interface ExerciseGuide {
  locale: string;               // "en", "es", etc.
  steps: string[];
  tips: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  commonMistakes?: string[];
}

// /global_routines/{routineId}
export interface RoutineExercise {
  exerciseId: string;           // reference to GlobalExercise / CustomExercise
  order: number;                // execution order

  // Volume prescription
  sets: number;
  reps: number | string;        // "8-12", "AMRAP"
  intensity?: string;           // "RPE 8", "70% 1RM"

  // Timing
  restBefore: number;           // seconds
  restAfter: number;            // seconds

  // Organization
  supersetId?: string;          // groups exercises into supersets
  notes?: string;               // coach instructions, tempo notes, etc.
}

export interface GlobalRoutine {
  routineId: string;            // document ID
  name: string;
  description: string;
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'powerlifting';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;    // minutes

  exercises: RoutineExercise[];

  // Metadata
  createdAt: Date;
  popularity: number;           // incremented via Cloud Function
  tags: string[];               // ["push", "compound", "barbell"]
}

// ---------------------------------------------------------------------------
// User Document & Subcollections
// ---------------------------------------------------------------------------

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'mi';
  defaultRestTimer: number;     // seconds
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
  totalWorkouts: number;
  totalVolume: number;          // sum of all sets × weight × reps
  currentStreak: number;        // consecutive days
  longestStreak: number;
  lastWorkoutDate?: Date;
}

// /users/{userId}
export interface UserDoc {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;

  // Subscription
  isPro: boolean;
  proExpiresAt?: Date;

  // Preferences & stats (denormalized for fast, offline-friendly reads)
  preferences: UserPreferences;
  stats: UserStats;

  // Metadata
  createdAt: Date;
  lastActiveAt: Date;
}

// /users/{userId}/custom_exercises/{exerciseId}
export interface CustomExercise extends Omit<GlobalExercise, 'isActive' | 'exerciseId' | 'createdAt'> {
  exerciseId: string;           // document ID
  ownerId: string;              // userId
  baseExerciseId?: string;      // if cloned from a global exercise
}

// /users/{userId}/routines/{routineId}
export interface UserRoutine {
  routineId: string;
  name: string;

  // Provenance
  sourceType: 'global' | 'custom' | 'ai_generated';
  sourceId?: string;            // reference to global_routines or AI template

  // Structure aligned with GlobalRoutine
  exercises: RoutineExercise[];

  // User-specific metadata
  lastModified: Date;
  timesCompleted: number;
  createdAt: Date;
  isArchived: boolean;
}

// ---------------------------------------------------------------------------
// Workouts & Logging
// ---------------------------------------------------------------------------

export type WorkoutStatus = 'active' | 'completed' | 'abandoned';

export interface WorkoutSet {
  setId: string;                // UUID for optimistic updates
  setNumber: number;            // 1-indexed
  type: 'normal' | 'warmup' | 'drop' | 'failure';

  // Performance data
  weight?: number;              // undefined/null for bodyweight
  reps: number;
  duration?: number;            // seconds (timed)
  distance?: number;            // meters (cardio)

  // Metadata
  completed: boolean;
  completedAt?: Date;
  rpe?: number;                 // 6–10
  notes?: string;

  // Previous performance (for comparison)
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;         // denormalized
  primaryMuscle: string;        // denormalized

  order: number;
  supersetId?: string;

  sets: WorkoutSet[];

  // Timing
  restBefore: number;
  restAfter: number;
}

// /users/{userId}/workouts/{workoutId}
export interface WorkoutDoc {
  workoutId: string;

  // Temporal
  startTime: Date;
  endTime?: Date;
  duration?: number;            // seconds
  date: string;                 // "YYYY-MM-DD"

  // Source
  routineId?: string;
  name: string;                 // "Push Day A" or routine name

  // Status
  status: WorkoutStatus;

  // Volume metrics
  totalVolume: number;
  totalReps: number;
  totalSets: number;

  // Embedded exercises & sets
  exercises: WorkoutExercise[];

  // Metadata
  notes?: string;
  createdAt: Date;
  modifiedAt: Date;

  // Favorites / AI
  isFavorite?: boolean;
  aiSuggestions?: string[];
}

// ---------------------------------------------------------------------------
// Analytics Collections
// ---------------------------------------------------------------------------

// /users/{userId}/exercise_history/{exerciseId}
export interface PerformanceSnapshot {
  date: string;                 // "YYYY-MM-DD"
  workoutId: string;

  // Best set of the day
  topSet: {
    weight: number;
    reps: number;
    estimated1RM: number;
  };

  // Summary
  totalSets: number;
  totalVolume: number;
  averageRPE?: number;
}

export interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;

  performanceLog: Record<string, PerformanceSnapshot>;

  records: {
    maxWeight: number;
    maxWeightDate: string;
    maxReps: number;
    maxRepsDate: string;
    estimated1RM: number;
    estimated1RMDate: string;
  };

  lastPerformed: Date;
  totalSessions: number;
  totalVolume: number;
}

// /users/{userId}/measurements/{measurementId}
export interface MeasurementDoc {
  measurementId: string;        // "weight", "waist", "body_fat", etc.
  unit: string;                 // "kg", "lbs", "cm", "in", "%"
  data: Record<string, number>; // { "2025-01-17": 72.5 }
  lastUpdated: Date;
}

// /users/{userId}/activity_log/{date}
export interface DailyActivity {
  date: string;                 // "YYYY-MM-DD" (document ID)
  workoutIds: string[];
  totalVolume: number;
  totalDuration: number;        // seconds
  createdAt: Date;
}

