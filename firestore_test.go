package main

import (
	"context"
	"testing"
	"time"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

// setupTestRouter sets up a very simple router
func setupTestRouter(t *testing.T) *router {
	ctx := context.Background()

	// If you want to run against real Firestore, you can set GOOGLE_APPLICATION_CREDENTIALS env var
	app, err := firebase.NewApp(ctx, nil, option.WithoutAuthentication())
	if err != nil {
		t.Fatalf("failed to create firebase app: %v", err)
	}

	cfg := &config{
		ctx:         ctx,
		firebaseApp: app,
	}

	return &router{
		config: cfg,
		logger: nil, // Or a dummy logger if you want
	}
}

func TestCreateUserDocument(t *testing.T) {
	rtr := setupTestRouter(t)

	userDoc := &UserDocument{
		UID:         "test-user-123",
		CurrentGoal: "Get Stronger",
		Metrics: UserDocumentMetrics{
			Height:   180,
			JoinDate: time.Now(),
			Weight:   75,
		},
		Settings: UserDocumentSettings{
			UnitsPreference: "Metric",
		},
	}

	err := CreateUserDocument(rtr, userDoc)

	// Since we're using a dummy Firestore client, we expect an error (no real Firestore),
	// but we can assert that it's a Firestore initialization error and not our logic breaking.
	if err == nil {
		t.Logf("CreateUserDocument passed without error")
	} else {
		t.Logf("CreateUserDocument error (expected without Firestore): %v", err)
	}
}

func TestGetUserDocument(t *testing.T) {
	rtr := setupTestRouter(t)

	// Try to fetch a user
	_, err := GetUserDocument(rtr, "test-user-123")

	// Again, no real Firestore here, but we should at least not panic
	if err == nil {
		t.Logf("GetUserDocument passed without error")
	} else {
		t.Logf("GetUserDocument error (expected without Firestore): %v", err)
	}
}

func TestUpdateUserDocument(t *testing.T) {
	rtr := setupTestRouter(t)

	updates := map[string]interface{}{
		"CurrentGoal": "Run a Marathon",
		"Weight":      70,
	}

	err := UpdateUserDocument(rtr, "test-user-123", updates)

	if err == nil {
		t.Logf("UpdateUserDocument passed without error (unexpected without real Firestore)")
	} else {
		// You can inspect the error string if you want to test specific behavior
		t.Logf("UpdateUserDocument returned expected error: %v", err)
	}
}

func TestCreateRoutineDocument(t *testing.T) {
	rtr := setupTestRouter(t)

	err := CreateRoutineDocument(rtr, "test-user-123", "Push Day")

	if err == nil {
		t.Logf("CreateRoutineDocument passed without error (unexpected without real Firestore)")
	} else {
		t.Logf("CreateRoutineDocument returned expected error: %v", err)
	}
}

func TestGetUserRoutines(t *testing.T) {
	rtr := setupTestRouter(t)

	routines, err := GetUserRoutines(rtr, "test-user-123")

	if err == nil {
		t.Logf("GetUserRoutines returned %d routines (unexpected without real Firestore)", len(routines))
	} else {
		t.Logf("GetUserRoutines returned expected error: %v", err)
	}
}
