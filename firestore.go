package main

import (
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

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

func MintIdToken(rtr *router, idToken string) error {
	if rtr.config.firebaseApp == nil {
		return fmt.Errorf("error, firebase app is not initialized")
	}

	client, err := rtr.config.firebaseApp.Auth(rtr.config.ctx)
	if err != nil {
		return fmt.Errorf("error initializing firebase auth client: %v", err)
	}

	// mint user id token to check if they have authoritative access to get the information
	_, err = client.VerifyIDToken(rtr.config.ctx, idToken)
	if err != nil {
		return fmt.Errorf("error minting user supplied idToken: %v", err)
	}

	return nil
}

func CreateUserDocument(rtr *router, userDoc *UserDocument) error {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	_, _, err = client.Collection("users").Add(rtr.config.ctx, userDoc)

	if err != nil {
		return fmt.Errorf("error while trying to create new user document: %w", err)
	}

	return nil
}

func GetUserDocument(rtr *router, uid string) (map[string]interface{}, error) {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return nil, fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	iter := client.Collection("users").Documents(rtr.config.ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error while iterating through the firestore user documents to retrieve documents: %w", err)
		}

		if doc.Data()["UID"] == uid {
			return doc.Data(), nil
		}
	}

	return nil, fmt.Errorf("error, did not find associated user document for UID of %s within users collection", uid)
}

func UpdateUserDocument(rtr *router, uid string, requestedUpdates map[string]interface{}) error {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	iter := client.Collection("users").Documents(rtr.config.ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return fmt.Errorf("error while iterating through the firestore user documents to retrieve documents: %w", err)
		}

		if doc.Data()["UID"] == uid {
			docRef := client.Collection("users").Doc(doc.Ref.ID)
			formattedUpdates := []firestore.Update{}
			for key, val := range requestedUpdates {
				formattedUpdates = append(formattedUpdates, firestore.Update{Path: key, Value: val})
			}

			if _, err = docRef.Update(rtr.config.ctx, formattedUpdates); err != nil {
				return fmt.Errorf("error while triyng to insert updates for user with UID (%s): %v", uid, err)
			}

			return nil
		}
	}

	return fmt.Errorf("error, did not find associated user document for UID of %s within users collection", uid)
}

func CreateRoutineDocument(rtr *router, uid, routineName string) error {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	userDoc, err := GetUserDocument(rtr, uid)
	if err != nil {
		return fmt.Errorf("error while trying to get users document to check subscription tier while creatine routine: %w", err)
	}

	settings, ok := userDoc["Settings"].(map[string]interface{})
	if ok {
		// check the tier of the user to see if they are able to make more than one routine
		// if the user is not on a paid plan, they should not be able to make more than one routine
		routines, err := GetUserRoutines(rtr, uid)
		if err != nil {
			return fmt.Errorf("error while trying to create new user document: %w", err)
		}

		if settings["SubscriptionTier"] == "Free" && len(routines) > 2 {
			return fmt.Errorf("error trying to make routine: Free tier user cannot make more than 3 routines")
		}

		newRoutineDoc := RoutineDocument{
			RoutineName: routineName,
			UID:         uid,
			CreatedAt:   time.Now(),
			Workouts:    []WorkoutDoc{},
		}

		if _, _, err = client.Collection("routines").Add(rtr.config.ctx, newRoutineDoc); err != nil {
			return fmt.Errorf("error while trying to create new routine document for user (uid: %s): %w", uid, err)
		}

		return nil
	}

	return fmt.Errorf("error trying to get users subscription settings while trying to create user workout routine")
}

func GetUserRoutines(rtr *router, uid string) ([]map[string]interface{}, error) {
	rd := make([]map[string]interface{}, 0)
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return nil, fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	iter := client.Collection("routines").Documents(rtr.config.ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}

		if err != nil {
			return nil, fmt.Errorf("error while iterating through the firestore user documents to retrieve documents: %w", err)
		}

		if doc.Data()["UID"] == uid {
			docDataAndRef := doc.Data()
			docDataAndRef["RefId"] = doc.Ref.ID
			rd = append(rd, docDataAndRef)
		}
	}

	return rd, nil
}

func GetOneUserRoutine(rtr *router, routineRefId string) (map[string]interface{}, error) {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return nil, fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	iter := client.Collection("routines").Documents(rtr.config.ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}

		if err != nil {
			return nil, fmt.Errorf("error while iterating through the firestore user documents to retrieve documents: %w", err)
		}

		if doc.Ref.ID == routineRefId {
			return doc.Data(), nil
		}
	}

	return nil, fmt.Errorf("error while trying to find routine associated with routine ref, found nothing")
}

func UpdateOneUserRoutine(rtr *router, routineRefId string, routineUpdates map[string]interface{}) error {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}

	defer func() {
		err := client.Close()
		if err != nil {
			rtr.logger.Error("could not close firebase client")
		}
	}()

	iter := client.Collection("routines").Documents(rtr.config.ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return fmt.Errorf("error while iterating through the firestore routine documents to retrieve routine: %w", err)
		}

		if doc.Ref.ID == routineRefId {
			if _, err = doc.Ref.Set(rtr.config.ctx, routineUpdates); err != nil {
				return fmt.Errorf("error while trying to insert updates for user's routine with routine ID (%s): %v", routineRefId, err)
			}

			return nil
		}
	}

	return fmt.Errorf("error, did not find associated user's routine document for routine of %s within routines collection", routineRefId)
}
