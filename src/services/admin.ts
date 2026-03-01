/**
 * Admin service layer — backed by real backend API calls.
 * All reads/writes go through the API client at @/lib/api.ts.
 */
import api from '@/lib/api.ts';
import type { Order, OrderStatus, UserProfile, UserRole } from '@/types/index.ts';
import type {
  AdminProduct,
  AdminOrder,
  Category,
  SiteSettings,
  HeroSettings,
  PaginatedResult,
  Bill,
  BillItem,
  BillPayment,
} from '@/types/admin.ts';

// =====================
// ID MAPPING HELPERS
// =====================

/**
 * Map backend _id to frontend id for a single record.
 * Leaves records untouched if _id is not present.
 */
function mapId<T extends Record<string, unknown>>(record: T): T {
  if (!record) return record;
  const mapped: Record<string, unknown> = { ...record };
  if (mapped._id) {
    mapped.id = mapped._id;
    delete mapped._id;
  }
  return mapped as T;
}

/**
 * Map backend _id → id for an array of records.
 */
function mapIds<T extends Record<string, unknown>>(records: T[]): T[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapId);
}

/**
 * Map a backend product to an AdminProduct, handling _id → id
 * and categorySlug → category.
 */
function mapAdminProduct(p: Record<string, unknown>): AdminProduct {
  return {
    ...p,
    id: (p._id || p.id) as string,
    isNew: (p.isNewArrival ?? p.isNew ?? false) as boolean,
    category: (p.categorySlug || (typeof p.category === 'string' ? p.category : '')) as AdminProduct['category'],
  } as unknown as AdminProduct;
}

/**
 * Map a backend order to an AdminOrder, handling _id → id.
 */
function mapAdminOrder(o: Record<string, unknown>): AdminOrder {
  return {
    ...o,
    id: (o._id || o.id) as string,
  } as unknown as AdminOrder;
}

/**
 * Map a backend category to a Category, handling _id → id.
 */
function mapCategory(c: Record<string, unknown>): Category {
  return {
    ...c,
    id: (c._id || c.id) as string,
  } as unknown as Category;
}

/**
 * Map a backend bill to a Bill, handling _id → id.
 */
function mapBill(b: Record<string, unknown>): Bill {
  return {
    ...b,
    id: (b._id || b.id) as string,
  } as unknown as Bill;
}

// =====================
// PRODUCTS
// =====================

export async function getAllProducts(options?: {
  category?: string;
  isActive?: boolean;
  limit?: number;
}): Promise<PaginatedResult<AdminProduct>> {
  const params: Record<string, string | number | boolean> = {};
  if (options?.category) params.category = options.category;
  if (options?.isActive !== undefined) params.inStock = options.isActive;
  if (options?.limit) params.limit = options.limit;

  const result: Record<string, unknown> = await api.get('/products', { params });
  const rawData = (result.data || result) as Record<string, unknown>[];
  const data = (Array.isArray(rawData) ? rawData : []).map(mapAdminProduct);

  return {
    data,
    total: (result.total as number) ?? data.length,
    hasMore: (result.hasMore as boolean) ?? false,
  };
}

export async function getProductById(productId: string): Promise<AdminProduct | null> {
  try {
    const data: Record<string, unknown> = await api.get(`/products/${productId}`);
    return data ? mapAdminProduct(data) : null;
  } catch {
    return null;
  }
}

/**
 * Map frontend product fields to backend field names before sending to API.
 * Frontend uses: category (slug string), isNew
 * Backend expects: categorySlug, isNewArrival
 */
function toBackendProduct(data: Record<string, unknown>): Record<string, unknown> {
  const mapped = { ...data };
  if ('category' in mapped) {
    mapped.categorySlug = mapped.category;
    delete mapped.category;
  }
  if ('isNew' in mapped) {
    mapped.isNewArrival = mapped.isNew;
    delete mapped.isNew;
  }
  return mapped;
}

export async function createProduct(
  product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  _adminUid: string,
): Promise<string> {
  const result: Record<string, unknown> = await api.post('/products', toBackendProduct(product as unknown as Record<string, unknown>));
  return (result._id || result.id) as string;
}

export async function updateProduct(
  productId: string,
  data: Partial<AdminProduct>,
): Promise<void> {
  await api.put(`/products/${productId}`, toBackendProduct(data as unknown as Record<string, unknown>));
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/products/${productId}`);
}

// =====================
// ORDERS
// =====================

export async function getAllOrders(options?: {
  status?: OrderStatus;
  limit?: number;
}): Promise<PaginatedResult<AdminOrder>> {
  const params: Record<string, string | number | boolean> = {};
  if (options?.status) params.status = options.status;
  if (options?.limit) params.limit = options.limit;

  const result: Record<string, unknown> = await api.get('/admin/orders', { params });
  const rawData = (result.data || result) as Record<string, unknown>[];
  const data = (Array.isArray(rawData) ? rawData : []).map(mapAdminOrder);

  return {
    data,
    total: (result.total as number) ?? data.length,
    hasMore: (result.hasMore as boolean) ?? false,
  };
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrder | null> {
  try {
    const data: Record<string, unknown> = await api.get(`/admin/orders/${orderId}`);
    return data ? mapAdminOrder(data) : null;
  } catch {
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  _userId: string,
  newStatus: OrderStatus,
  note?: string,
): Promise<void> {
  await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus, note });
}

export async function updateOrderTracking(
  orderId: string,
  _userId: string,
  trackingId: string,
): Promise<void> {
  await api.patch(`/admin/orders/${orderId}/tracking`, { trackingId });
}

// =====================
// CUSTOMERS
// =====================

export async function getAllCustomers(): Promise<PaginatedResult<UserProfile>> {
  const result: Record<string, unknown> = await api.get('/admin/users');
  const rawData = (result.data || result) as Record<string, unknown>[];
  const data = (Array.isArray(rawData) ? rawData : []) as unknown as UserProfile[];

  return {
    data,
    total: (result.total as number) ?? data.length,
    hasMore: (result.hasMore as boolean) ?? false,
  };
}

export async function getCustomerById(uid: string): Promise<UserProfile | null> {
  try {
    const data: UserProfile = await api.get(`/admin/users/${uid}`);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getCustomerOrders(uid: string): Promise<Order[]> {
  const data: Record<string, unknown>[] = await api.get(`/admin/users/${uid}/orders`);
  return mapIds(Array.isArray(data) ? data : []) as unknown as Order[];
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await api.patch(`/admin/users/${uid}/role`, { role });
}

export async function updateUserProfile(uid: string, data: {
  displayName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  city?: string;
  state?: string;
}): Promise<void> {
  await api.put(`/admin/users/${uid}`, data);
}

export async function toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
  await api.patch(`/admin/users/${uid}/status`, { isActive });
}

// =====================
// CATEGORIES
// =====================

export async function getAllCategories(options?: {
  isActive?: boolean;
}): Promise<PaginatedResult<Category>> {
  const result: Record<string, unknown> = await api.get('/categories');
  const rawData = (Array.isArray(result) ? result : (result.data || result)) as Record<string, unknown>[];
  let data = (Array.isArray(rawData) ? rawData : []).map(mapCategory);

  if (options?.isActive !== undefined) {
    data = data.filter((c) => c.isActive === options.isActive);
  }

  return {
    data,
    total: data.length,
    hasMore: false,
  };
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const data: Record<string, unknown> = await api.get(`/categories/${categoryId}`);
    return data ? mapCategory(data) : null;
  } catch {
    return null;
  }
}

export async function createCategory(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'productCount'>,
  _adminUid: string,
): Promise<string> {
  const result: Record<string, unknown> = await api.post('/categories', category);
  return (result._id || result.id) as string;
}

export async function updateCategory(
  categoryId: string,
  data: Partial<Category>,
): Promise<void> {
  await api.put(`/categories/${categoryId}`, data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await api.delete(`/categories/${categoryId}`);
}

export async function toggleCategoryStatus(categoryId: string, isActive: boolean): Promise<void> {
  await api.patch(`/categories/${categoryId}/toggle`, { isActive });
}

// =====================
// SITE SETTINGS
// =====================

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const raw: Record<string, unknown> = await api.get('/admin/settings');
    if (!raw) return null;

    // Map backend keys (store, shipping, payment, announcement) to frontend SiteSettings
    const store = (raw.store || {}) as Record<string, unknown>;
    const shipping = (raw.shipping || raw.shippingRates || {}) as Record<string, unknown>;
    const payment = (raw.payment || raw.paymentSettings || {}) as Record<string, unknown>;
    const announcement = (raw.announcement || raw.announcementBar || {}) as Record<string, unknown>;

    return {
      siteName: (store.name || raw.siteName || '') as string,
      shippingRates: shipping as unknown as SiteSettings['shippingRates'],
      paymentSettings: payment as unknown as SiteSettings['paymentSettings'],
      announcementBar: announcement as unknown as SiteSettings['announcementBar'],
      notificationTemplates: (raw.notificationTemplates || {}) as Record<string, string>,
    };
  } catch {
    return null;
  }
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  // Map frontend SiteSettings keys back to backend keys
  const mapped: Record<string, unknown> = {};
  if (data.siteName !== undefined) mapped.store = { name: data.siteName };
  if (data.shippingRates) mapped.shipping = data.shippingRates;
  if (data.paymentSettings) mapped.payment = data.paymentSettings;
  if (data.announcementBar) mapped.announcement = data.announcementBar;
  if (data.notificationTemplates) mapped.notificationTemplates = data.notificationTemplates;
  await api.put('/admin/settings', mapped);
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  try {
    const data = await api.get('/content/hero-section') as Record<string, unknown> | null;
    return data ? (data as unknown as HeroSettings) : null;
  } catch {
    return null;
  }
}

export async function updateHeroSettings(data: Partial<HeroSettings>): Promise<void> {
  await api.put('/content/hero-section', data as Record<string, unknown>);
}

// =====================
// CONTENT SECTIONS
// =====================

export async function getContentSection<T = Record<string, unknown>>(sectionId: string): Promise<T | null> {
  try {
    const data = await api.get(`/content/${sectionId}`);
    return data ? (data as T) : null;
  } catch {
    return null;
  }
}

export async function updateContentSection(sectionId: string, data: Record<string, unknown>): Promise<void> {
  await api.put(`/content/${sectionId}`, data);
}

// =====================
// DASHBOARD STATS
// =====================

export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  ordersToday: number;
  totalCustomers: number;
  lowStockCount: number;
}> {
  const data: Record<string, unknown> = await api.get('/admin/analytics/dashboard');
  return {
    totalRevenue: (data.totalRevenue as number) ?? 0,
    ordersToday: (data.ordersToday as number) ?? 0,
    totalCustomers: (data.totalCustomers as number) ?? 0,
    lowStockCount: (data.lowStockCount as number) ?? 0,
  };
}

// =====================
// PRODUCT MIGRATION (no-op — handled by backend)
// =====================

export async function migrateStaticProducts(
  _products: Array<Record<string, unknown>>,
  _adminUid: string,
): Promise<number> {
  return 0;
}

// =====================
// BILLING / POS
// =====================

export async function getActiveProducts(): Promise<AdminProduct[]> {
  const result = await getAllProducts({ limit: 500 });
  return result.data;
}

export async function createBill(
  items: BillItem[],
  payment: BillPayment,
  discount: { percent: number },
  customer: { name?: string; phone?: string },
  adminUid: string,
  packagingFee = 0,
): Promise<Bill> {
  const body = {
    items,
    payment,
    discount,
    customer,
    adminUid,
    packagingFee,
  };
  const result: Record<string, unknown> = await api.post('/admin/billing', body);
  return mapBill(result);
}

export async function getAllBills(): Promise<Bill[]> {
  const result: Record<string, unknown> = await api.get('/admin/billing');
  const bills = (result.data || result) as Record<string, unknown>[];
  return (Array.isArray(bills) ? bills : []).map(mapBill);
}
