package main

import (
	"fmt"

	"google.golang.org/genproto/googleapis/type/date"
)

type userDocument struct {
	CurrentGoal string
	Metrics     userDocumentMetrics
	Settings    userDocumentSettings
}

type userDocumentMetrics struct {
	height   int
	joinDate date.Date
	weight   int
}

type userDocumentSettings struct {
	unitsPreference string
}

func CreateUserDocument(rtr router) error {
	client, err := rtr.config.firebaseApp.Firestore(rtr.config.ctx)
	if err != nil {
		return fmt.Errorf("error while trying to initialize firestore client: %w", err)
	}
	defer client.Close()

	newUserDocument := userDocument{
		CurrentGoal: "deciding...",
		Metrics: userDocumentMetrics{
			height: 0,
		},
	}

	_, _, err = client.Collection("users").Add(rtr.config.ctx, map[string]interface{}{
		"first": "Ada",
		"last":  "Lovelace",
		"born":  1815,
	})

	if err != nil {
		return fmt.Errorf("error while trying to create new user document: %w", err)
	}

	return nil
}
