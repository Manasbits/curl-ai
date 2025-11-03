// Firestore Schema Types

export interface Set {
  weight_kg: number;
  reps: number;
  completed: boolean;
  saved_at: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: Set[];
  break_seconds: number;
  is_warmup: boolean;
}

export interface Routine {
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

export interface Workout {
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

export interface ExerciseProgress {
  exercise_name: string;
  date: string; // YYYY-MM-DD
  max_weight_kg: number;
  max_reps: number;
  total_volume_kg: number;
  total_sets: number;
  workouts_count: number;
}

// Predefined routines data
export const PREDEFINED_ROUTINES: Omit<Routine, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: "Push Day",
    type: "predefined",
    description: "Focus on pushing movements targeting chest, shoulders, and triceps",
    is_favorite: false,
    favorite_count: 0,
    exercises: [
      {
        id: "bench_press",
        name: "Bench Press (Barbell)",
        category: "Chest",
        sets: Array(4).fill({
          weight_kg: 0,
          reps: 8,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 90,
        is_warmup: false
      },
      {
        id: "overhead_press",
        name: "Overhead Press (Barbell)",
        category: "Shoulders",
        sets: Array(4).fill({
          weight_kg: 0,
          reps: 8,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 90,
        is_warmup: false
      },
      {
        id: "incline_db_press",
        name: "Incline Dumbbell Press",
        category: "Upper Chest",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 10,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 60,
        is_warmup: false
      },
      {
        id: "lateral_raise",
        name: "Lateral Raises",
        category: "Shoulders",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 12,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 60,
        is_warmup: false
      },
      {
        id: "tricep_pushdown",
        name: "Tricep Pushdown",
        category: "Triceps",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 12,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 60,
        is_warmup: false
      }
    ]
  },
  {
    name: "Pull Day",
    type: "predefined",
    description: "Back and biceps focused workout with compound movements",
    is_favorite: false,
    favorite_count: 0,
    exercises: [
      {
        id: "deadlift",
        name: "Deadlift",
        category: "Back",
        sets: Array(4).fill({
          weight_kg: 0,
          reps: 6,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 120,
        is_warmup: false
      },
      {
        id: "pullups",
        name: "Pull-ups",
        category: "Back",
        sets: Array(4).fill({
          weight_kg: 0,
          reps: 8,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 90,
        is_warmup: false
      },
      {
        id: "barbell_row",
        name: "Barbell Row",
        category: "Back",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 10,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 90,
        is_warmup: false
      },
      {
        id: "face_pull",
        name: "Face Pulls",
        category: "Rear Delts",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 15,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 60,
        is_warmup: false
      },
      {
        id: "bicep_curl",
        name: "Bicep Curls",
        category: "Biceps",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 12,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 60,
        is_warmup: false
      }
    ]
  },
  {
    name: "Legs Day",
    type: "predefined",
    description: "Complete lower body workout focusing on strength and hypertrophy",
    is_favorite: false,
    favorite_count: 0,
    exercises: [
      {
        id: "squat",
        name: "Barbell Squat",
        category: "Legs",
        sets: Array(5).fill({
          weight_kg: 0,
          reps: 5,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 120,
        is_warmup: false
      },
      {
        id: "romanian_deadlift",
        name: "Romanian Deadlift",
        category: "Hamstrings",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 10,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 90,
        is_warmup: false
      },
      {
        id: "leg_press",
        name: "Leg Press",
        category: "Legs",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 12,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 90,
        is_warmup: false
      },
      {
        id: "leg_extension",
        name: "Leg Extensions",
        category: "Quadriceps",
        sets: Array(3).fill({
          weight_kg: 0,
          reps: 15,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 60,
        is_warmup: false
      },
      {
        id: "calf_raise",
        name: "Standing Calf Raises",
        category: "Calves",
        sets: Array(4).fill({
          weight_kg: 0,
          reps: 15,
          completed: false,
          saved_at: new Date()
        }),
        break_seconds: 45,
        is_warmup: false
      }
    ]
  }
];