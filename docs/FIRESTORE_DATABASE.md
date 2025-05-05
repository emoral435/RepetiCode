# Firebase Database

The following collections and document schemas are used within the application:

## Users Collection

Query for document: `/users/{document_id}`
User Document Schema:

```go
type UserDocument struct {
	UID         string
	CurrentGoal string
	Metrics     UserDocumentMetrics
	Settings    UserDocumentSettings
}

type UserDocumentMetrics struct {
	Height   int
	JoinDate time.Time
	Weight   int
}

type UserDocumentSettings struct {
	UnitsPreference  string
	SubscriptionTier string
}
```

## Routines Collection

Query for document: `/routines/{document_id}`
Routine Document Schema: 

```go
type RoutineDocument struct {
	RoutineName string
	UID         string
	CreatedAt   time.Time
	Workouts    []WorkoutDoc
}

type WorkoutDoc struct {
	WorkoutName string
	Excersices  []ExerciseDoc
}

type ExerciseDoc struct {
	MuscleGroup  int // 0: chest, 1: back, 2: biceps, 3: triceps, 4: front delts, 5: side delts, 6: rear delts, 7: abs, 8: quads, 9: hamstrings, 10: calves, 11: forearms
	ExerciseName string
	Sets         []SetDoc
}

type SetDoc struct {
	Reps      int
	Weight    int
	IsDropSet bool
	IsWarmUp  bool
}
```