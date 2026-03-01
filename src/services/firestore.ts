import api from '@/lib/api.ts';
import type {
  UserProfile,
  UserRole,
  Address,
  Order,
  WishlistItem,
  NotificationPreferences,
} from '@/types/index.ts';

// =====================
// ID MAPPING HELPERS
// =====================

function mapAddress(a: Record<string, unknown>): Address {
  return { ...a, id: (a._id || a.id) as string } as Address;
}

function mapOrder(o: Record<string, unknown>): Order {
  const items = (o.items as Record<string, unknown>[]) || [];
  return {
    ...o,
    id: (o._id || o.id) as string,
    userId: (o.user || o.userId) as string,
    items: items.map((item) => ({
      ...item,
      productId: (item.product || item.productId) as string,
    })),
  } as Order;
}

// =====================
// USER PROFILE
// =====================

export async function getUserProfile(_uid: string): Promise<UserProfile | null> {
  return api.get('/auth/me');
}

export async function createUserProfile(_profile: UserProfile): Promise<void> {
  // No-op — registration is handled by POST /api/auth/register
}

export async function getUserRole(_uid: string): Promise<UserRole> {
  const user: UserProfile = await api.get('/auth/me');
  return user.role ?? 'user';
}

export async function updateUserProfile(
  _uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'photoURL'>>,
): Promise<void> {
  await api.put('/auth/profile', data);
}

// =====================
// ADDRESSES
// =====================

export async function getAddresses(_uid: string): Promise<Address[]> {
  const data: Record<string, unknown>[] = await api.get('/addresses');
  return (data || []).map(mapAddress);
}

export async function addAddress(_uid: string, address: Omit<Address, 'id'>): Promise<string> {
  const result: Record<string, unknown> = await api.post('/addresses', address);
  return (result._id || result.id) as string;
}

export async function updateAddress(
  _uid: string,
  addressId: string,
  data: Partial<Address>,
): Promise<void> {
  await api.put(`/addresses/${addressId}`, data);
}

export async function deleteAddress(_uid: string, addressId: string): Promise<void> {
  await api.delete(`/addresses/${addressId}`);
}

// =====================
// ORDERS
// =====================

export async function getOrders(_uid: string): Promise<Order[]> {
  const result: Record<string, unknown> = await api.get('/orders');
  const data = (result.data || result) as Record<string, unknown>[];
  return (Array.isArray(data) ? data : []).map(mapOrder);
}

export async function getOrderById(
  _uid: string,
  orderId: string,
): Promise<Order | null> {
  const result: Record<string, unknown> = await api.get(`/orders/${orderId}`);
  return result ? mapOrder(result) : null;
}

export async function createOrder(
  _uid: string,
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  _customerName?: string,
  _customerEmail?: string,
): Promise<string> {
  const result: Record<string, unknown> = await api.post('/orders', orderData);
  return (result._id || result.id) as string;
}

// =====================
// WISHLIST
// =====================

export async function getWishlist(_uid: string): Promise<WishlistItem[]> {
  const result: Record<string, unknown> = await api.get('/wishlist');
  const products = (result.products || result) as Record<string, unknown>[];
  return (Array.isArray(products) ? products : []).map((p) => ({
    productId: (p._id || p.id) as string,
    addedAt: (p.addedAt as string) || new Date().toISOString(),
  }));
}

export async function addToWishlist(_uid: string, productId: string): Promise<void> {
  await api.post(`/wishlist/${productId}`);
}

export async function removeFromWishlist(_uid: string, productId: string): Promise<void> {
  await api.delete(`/wishlist/${productId}`);
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
  _uid: string,
): Promise<NotificationPreferences> {
  try {
    const result: NotificationPreferences = await api.get('/notifications/preferences');
    return result || defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export async function updateNotificationPrefs(
  _uid: string,
  prefs: Partial<NotificationPreferences>,
): Promise<void> {
  await api.put('/notifications/preferences', prefs);
}
