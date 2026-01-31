# 🎨 UI Changes Required for Schema Migration

This document outlines all UI components that need to be updated to match the new Firestore schema architecture.

---

## 🔴 Critical UI Changes (High Priority)

### 1. Workout Log Page (`src/app/(main)/workout_log/page.tsx`)

**Current Issues:**
- Sets stored in subcollection (requires multiple reads)
- Missing RPE input
- Missing set notes
- Missing previous performance display
- Missing set type selector

**Required Changes:**

#### A. Update Set Structure
```typescript
// Current
interface ExerciseSet {
  id: number;
  previous: string;
  kg: number;
  reps: number;
  completed: boolean;
}

// Proposed
interface WorkoutSet {
  setId: string;                // UUID
  setNumber: number;            // 1-indexed
  type: "normal" | "warmup" | "drop" | "failure";
  weight?: number;              // null for bodyweight
  reps: number;
  duration?: number;            // for timed exercises
  completed: boolean;
  completedAt?: Timestamp;
  rpe?: number;                 // 6-10 scale
  notes?: string;
  previousWeight?: number;
  previousReps?: number;
}
```

#### B. Add New UI Elements
1. **Set Type Selector**
   - Add dropdown/buttons for: Normal, Warmup, Drop Set, Failure
   - Visual indicator for set type
   - Default to "normal"

2. **RPE Input**
   - Add RPE slider/input (6-10 scale)
   - Show RPE scale legend
   - Optional field (can be empty)

3. **Set Notes**
   - Add textarea for set-specific notes
   - Icon button to expand/collapse notes
   - Character limit indicator

4. **Previous Performance Display**
   - Show previous weight/reps prominently
   - Visual comparison (up/down arrows)
   - Color coding (green if improved, red if decreased)

5. **Remove Subcollection Reads**
   - Load entire workout in single read
   - Update sets in embedded array
   - Optimistic updates with UUID

#### C. Code Changes
```typescript
// Remove this pattern:
const setsCol = collection(db, `users/${userId}/workouts/${workoutId}/exercises/${exerciseId}/sets`);

// Use this instead:
const workoutDoc = await getDoc(doc(db, `users/${userId}/workouts/${workoutId}`));
const workout = workoutDoc.data();
const sets = workout.exercises.find(e => e.exerciseId === exerciseId)?.sets || [];
```

**Files to Update:**
- `src/app/(main)/workout_log/page.tsx`
- `src/hooks/use-active-workout.ts`
- `src/lib/firestore.ts`

---

### 2. Exercise List Page (`src/app/(main)/exercises_list/page.tsx`)

**Current Issues:**
- Hardcoded 10 exercises
- No exercise details
- No filtering by muscle group/equipment
- No exercise guides

**Required Changes:**

#### A. Fetch from Global Exercises
```typescript
// Current: Hardcoded array
const exercises: Exercise[] = [
  { id: 1, name: 'Warm Up', category: 'Full Body', image: '🔥' },
  // ...
];

// Proposed: Fetch from Firestore
const exercisesRef = collection(db, 'global_exercises');
const q = query(exercisesRef, where('isActive', '==', true));
const snapshot = await getDocs(q);
const exercises = snapshot.docs.map(doc => ({ exerciseId: doc.id, ...doc.data() }));
```

#### B. Add Exercise Details Modal/Page
- Exercise name and aliases
- Primary and secondary muscles
- Equipment required
- Exercise category
- How-to guide (steps, tips, common mistakes)
- Video/thumbnail if available

#### C. Enhanced Filtering
- Filter by primary muscle group
- Filter by equipment type
- Filter by category (compound/isolation/cardio)
- Search by name and aliases

#### D. Exercise Card Updates
- Show primary muscle badge
- Show equipment icon
- Show category indicator
- Add "View Details" button

**Files to Update:**
- `src/app/(main)/exercises_list/page.tsx`
- Create: `src/app/(main)/exercises/[exerciseId]/page.tsx` (exercise detail page)
- Create: `src/components/exercise-card.tsx`

---

### 3. Profile Page (`src/app/(main)/profile/page.tsx`)

**Current Issues:**
- Height/weight stored in user document
- No historical tracking
- Missing preferences UI
- Missing stats display

**Required Changes:**

#### A. Update Field Names
```typescript
// Current
profile.name → profile.displayName
profile.profile_pic_url → profile.avatarUrl
```

#### B. Move Measurements to Collection
```typescript
// Current: Direct in user document
height_cm: string
weight_kg: string

// Proposed: Fetch from measurements collection
const weightDoc = await getDoc(doc(db, `users/${userId}/measurements/weight`));
const heightDoc = await getDoc(doc(db, `users/${userId}/measurements/height`));
```

#### C. Add Preferences Section
- Weight unit selector (kg/lbs)
- Distance unit selector (km/mi)
- Default rest timer input
- Theme selector (light/dark/auto)

#### D. Add Stats Display
- Total workouts
- Total volume
- Current streak
- Longest streak
- Last workout date

#### E. Add Measurement History
- Weight history chart
- Height history (if tracked)
- Body fat % (if tracked)
- Other measurements (chest, waist, etc.)

**Files to Update:**
- `src/app/(main)/profile/page.tsx`
- Create: `src/components/measurement-chart.tsx`
- Create: `src/components/preferences-form.tsx`

---

### 4. Home Page (`src/app/(main)/home/page.tsx`)

**Current Issues:**
- Streak shows "0" (not calculated)
- Weekly count shows "0" (not calculated)
- Stats not fetched from user document

**Required Changes:**

#### A. Fetch Stats from User Document
```typescript
// Current: Hardcoded
<span className="font-bold text-lg">0</span> // Day Streak
<span className="font-bold text-lg">0</span> // This Week

// Proposed: From user.stats
const { profile } = useAuth();
const currentStreak = profile?.stats?.currentStreak || 0;
const weeklyCount = calculateWeeklyCount(activityLog); // From activity_log collection
```

#### B. Calculate Weekly Count
- Fetch activity_log for last 7 days
- Count days with workouts
- Display count

**Files to Update:**
- `src/app/(main)/home/page.tsx`
- Create: `src/hooks/use-stats.ts`

---

### 5. Routine Explore Page (`src/app/(main)/routine/explore/page.tsx`)

**Current Issues:**
- Only shows user routines
- No global routines
- Missing routine metadata (goal, difficulty, duration)

**Required Changes:**

#### A. Fetch Global Routines
```typescript
// Fetch global routines
const globalRoutinesRef = collection(db, 'global_routines');
const globalSnapshot = await getDocs(globalRoutinesRef);
const globalRoutines = globalSnapshot.docs.map(doc => ({ 
  routineId: doc.id, 
  sourceType: 'global',
  ...doc.data() 
}));

// Combine with user routines
const allRoutines = [...globalRoutines, ...userRoutines];
```

#### B. Add Routine Metadata Display
- Goal badge (strength/hypertrophy/endurance)
- Difficulty badge (beginner/intermediate/advanced)
- Estimated duration
- Popularity count
- Tags

#### C. Add Routine Cloning
- "Clone to My Routines" button for global routines
- Create user routine copy with `sourceId` reference

**Files to Update:**
- `src/app/(main)/routine/explore/page.tsx`
- Create: `src/components/routine-card.tsx` (enhanced)

---

### 6. Custom Routine Page (`src/app/(main)/routine/custom/page.tsx`)

**Current Issues:**
- Exercise selection uses hardcoded list
- Missing exercise reference structure
- Missing rest timing (restBefore/restAfter)
- Missing superset support

**Required Changes:**

#### A. Update Exercise Selection
- Fetch from global_exercises
- Show exercise details on selection
- Store exerciseId reference

#### B. Add Rest Timing
- Rest before exercise (default: 0 for first)
- Rest after exercise (between sets)
- Visual rest timer countdown

#### C. Add Superset Support
- Group exercises into supersets
- Visual superset indicator
- Shared rest timer for superset

#### D. Update Routine Structure
```typescript
// Current
exercises: Exercise[] // Embedded exercise data

// Proposed
exercises: RoutineExercise[] // References with prescription
{
  exerciseId: string;        // Reference
  order: number;
  sets: number;
  reps: number | string;     // "8-12" for ranges
  restBefore: number;
  restAfter: number;
  supersetId?: string;
  notes?: string;
}
```

**Files to Update:**
- `src/app/(main)/routine/custom/page.tsx`
- Update exercise selection component

---

### 7. Progress Page (`src/app/(main)/progress/page.tsx`)

**Current Issues:**
- Uses old exercise_progress structure
- One document per exercise per date
- Missing records display

**Required Changes:**

#### A. Update to Exercise History Structure
```typescript
// Current: Multiple documents
/users/{userId}/exercise_progress/{exercise_name}_{date}

// Proposed: Single document per exercise
/users/{userId}/exercise_history/{exerciseId}
// With date-keyed performanceLog
```

#### B. Display Records
- Max weight achieved
- Max reps achieved
- Estimated 1RM
- Dates for records

#### C. Parse Performance Log
- Convert date-keyed map to array
- Sort by date
- Display in chart/table

**Files to Update:**
- `src/app/(main)/progress/page.tsx`
- `src/hooks/use-exercise-progress.ts`
- Create: `src/components/progress-chart.tsx`

---

## 🟡 Medium Priority UI Changes

### 8. Workout History Page (`src/app/(main)/workout_history/page.tsx`)

**Required Changes:**
- Display workout name (not just routine_id)
- Show total volume, reps, sets
- Display date field
- Show workout notes if available

---

### 9. Routine Options Component (`src/components/ui/routine-options.tsx`)

**Required Changes:**
- Enable AI Routine Option (currently disabled)
- Add navigation to AI routine generation page
- Show pro badge if feature requires subscription

---

## 🟢 Low Priority UI Changes

### 10. Exercise Detail Page (New)

**Create New Page:**
- Route: `/exercises/[exerciseId]`
- Display exercise information
- Show how-to guide
- Display video if available
- Show common mistakes
- Add to routine button

---

### 11. Measurements Page (New)

**Create New Page:**
- Route: `/profile/measurements`
- Track multiple measurement types
- Historical charts
- Add/edit measurements
- Export data

---

## 📋 Component Creation Checklist

### New Components Needed
- [ ] `ExerciseCard` - Enhanced exercise display
- [ ] `ExerciseDetailModal` - Exercise information modal
- [ ] `SetTypeSelector` - Set type dropdown/buttons
- [ ] `RPEInput` - RPE slider/input
- [ ] `SetNotesInput` - Notes textarea
- [ ] `PreviousPerformanceDisplay` - Previous set comparison
- [ ] `MeasurementChart` - Measurement history chart
- [ ] `PreferencesForm` - User preferences form
- [ ] `StatsDisplay` - User stats display
- [ ] `RoutineCard` - Enhanced routine card with metadata
- [ ] `ProgressChart` - Exercise progress visualization
- [ ] `SupersetGroup` - Superset visual grouping

### Updated Components
- [ ] `WorkoutLog` - Major refactor for embedded sets
- [ ] `ExerciseList` - Fetch from global exercises
- [ ] `Profile` - New structure and measurements
- [ ] `Home` - Stats from user document
- [ ] `RoutineExplore` - Global + user routines
- [ ] `CustomRoutine` - New exercise structure
- [ ] `Progress` - Exercise history structure

---

## 🎯 UI/UX Enhancements

### Visual Improvements
1. **Set Type Indicators**
   - Color coding: Normal (default), Warmup (yellow), Drop (orange), Failure (red)
   - Icons for each type

2. **RPE Scale Display**
   - Visual scale: 6 (easy) → 10 (max effort)
   - Color gradient
   - Tooltip with descriptions

3. **Previous Performance**
   - Green up arrow if improved
   - Red down arrow if decreased
   - Gray if same

4. **Exercise Cards**
   - Muscle group badges
   - Equipment icons
   - Category indicators

5. **Routine Cards**
   - Goal badges
   - Difficulty indicators
   - Duration display
   - Popularity count

---

## 🔄 Migration UI Flow

### Step 1: Data Migration Indicator
- Show migration progress bar
- Inform users about schema changes
- Allow users to continue using app during migration

### Step 2: Feature Flags
- Use feature flags for new schema features
- Gradual rollout
- Fallback to old schema if needed

### Step 3: User Onboarding
- Guide users through new features
- Show tooltips for new fields (RPE, notes, etc.)
- Highlight improvements

---

## 📱 Mobile Considerations

### Touch Targets
- RPE slider should be easy to use on mobile
- Set type buttons should be large enough
- Notes input should expand on focus

### Performance
- Lazy load exercise details
- Optimize workout document size
- Cache frequently accessed data

### Offline Support
- Cache global exercises
- Cache user routines
- Store workout state locally

---

*This document should be updated as UI changes are implemented.*
