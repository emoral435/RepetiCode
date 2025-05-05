export interface RoutineDoc {
  RoutineName: string;
  UID: string;
  CreatedAt: string;
  RefId: string;
  Workouts: WorkoutDoc[];
}

export interface WorkoutDoc {
  WorkoutName: string;
  Exercises: ExerciseDoc[]
}

export interface ExerciseDoc {
  MuscleGroup: number;
  ExerciseName: string;
  Sets: SetDoc[];
}

export interface SetDoc {
  Reps: number;
  Weight: number;
  IsDropSet: boolean;
  IsWarmUp: boolean;
}