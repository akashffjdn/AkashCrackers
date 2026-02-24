import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase.ts';
import type {
  UserProfile,
  Address,
  Order,
  WishlistItem,
  NotificationPreferences,
} from '@/types/index.ts';

// =====================
// USER PROFILE
// =====================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(profile: UserProfile) {
  await setDoc(doc(db, 'users', profile.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'photoURL'>>,
) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// =====================
// ADDRESSES
// =====================

export async function getAddresses(uid: string): Promise<Address[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'addresses'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Address);
}

export async function addAddress(uid: string, address: Omit<Address, 'id'>) {
  const ref = doc(collection(db, 'users', uid, 'addresses'));
  await setDoc(ref, address);
  return ref.id;
}

export async function updateAddress(
  uid: string,
  addressId: string,
  data: Partial<Address>,
) {
  await updateDoc(doc(db, 'users', uid, 'addresses', addressId), data);
}

export async function deleteAddress(uid: string, addressId: string) {
  await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
}

// =====================
// ORDERS
// =====================

export async function getOrders(uid: string): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'orders'), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function getOrderById(
  uid: string,
  orderId: string,
): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'orders', orderId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
}

export async function createOrder(
  uid: string,
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'orders'));
  await setDoc(ref, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// =====================
// WISHLIST
// =====================

export async function getWishlist(uid: string): Promise<WishlistItem[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'wishlist'));
  return snap.docs.map((d) => d.data() as WishlistItem);
}

export async function addToWishlist(uid: string, productId: string) {
  await setDoc(doc(db, 'users', uid, 'wishlist', productId), {
    productId,
    addedAt: new Date().toISOString(),
  });
}

export async function removeFromWishlist(uid: string, productId: string) {
  await deleteDoc(doc(db, 'users', uid, 'wishlist', productId));
}

// =====================
// NOTIFICATION PREFERENCES
// =====================

const defaultPrefs: NotificationPreferences = {
  emailPromotions: true,
  emailOrderUpdates: true,
  smsOrderUpdates: true,
  smsPromotions: false,
  pushNotifications: true,
};

export async function getNotificationPrefs(
  uid: string,
): Promise<NotificationPreferences> {
  const snap = await getDoc(doc(db, 'users', uid, 'preferences', 'notifications'));
  return snap.exists()
    ? (snap.data() as NotificationPreferences)
    : defaultPrefs;
}

export async function updateNotificationPrefs(
  uid: string,
  prefs: Partial<NotificationPreferences>,
) {
  await setDoc(doc(db, 'users', uid, 'preferences', 'notifications'), prefs, {
    merge: true,
  });
}
