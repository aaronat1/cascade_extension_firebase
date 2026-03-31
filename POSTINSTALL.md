# Firestore Cascade Delete — Setup Complete

The extension is now active. Deleting any document will automatically cascade the deletion to all its subcollections up to depth **${param:MAX_DEPTH}**.

**Batch size:** ${param:BATCH_SIZE} documents per write operation
**Excluded collections:** `${param:EXCLUDED_COLLECTIONS}` _(empty = none excluded)_

## Example

```
users/                     <- delete this document
  alice/
    orders/                <- automatically deleted
      order-1/
        items/             <- automatically deleted (depth 2)
          item-a           <- automatically deleted (depth 3)
    settings/              <- automatically deleted
      prefs                <- automatically deleted
```

## Monitor Cascade Deletes

Check Cloud Functions logs in the Firebase Console to see cascade delete activity, including the subcollection paths and document counts processed.

## Support

[GitHub repository](https://github.com/aaronat1/firestore-cascade-delete)
