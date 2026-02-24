import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase.ts';
import type { UserProfile } from '@/types/index.ts';

export function mapFirebaseUser(user: User): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL,
    phone: user.phoneNumber ?? '',
    createdAt: user.metadata.creationTime ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(result.user);
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(result.user);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return mapFirebaseUser(result.user);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function confirmReset(oobCode: string, newPassword: string) {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

export async function changePassword(newPassword: string) {
  if (!auth.currentUser) throw new Error('No user logged in');
  await updatePassword(auth.currentUser, newPassword);
}

export async function signOutUser() {
  await auth.signOut();
}
