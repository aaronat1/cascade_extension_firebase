## Version 0.1.0

- Initial release.
- Recursive subcollection deletion using `listCollections()`.
- Triggers at document depths L1, L2, and L3 (deeper deletions handled recursively).
- Configurable max depth (2-10 levels).
- Configurable batch size (50-500 documents per batch).
- Optional collection exclusion list.
- Automatically skips internal `_ext_` collections.
- Pagination support for subcollections with more than BATCH_SIZE documents.
