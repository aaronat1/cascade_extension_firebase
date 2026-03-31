# Firestore Cascade Delete

This extension automatically deletes all subcollections of a Firestore document when that document is deleted — a capability that Firestore does not provide natively. Without this, deleting a parent document leaves all its subcollection data as orphaned, unreachable documents.

## How It Works

1. When a document is deleted, the extension is triggered.
2. It uses `listCollections()` to find all direct subcollections of the deleted document.
3. For each subcollection, it deletes all documents in batches (configurable size).
4. For each deleted document, it recursively repeats the process up to `MAX_DEPTH` levels deep.

## Prerequisites

- Firebase project with Firestore enabled.
- Cloud Functions service account must have `datastore.user` role (automatically granted).

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `LOCATION` | Cloud Functions region | `us-central1` |
| `MAX_DEPTH` | Maximum subcollection depth | `5` |
| `BATCH_SIZE` | Documents deleted per batch | `100` |
| `EXCLUDED_COLLECTIONS` | Collections to skip | _(empty)_ |

## Billing

This extension uses Cloud Functions for Firebase. Cascade deletes on large trees may incur significant Firestore read and delete costs. See [Firebase Pricing](https://firebase.google.com/pricing) for details.

## Important Notes

- This extension triggers at depths L1, L2, and L3. Deeper deletions are handled recursively within the function itself.
- For very large subcollections, consider increasing the Cloud Functions timeout in your Firebase Console.
- The extension does **not** trigger on documents inside internal `_ext_` collections.
