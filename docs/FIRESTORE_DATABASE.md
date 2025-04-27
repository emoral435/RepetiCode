# Firebase Database

The following collections and document schemas are used within the application:

## Users Collection

Query for document: `/users/{document_id}`
User Document Schema:

```js
{
  currentGoal: "Gaintaining" (string)
  displayName "emoral435" (string)
  metrics (map) {
    height 173 (number)
    joinDate April 25, 2025 at 12:00:00 PM UTC-5 (timestamp)
    weight 145 (number)
  }
  settings (map) {
    unitsPreference "metric" (string)
  }
}
```

