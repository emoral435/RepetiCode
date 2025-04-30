package main

import (
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

type UserDocument struct {
	UID         string
	Tier        string
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

			_, err = docRef.Update(rtr.config.ctx, formattedUpdates)
			if err != nil {
				return fmt.Errorf("error while triyng to insert updates for user with UID (%s): %v", uid, err)
			}

			return nil
		}
	}

	return fmt.Errorf("error, did not find associated user document for UID of %s within users collection", uid)
}
