# 🔄 Schema Migration Plan: Current → Proposed Architecture

**Date:** Based on codebase review  
**Status:** Planning Phase

---

## 📋 Executive Summary

The current implementation uses a simplified schema that needs to be migrated to a more robust, scalable architecture. Key changes include:

1. **Global Collections**: Add `/global_exercises` and `/global_routines` collections
2. **Enhanced User Schema**: Add preferences, stats, subscription fields
3. **Workout Structure**: Migrate to fully denormalized single-document structure
4. **New Collections**: Add `exercise_history`, `measurements`, `activity_log`
5. **Set Structure**: Enhance with more metadata (RPE, notes, previous performance)
6. **Exercise Structure**: Add muscle groups, equipment, aliases, guides

---

## 🔍 Detailed Comparison

### 1. Global Exercises Collection

#### ❌ Current State
- **Missing**: No global exercises collection
- **Current**: Hardcoded exercises in `exercises_list/page.tsx` (10 exercises)
- **Location**: Exercises embedded in routines

#### ✅ Proposed State
```
/global_exercises/{exerciseId}
```

**Required Changes:**

1. **Create Global Exercises Collection**
   - Path: `/global_exercises/{exerciseId}`
   - Fields to add:
     ```typescript
     {
       exerciseId: string;           // e.g., "bench_press_barbell"
       name: string;                 // "Barbell Bench Press"
       primaryMuscle: string;        // "Chest"
       secondaryMuscles: string[];   // ["Triceps", "Shoulders"]
       equipment: string;            // "Barbell"
       category: "compound" | "isolation" | "cardio";
       defaultSetType: "weight_reps" | "bodyweight" | "duration" | "distance";
       aliases: string[];            // ["bench press", "flat bench"]
       createdAt: Timestamp;
       isActive: boolean;
     }
     ```

2. **Create Exercise Guides Subcollection**
   - Path: `/global_exercises/{exerciseId}/how_to/{locale}`
   - Fields:
     ```typescript
     {
       locale: string;               // "en", "es", etc.
       steps: string[];
       tips: string[];
       videoUrl?: string;
       thumbnailUrl?: string;
       commonMistakes?: string[];
     }
     ```

3. **Create Composite Indexes**
   - `primaryMuscle ASC, category ASC`
   - `equipment ASC, category ASC`

**UI Changes Required:**
- Update `exercises_list/page.tsx` to fetch from `/global_exercises`
- Add exercise detail page showing guide information
- Update exercise search to use aliases
- Add exercise filtering by muscle group and equipment

---

### 2. Global Routines Collection

#### ❌ Current State
- **Current**: Predefined routines stored in `/users/{userId}/routines` with `type: 'predefined'`
- **Issue**: Routines duplicated per user instead of shared templates

#### ✅ Proposed State
```
/global_routines/{routineId}
```

**Required Changes:**

1. **Create Global Routines Collection**
   - Path: `/global_routines/{routineId}`
   - Migrate `PREDEFINED_ROUTINES` to global collection
   - Fields to add:
     ```typescript
     {
       routineId: string;
       name: string;
       description: string;
       goal: "strength" | "hypertrophy" | "endurance" | "powerlifting";
       difficulty: "beginner" | "intermediate" | "advanced";
       estimatedDuration: number;    // minutes
       exercises: RoutineExercise[];
       createdAt: Timestamp;
       popularity: number;           // Incremented via Cloud Function
       tags: string[];               // ["push", "compound", "barbell"]
     }
     ```

2. **Update RoutineExercise Structure**
   ```typescript
   interface RoutineExercise {
     exerciseId: string;           // Reference to global_exercises
     order: number;                // Execution order
     sets: number;
     reps: number | string;        // "8-12" for ranges, "AMRAP" for max sets
     intensity?: string;           // "RPE 8", "70% 1RM"
     restBefore: number;           // seconds (default: 0 for first exercise)
     restAfter: number;            // seconds (between sets)
     supersetId?: string;          // Groups exercises (e.g., "superset_1")
     notes?: string;               // "Slow eccentric 3s"
   }
   ```

**UI Changes Required:**
- Update `routine/explore/page.tsx` to fetch from both global and user routines
- Add routine cloning functionality (global → user routine)
- Update routine display to show goal, difficulty, duration
- Add routine popularity and tags display

---

### 3. User Collection Schema

#### ❌ Current State
```typescript
interface UserProfile {
  name: string;
  email: string;
  profile_pic_url: string;
  height_cm: string;
  weight_kg: string;
  goal: string;
  experience_level: string;
  last_1rm?: Record<string, number>;
}
```

#### ✅ Proposed State
```typescript
interface User {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  
  // Subscription
  isPro: boolean;
  proExpiresAt?: Timestamp;
  
  // Preferences
  preferences: {
    weightUnit: "kg" | "lbs";
    distanceUnit: "km" | "mi";
    defaultRestTimer: number;   // seconds
    theme: "light" | "dark" | "auto";
  };
  
  // Aggregated Stats (denormalized for offline access)
  stats: {
    totalWorkouts: number;
    totalVolume: number;        // kg or lbs
    currentStreak: number;      // consecutive days
    longestStreak: number;
    lastWorkoutDate?: Timestamp;
  };
  
  // Metadata
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}
```

**Required Changes:**

1. **Field Renames**
   - `name` → `displayName`
   - `profile_pic_url` → `avatarUrl`

2. **Add New Fields**
   - `isPro: boolean`
   - `proExpiresAt?: Timestamp`
   - `preferences` object
   - `stats` object

3. **Move Measurements**
   - `height_cm` → `/users/{userId}/measurements/height`
   - `weight_kg` → `/users/{userId}/measurements/weight`

4. **Move Goal/Experience**
   - Keep in user document (or move to preferences)

**UI Changes Required:**
- Update `profile/page.tsx` to use new field names
- Add preferences UI (unit selection, rest timer, theme)
- Update stats display to use `stats` object
- Add pro badge/subscription UI
- Update measurement inputs to use measurements collection

---

### 4. User Custom Exercises

#### ❌ Current State
- **Missing**: No separate custom exercises collection
- **Current**: Exercises embedded in routines

#### ✅ Proposed State
```
/users/{userId}/custom_exercises/{exerciseId}
```

**Required Changes:**

1. **Create Custom Exercises Collection**
   ```typescript
   interface CustomExercise extends Omit<GlobalExercise, 'isActive'> {
     ownerId: string;              // userId for security rules
     baseExerciseId?: string;      // If cloned from global exercise
   }
   ```

2. **Update Exercise Lookup Logic**
   - Check custom exercises first
   - Fallback to global exercises

**UI Changes Required:**
- Add "Create Custom Exercise" functionality
- Update exercise selection to show custom exercises
- Add exercise cloning UI

---

### 5. User Routines (Instances)

#### ❌ Current State
```typescript
interface Routine {
  id: string;
  name: string;
  type: 'custom' | 'ai_generated' | 'predefined';
  description: string;
  created_at: Date;
  updated_at: Date;
  is_favorite: boolean;
  favorite_count: number;
  exercises: Exercise[];
}
```

#### ✅ Proposed State
```typescript
interface UserRoutine {
  routineId: string;
  name: string;
  
  // Source tracking
  sourceType: "global" | "custom" | "ai_generated";
  sourceId?: string;            // If cloned from global_routines
  
  // Structure (same as GlobalRoutine)
  exercises: RoutineExercise[];
  
  // User modifications
  lastModified: Timestamp;
  timesCompleted: number;       // Incremented on workout finish
  
  // Metadata
  createdAt: Timestamp;
  isArchived: boolean;
}
```

**Required Changes:**

1. **Field Changes**
   - `id` → `routineId`
   - `type` → `sourceType`
   - `updated_at` → `lastModified`
   - Remove `favorite_count` (move to global routines)
   - Add `sourceId` for tracking origin
   - Add `timesCompleted` counter
   - Add `isArchived` flag

2. **Update Exercise Structure**
   - Use `RoutineExercise` structure (with exerciseId reference)
   - Add `order`, `restBefore`, `restAfter`, `supersetId`, `notes`

**UI Changes Required:**
- Update routine creation to set `sourceType` and `sourceId`
- Add routine archiving functionality
- Update routine display to show completion count
- Update exercise structure in routine editor

---

### 6. Workouts Collection (CRITICAL CHANGES)

#### ❌ Current State
```typescript
interface Workout {
  id: string;
  routine_id: string;
  start_time: Date;
  end_time: Date | null;
  duration_seconds: number;
  is_favorite: boolean;
  ai_suggestions: string[];
  exercises: Exercise[];
  status: 'in_progress' | 'completed' | 'abandoned';
}
```

**Current Issues:**
- Sets stored in subcollection: `/workouts/{workoutId}/exercises/{exerciseId}/sets`
- Requires multiple reads to load workout
- Not optimized for offline-first

#### ✅ Proposed State
```typescript
interface Workout {
  workoutId: string;
  
  // Temporal
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;            // seconds (calculated on finish)
  date: string;                 // "2025-01-17" for daily aggregations
  
  // Source
  routineId?: string;           // Link to user routine (optional)
  name: string;                 // "Push Day A" or routine name
  
  // Status
  status: "active" | "completed" | "abandoned";
  
  // Volume Metrics (calculated on finish)
  totalVolume: number;          // sum(weight × reps) across all sets
  totalReps: number;
  totalSets: number;
  
  // Exercises Array (DENORMALIZED - CRITICAL CHANGE)
  exercises: WorkoutExercise[];
  
  // Metadata
  notes?: string;
  createdAt: Timestamp;
  modifiedAt: Timestamp;
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;         // Denormalized for fast display
  primaryMuscle: string;        // Denormalized for analytics
  
  order: number;
  supersetId?: string;
  
  sets: WorkoutSet[];           // EMBEDDED, not subcollection
  
  // Timing
  restBefore: number;
  restAfter: number;
}

interface WorkoutSet {
  setId: string;                // UUID for optimistic updates
  setNumber: number;            // 1-indexed
  type: "normal" | "warmup" | "drop" | "failure";
  
  // Performance data
  weight?: number;              // null for bodyweight
  reps: number;
  duration?: number;            // seconds (for timed exercises)
  distance?: number;            // meters (for cardio)
  
  // Metadata
  completed: boolean;
  completedAt?: Timestamp;
  rpe?: number;                 // Rate of Perceived Exertion (6-10)
  notes?: string;               // "Felt strong", "Lower back tight"
  
  // Previous performance (for comparison)
  previousWeight?: number;      // From last workout
  previousReps?: number;
}
```

**CRITICAL CHANGES:**

1. **Embed Sets in Workout Document**
   - **Current**: Sets in subcollection `/workouts/{workoutId}/exercises/{exerciseId}/sets`
   - **Proposed**: Sets embedded in `exercises[].sets[]` array
   - **Impact**: Single document read instead of multiple reads

2. **Field Renames**
   - `id` → `workoutId`
   - `routine_id` → `routineId`
   - `start_time` → `startTime`
   - `end_time` → `endTime`
   - `duration_seconds` → `duration`
   - `is_favorite` → (move to separate query or add back)

3. **Add New Fields**
   - `date: string` (for daily aggregations)
   - `totalVolume`, `totalReps`, `totalSets` (calculated metrics)
   - `notes` field
   - `modifiedAt` timestamp

4. **Enhance Set Structure**
   - Add `setId` (UUID)
   - Add `setNumber` (1-indexed)
   - Add `type` (normal/warmup/drop/failure)
   - Add `duration`, `distance` for cardio
   - Add `rpe` (Rate of Perceived Exertion)
   - Add `notes` for set-specific notes
   - Add `previousWeight`, `previousReps` for comparison

5. **Enhance Exercise Structure**
   - Add `exerciseId` (reference to global/custom exercise)
   - Denormalize `exerciseName` and `primaryMuscle`
   - Add `order` for execution order
   - Add `supersetId` for superset grouping
   - Add `restBefore` and `restAfter` timing

**UI Changes Required:**

1. **Workout Log Page (`workout_log/page.tsx`)**
   - Update to work with embedded sets structure
   - Remove subcollection reads
   - Add RPE input for sets
   - Add set notes input
   - Add previous performance display
   - Add set type selector (normal/warmup/drop/failure)
   - Update set completion to update embedded array

2. **Workout Creation**
   - Denormalize exercise data when creating workout
   - Calculate and store previous performance
   - Initialize sets with proper structure

3. **Workout Completion**
   - Calculate `totalVolume`, `totalReps`, `totalSets`
   - Set `date` field
   - Update `endTime` and `duration`

---

### 7. Exercise History Collection

#### ❌ Current State
```typescript
interface ExerciseProgress {
  exercise_name: string;
  date: string;
  max_weight_kg: number;
  max_reps: number;
  total_volume_kg: number;
  total_sets: number;
  workouts_count: number;
}
```
- **Current Path**: `/users/{userId}/exercise_progress/{exercise_name}_{date}`
- **Issue**: One document per exercise per date (inefficient for history lookup)

#### ✅ Proposed State
```
/users/{userId}/exercise_history/{exerciseId}
```

```typescript
interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  
  // Performance Tracking
  performanceLog: {
    [date: string]: PerformanceSnapshot;
  };
  
  // Computed Records
  records: {
    maxWeight: number;
    maxWeightDate: string;
    maxReps: number;
    maxRepsDate: string;
    estimated1RM: number;
    estimated1RMDate: string;
  };
  
  // Metadata
  lastPerformed: Timestamp;
  totalSessions: number;
  totalVolume: number;          // Lifetime volume for this exercise
}

interface PerformanceSnapshot {
  date: string;                 // "2025-01-17"
  workoutId: string;
  
  // Best set of the day
  topSet: {
    weight: number;
    reps: number;
    estimated1RM: number;
  };
  
  // Summary
  totalSets: number;
  totalVolume: number;          // For this session
  averageRPE?: number;
}
```

**Required Changes:**

1. **Restructure Collection**
   - One document per exercise (not per exercise per date)
   - Use date-keyed map in `performanceLog`
   - Add computed `records` object

2. **Cloud Function Required**
   - Trigger on workout completion
   - Calculate best set, estimated 1RM
   - Update records
   - Increment counters

**UI Changes Required:**

1. **Progress Page (`progress/page.tsx`)**
   - Update to fetch from `/exercise_history/{exerciseId}`
   - Parse `performanceLog` date-keyed map
   - Display records (max weight, max reps, estimated 1RM)
   - Show last performed date

2. **Workout Log**
   - Show previous performance from exercise history
   - Display estimated 1RM comparison

---

### 8. Measurements Collection

#### ❌ Current State
- **Current**: `height_cm` and `weight_kg` in user document
- **Issue**: No historical tracking

#### ✅ Proposed State
```
/users/{userId}/measurements/{measurementId}
```

```typescript
interface Measurement {
  measurementId: string;        // "weight" | "body_fat" | "chest" | "waist" etc.
  unit: string;                 // "kg", "lbs", "cm", "in", "%"
  
  // Date-keyed measurements
  data: {
    [date: string]: number;     // "2025-01-17": 72.5
  };
  
  // Metadata
  lastUpdated: Timestamp;
}
```

**Required Changes:**

1. **Create Measurements Collection**
   - One document per measurement type
   - Date-keyed map for historical data

2. **Migrate Existing Data**
   - Move `height_cm` → `/measurements/height`
   - Move `weight_kg` → `/measurements/weight`

**UI Changes Required:**

1. **Profile Page**
   - Update to read/write from measurements collection
   - Add measurement history chart
   - Add multiple measurement types (body fat, chest, waist, etc.)

---

### 9. Activity Log Collection

#### ❌ Current State
- **Missing**: No activity log collection
- **Issue**: Streak calculation not possible

#### ✅ Proposed State
```
/users/{userId}/activity_log/{date}
```

```typescript
interface DailyActivity {
  date: string;                 // "2025-01-17" (document ID)
  workoutIds: string[];         // All workouts completed this day
  totalVolume: number;
  totalDuration: number;        // seconds
  createdAt: Timestamp;
}
```

**Required Changes:**

1. **Create Activity Log Collection**
   - One document per day
   - Track all workouts completed that day

2. **Cloud Function Required**
   - Trigger on workout completion
   - Create/update activity log document
   - Update user stats (streak, etc.)

**UI Changes Required:**

1. **Home Page (`home/page.tsx`)**
   - Display streak from `user.stats.currentStreak`
   - Display weekly count from activity log

2. **Stats Calculation**
   - Implement streak calculation logic
   - Display weekly workout count

---

## 🔧 Migration Strategy

### Phase 1: Add New Collections (Non-Breaking)
1. Create `/global_exercises` collection
2. Create `/global_routines` collection
3. Create `/users/{userId}/custom_exercises` collection
4. Create `/users/{userId}/measurements` collection
5. Create `/users/{userId}/activity_log` collection
6. Create `/users/{userId}/exercise_history` collection

### Phase 2: Update User Schema (Breaking)
1. Add new fields to user document (preferences, stats)
2. Migrate measurements to new collection
3. Update all user profile reads/writes

### Phase 3: Migrate Routines (Breaking)
1. Migrate predefined routines to `/global_routines`
2. Update user routines to new structure
3. Add `sourceType` and `sourceId` fields
4. Update routine exercise structure

### Phase 4: Migrate Workouts (CRITICAL - Breaking)
1. **Backup existing workouts**
2. Migrate sets from subcollections to embedded arrays
3. Update workout document structure
4. Add denormalized exercise data
5. Calculate and store metrics
6. Update all workout reads/writes

### Phase 5: Update UI Components
1. Update all components to use new schema
2. Add new features (RPE, notes, previous performance)
3. Update progress tracking
4. Add measurements UI

---

## 📝 Field Mapping Reference

### User Profile
| Current | Proposed | Notes |
|---------|----------|-------|
| `name` | `displayName` | Rename |
| `profile_pic_url` | `avatarUrl` | Rename |
| `height_cm` | → `/measurements/height` | Move to collection |
| `weight_kg` | → `/measurements/weight` | Move to collection |
| `goal` | `preferences.goal` or keep | Consider moving |
| `experience_level` | Keep or move to preferences | |
| `last_1rm` | → `/exercise_history` | Move to exercise history |
| - | `isPro` | New |
| - | `proExpiresAt` | New |
| - | `preferences` | New object |
| - | `stats` | New object |

### Routine
| Current | Proposed | Notes |
|---------|----------|-------|
| `id` | `routineId` | Rename |
| `type` | `sourceType` | Rename + values |
| `updated_at` | `lastModified` | Rename |
| `favorite_count` | Remove | Move to global routines |
| `exercises` | `exercises` | Structure change |
| - | `sourceId` | New |
| - | `timesCompleted` | New |
| - | `isArchived` | New |

### Workout
| Current | Proposed | Notes |
|---------|----------|-------|
| `id` | `workoutId` | Rename |
| `routine_id` | `routineId` | Rename |
| `start_time` | `startTime` | Rename + Timestamp |
| `end_time` | `endTime` | Rename + Timestamp |
| `duration_seconds` | `duration` | Rename |
| `exercises` | `exercises` | Structure change (embedded sets) |
| `ai_suggestions` | Keep | |
| `status` | `status` | Values change |
| - | `date` | New |
| - | `name` | New |
| - | `totalVolume` | New |
| - | `totalReps` | New |
| - | `totalSets` | New |
| - | `notes` | New |
| - | `modifiedAt` | New |

### Set
| Current | Proposed | Notes |
|---------|----------|-------|
| `weight_kg` | `weight` | Rename + optional |
| `reps` | `reps` | Keep |
| `completed` | `completed` | Keep |
| `saved_at` | `completedAt` | Rename |
| - | `setId` | New UUID |
| - | `setNumber` | New |
| - | `type` | New (normal/warmup/drop/failure) |
| - | `duration` | New |
| - | `distance` | New |
| - | `rpe` | New |
| - | `notes` | New |
| - | `previousWeight` | New |
| - | `previousReps` | New |

---

## 🚨 Critical Breaking Changes

### 1. Workout Sets Structure
**Impact**: HIGH  
**Current**: Sets in subcollection  
**Proposed**: Sets embedded in workout document  
**Migration**: Requires data migration script

### 2. Exercise References
**Impact**: HIGH  
**Current**: Exercise data embedded in routines/workouts  
**Proposed**: Exercise references with denormalized data  
**Migration**: Need to resolve exercise IDs and denormalize

### 3. User Profile Structure
**Impact**: MEDIUM  
**Current**: Flat structure  
**Proposed**: Nested preferences and stats  
**Migration**: Requires field mapping

### 4. Routine Structure
**Impact**: MEDIUM  
**Current**: All routines in user collection  
**Proposed**: Global routines + user routines  
**Migration**: Need to migrate predefined routines

---

## ✅ Action Items

### Immediate (Before Migration)
- [ ] Create migration scripts for data transformation
- [ ] Set up Cloud Functions for computed fields
- [ ] Create backup of current Firestore data
- [ ] Set up staging environment for testing

### Schema Updates
- [ ] Create new TypeScript interfaces matching proposed schema
- [ ] Update Firestore security rules
- [ ] Create composite indexes
- [ ] Set up Cloud Function triggers

### Code Updates
- [ ] Update all Firestore read/write operations
- [ ] Update TypeScript types
- [ ] Update UI components to use new schema
- [ ] Add new features (RPE, notes, measurements, etc.)

### Testing
- [ ] Test data migration scripts
- [ ] Test new read/write operations
- [ ] Test UI components with new schema
- [ ] Test Cloud Functions
- [ ] Performance testing (single-read workouts)

---

## 📊 Estimated Effort

| Phase | Estimated Time | Complexity |
|-------|----------------|------------|
| Phase 1: New Collections | 2-3 days | Low |
| Phase 2: User Schema | 1-2 days | Medium |
| Phase 3: Routines | 2-3 days | Medium |
| Phase 4: Workouts | 4-5 days | **HIGH** |
| Phase 5: UI Updates | 5-7 days | Medium |
| **Total** | **14-20 days** | |

---

*This migration plan should be executed carefully with proper testing and rollback strategies.*
