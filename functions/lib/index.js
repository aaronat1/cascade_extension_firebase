"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cascadeDeleteL3 = exports.cascadeDeleteL2 = exports.cascadeDeleteL1 = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();
const MAX_DEPTH = parseInt(process.env.MAX_DEPTH ?? "5", 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? "100", 10);
const EXCLUDED_COLLECTIONS = (process.env.EXCLUDED_COLLECTIONS ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
async function deleteSubcollections(docRef, currentDepth) {
    if (currentDepth > MAX_DEPTH) return;
    const subcollections = await docRef.listCollections();
    if (subcollections.length === 0) return;
    for (const subcol of subcollections) {
        functions.logger.info(`Cascade-deleting subcollection "${subcol.id}" at depth ${currentDepth}`, { path: subcol.path });
        let lastDoc;
        do {
            let query = subcol.limit(BATCH_SIZE);
            if (lastDoc) query = query.startAfter(lastDoc);
            const snap = await query.get();
            if (snap.empty) break;
            const batch = admin.firestore().batch();
            for (const doc of snap.docs) {
                batch.delete(doc.ref);
                await deleteSubcollections(doc.ref, currentDepth + 1);
            }
            await batch.commit();
            lastDoc = snap.docs[snap.docs.length - 1];
        } while (lastDoc !== undefined);
    }
}
async function handleDelete(snapshot) {
    const refPath = snapshot.ref.path;
    const topCollection = refPath.split("/")[0];
    if (topCollection.startsWith("_ext_") || EXCLUDED_COLLECTIONS.includes(topCollection)) {
        return null;
    }
    functions.logger.info("Starting cascade delete", { path: refPath });
    try {
        await deleteSubcollections(snapshot.ref, 1);
        functions.logger.info("Cascade delete completed", { path: refPath });
    }
    catch (err) {
        functions.logger.error("Cascade delete failed", { err, path: refPath });
    }
    return null;
}
exports.cascadeDeleteL1 = functions.firestore
    .document("{c1}/{d1}")
    .onDelete((snap) => handleDelete(snap));
exports.cascadeDeleteL2 = functions.firestore
    .document("{c1}/{d1}/{c2}/{d2}")
    .onDelete((snap) => handleDelete(snap));
exports.cascadeDeleteL3 = functions.firestore
    .document("{c1}/{d1}/{c2}/{d2}/{c3}/{d3}")
    .onDelete((snap) => handleDelete(snap));
