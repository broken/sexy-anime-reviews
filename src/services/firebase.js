import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getDatabase,
  ref as dbRef,
  onValue,
  get,
  set
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyAocDkU-CPiuuPMv-qlBlkrz8LISeT64Iw',
  authDomain: 'sexy-anime-reviews.firebaseapp.com',
  databaseURL: 'https://sexy-anime-reviews.firebaseio.com',
  storageBucket: 'firebase-sexy-anime-reviews.appspot.com',
  messagingSenderId: '927545895739'
};

// Singleton instances
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

import { cleanTitle, dbTitle } from '../../components/sar/util.js';
export { cleanTitle, dbTitle };

/**
 * Authentication helpers
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Realtime Database helpers
 */

/**
 * Subscribe to the reviews list (/reviews).
 * Replaces Polymer <firebase-query path="/reviews" data="{{reviews}}">
 * and ref('reviews').on('value', ...).
 * @param {Function} callback - Invoked with { [key]: reviewData } on updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToReviews(callback) {
  const rRef = dbRef(db, 'reviews');
  return onValue(rRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
}

/**
 * Fetch all reviews once.
 * @returns {Promise<Object>} Object containing all reviews keyed by title
 */
export async function getReviewsOnce() {
  const rRef = dbRef(db, 'reviews');
  const snapshot = await get(rRef);
  return snapshot.val() || {};
}

/**
 * Fetch a single review by key.
 * @param {string} key
 * @returns {Promise<Object|null>}
 */
export async function getReview(key) {
  if (!key) return null;
  const snapshot = await get(dbRef(db, `reviews/${key}`));
  return snapshot.val();
}

/**
 * Save or update a review.
 * Replaces this.firebase.database().ref('reviews').child(dbTitle(title)).set(review)
 * @param {string} title
 * @param {Object} reviewData
 * @returns {Promise<void>}
 */
export async function saveReview(title, reviewData) {
  const key = dbTitle(title);
  if (!key) {
    throw new Error('Review title cannot be empty.');
  }
  return set(dbRef(db, `reviews/${key}`), reviewData);
}

/**
 * Storage helpers
 */

/**
 * Upload a file to Firebase Storage with progress tracking.
 * @param {string} path - Storage path e.g. "covers/my_key"
 * @param {Blob|File} file - File or Blob to upload
 * @param {Function} [onProgress] - Optional progress callback receiving percentage (0-100)
 * @returns {Promise<string>} Resolves with public download URL
 */
export function uploadFile(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const fileRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(percentage, snapshot);
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Upload a full cover image.
 * @param {string} title
 * @param {Blob|File} file
 * @param {Function} [onProgress]
 * @returns {Promise<string>} Download URL
 */
export function uploadCover(title, file, onProgress) {
  const key = dbTitle(title);
  return uploadFile(`covers/${key}`, file, onProgress);
}

/**
 * Upload a thumbnail image.
 * @param {string} title
 * @param {Blob|File} file
 * @param {Function} [onProgress]
 * @returns {Promise<string>} Download URL
 */
export function uploadThumbnail(title, file, onProgress) {
  const key = dbTitle(title);
  return uploadFile(`covers/${key}_thumb`, file, onProgress);
}

/**
 * Delete a file in Firebase Storage by path or URL.
 * @param {string} pathOrUrl
 * @returns {Promise<void>}
 */
export async function deleteStorageFile(pathOrUrl) {
  const fileRef = storageRef(storage, pathOrUrl);
  return deleteObject(fileRef);
}
