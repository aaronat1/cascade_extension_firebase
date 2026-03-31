# Firestore Cascade Delete - Firebase Extension

> Automatically deletes all subcollections when a Firestore document is deleted. Solves the well-known Firestore limitation where deleting a parent document leaves all its subcollection data orphaned.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Firebase Extension](https://img.shields.io/badge/Firebase-Extension-FFCA28?logo=firebase)](https://firebase.google.com/products/extensions)

## Why Use This Extension?

Firestore does **not** automatically delete subcollections when a parent document is deleted. This is a well-known limitation that leads to:

- **Orphaned data** — subcollection documents remain accessible but unreachable from the parent
- **Wasted storage** — orphaned documents still count against your storage quota
- **Security holes** — orphaned data may still be accessible via direct paths
- **Data inconsistency** — your app assumes the data is gone, but it's not

This extension handles it automatically by recursively finding and deleting all subcollections.

## How It Works

```
DELETE users/alice
  |-- Extension detects deletion
  |-- Lists subcollections: orders/, settings/
  |-- Deletes all docs in users/alice/orders/
  |     |-- Lists subcollections: items/
  |     |-- Deletes all docs in users/alice/orders/order1/items/
  |-- Deletes all docs in users/alice/settings/
  |-- Done - entire tree is clean
```

## Installation

### Option 1: Firebase CLI

```
firebase ext:install aaronat1/firestore-cascade-delete --project=YOUR_PROJECT_ID
```

### Option 2: From Source

```bash
git clone https://github.com/aaronat1/cascade_extension_firebase.git
cd cascade_extension_firebase
firebase ext:install . --project=YOUR_PROJECT_ID
```

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `LOCATION` | Cloud Functions deployment region | `us-central1` |
| `MAX_DEPTH` | Maximum subcollection depth to delete (2-10) | `5` |
| `BATCH_SIZE` | Documents per batch delete operation (50-500) | `100` |
| `EXCLUDED_COLLECTIONS` | Top-level collections to skip | _(empty)_ |

## Example

**Before this extension:**
```javascript
// Delete a user
await db.doc("users/alice").delete();
// BUT: users/alice/orders/*, users/alice/settings/* still exist!
```

**After this extension:**
```javascript
// Delete a user
await db.doc("users/alice").delete();
// Extension automatically cleans up:
//   users/alice/orders/*                  -> deleted
//   users/alice/settings/*                -> deleted
//   users/alice/orders/order1/items/*     -> deleted (recursive)
```

## How Deep Does It Go?

The extension triggers at document depths L1, L2, and L3. For each deleted document, it recursively descends into subcollections up to `MAX_DEPTH` levels deep. The default max depth of 5 covers the vast majority of Firestore data models.

## Tech Stack

- **Runtime:** Node.js 20
- **Language:** TypeScript
- **Trigger:** Firestore `onDelete` (depths 1-3, recursive internally)
- **Dependencies:** `firebase-admin`, `firebase-functions`

## Performance Considerations

- **Batch size:** Documents are deleted in configurable batches (default 100) using `WriteBatch` for efficiency.
- **Large trees:** For documents with thousands of subcollection documents, the function may take longer. Consider increasing the Cloud Functions timeout in the Firebase Console.
- **Pagination:** The extension automatically paginates through subcollections larger than `BATCH_SIZE`.

## Billing

Blaze plan required. Costs depend on the number of subcollection documents deleted. Each deleted document incurs one read (to list it) and one delete operation. See [Firebase Pricing](https://firebase.google.com/pricing).

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

## Author

**[@aaronat1](https://github.com/aaronat1)**
