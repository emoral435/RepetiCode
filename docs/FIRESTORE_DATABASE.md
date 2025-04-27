# Firebase Database

The following collections and document schemas are used within the application:

## Users Collection

Query for document: `/users/{document_id}`
User Document Schema:

```go
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
	UnitsPreference string
}
```

