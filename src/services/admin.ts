/**
 * Admin service layer — backed by in-memory mock data.
 * All reads return from the mock arrays; all writes mutate them in place
 * so changes persist for the duration of the browser session.
 */
import {
  mockProducts,
  mockCategories,
  mockUsers,
  mockOrders,
  mockSiteSettings,
  mockDashboardStats,
} from '@/data/mock-admin.ts';
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
// MUTABLE IN-MEMORY STORES
// =====================

const products: AdminProduct[] = [...mockProducts];
const categories: Category[] = [...mockCategories];
const users: UserProfile[] = [...mockUsers];
const orders: AdminOrder[] = [...mockOrders];
let siteSettings: SiteSettings = { ...mockSiteSettings };

// Content sections store (hero, homepage, testimonials, company-info, faq, etc.)
const contentSections = new Map<string, Record<string, unknown>>();

// Pre-populate CMS content sections with realistic data
contentSections.set('hero-section', {
  eyebrow: 'Diwali 2026 Collection Now Live',
  titleLine1: 'Light Up the',
  titleGradient: 'Night Sky',
  subtitle: 'Premium-crafted fireworks for celebrations that deserve perfection. From elegant sparklers to breathtaking aerial shows.',
  backgroundImage: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1920&q=80',
  primaryCTA: { text: 'Shop Collection', link: '/shop' },
  secondaryCTA: { text: 'Diwali Specials', link: '/shop?occasion=diwali' },
  stats: [
    { id: '1', value: '50K+', label: 'Happy Customers' },
    { id: '2', value: '500+', label: 'Premium Products' },
    { id: '3', value: '25+', label: 'Years of Trust' },
  ],
});

contentSections.set('homepage-sections', {
  trustBadges: [
    { id: '1', label: 'Premium Quality', value: 'BIS Certified' },
    { id: '2', label: 'Happy Customers', value: '50,000+' },
    { id: '3', label: 'Years of Trust', value: '25+' },
    { id: '4', label: 'Pan India', value: 'Free Shipping' },
  ],
  categoryShowcase: {
    heading: { eyebrow: 'Shop by Category', title: 'Find Your Perfect Fireworks', subtitle: 'Explore our curated collection across every category' },
    categories: [
      { id: '1', title: 'Aerial Shells', description: 'Sky-painting masterpieces', image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&q=80', href: '/shop?category=aerial' },
      { id: '2', title: 'Sparklers', description: 'Elegant hand-held magic', image: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=600&q=80', href: '/shop?category=sparklers' },
      { id: '3', title: 'Rockets', description: 'Soaring performances', image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&q=80', href: '/shop?category=rockets' },
      { id: '4', title: 'Combo Packs', description: 'Complete celebration kits', image: 'https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=600&q=80', href: '/shop?category=combo-packs' },
    ],
  },
  featuredProducts: {
    heading: { eyebrow: 'Curated Selection', title: 'Featured Products', subtitle: 'Hand-picked premium fireworks for unforgettable celebrations' },
    productIds: ['sky-emperor-500', 'golden-cascade-pro', 'diwali-mega-combo', 'wedding-grand-finale'],
  },
  newsletter: {
    eyebrow: 'Stay Updated',
    heading: 'Get Early Access to Seasonal Collections',
    description: 'Join 25,000+ celebration enthusiasts. Be the first to know about new arrivals, exclusive deals, and seasonal offers.',
    successMessage: "You're in! Watch your inbox.",
  },
});

contentSections.set('testimonials', {
  testimonials: [
    { id: '1', name: 'Rajesh Kumar', location: 'Mumbai', rating: 5, text: 'Best crackers we have ever used for Diwali! The Sky Emperor was absolutely stunning. Will definitely order again next year.', avatar: 'https://i.pravatar.cc/150?u=rajesh', isActive: true, order: 0 },
    { id: '2', name: 'Priya Sharma', location: 'Delhi', rating: 5, text: "Ordered the Wedding Grand Finale for my sister's reception. Everyone was mesmerized! Premium quality and safe to use.", avatar: 'https://i.pravatar.cc/150?u=priya', isActive: true, order: 1 },
    { id: '3', name: 'Arun Patel', location: 'Ahmedabad', rating: 4, text: 'Great variety of sparklers and fountains. The kids loved the Novelty Fun Pack. Fast delivery too!', avatar: 'https://i.pravatar.cc/150?u=arun', isActive: true, order: 2 },
    { id: '4', name: 'Deepa Nair', location: 'Chennai', rating: 5, text: 'As someone from Sivakasi, I know quality crackers. Akash Crackers delivers authentic, BIS-certified products every time.', avatar: 'https://i.pravatar.cc/150?u=deepa', isActive: true, order: 3 },
  ],
});

contentSections.set('company-info', {
  name: 'Akash Crackers',
  tagline: 'Premium Fireworks for Every Celebration',
  description: "Since 1998, Akash Crackers has been India's trusted source for premium, BIS-certified fireworks. Based in Sivakasi, the fireworks capital of India, we bring joy to over 50,000 families every festive season.",
  phone: '+91 98765 43210',
  email: 'hello@akashcrackers.com',
  whatsapp: '+91 98765 43210',
  address: '123, Fireworks Street, Industrial Area',
  city: 'Sivakasi',
  state: 'Tamil Nadu',
  socialInstagram: 'https://instagram.com/akashcrackers',
  socialFacebook: 'https://facebook.com/akashcrackers',
  socialYoutube: 'https://youtube.com/@akashcrackers',
});

contentSections.set('faq', {
  categories: [
    {
      id: 'faq-ordering', name: 'Ordering & Payment', icon: '\uD83D\uDED2', order: 0,
      items: [
        { id: 'faq-1', question: 'What payment methods do you accept?', answer: 'We accept Razorpay (UPI, cards, netbanking) and Cash on Delivery for orders up to \u20B95,000.' },
        { id: 'faq-2', question: 'Can I cancel my order?', answer: 'Orders can be cancelled within 2 hours of placing them. After that, contact our support team.' },
      ],
    },
    {
      id: 'faq-shipping', name: 'Shipping & Delivery', icon: '\uD83D\uDE9A', order: 1,
      items: [
        { id: 'faq-3', question: 'Do you offer free shipping?', answer: 'Yes! Free standard shipping on all orders above \u20B9999. Express shipping is available at \u20B9199.' },
        { id: 'faq-4', question: 'How long does delivery take?', answer: 'Standard delivery takes 5-7 business days. Express delivery takes 2-3 business days.' },
      ],
    },
    {
      id: 'faq-safety', name: 'Safety & Quality', icon: '\uD83D\uDEE1\uFE0F', order: 2,
      items: [
        { id: 'faq-5', question: 'Are your products BIS certified?', answer: 'Yes, all our products are BIS (Bureau of Indian Standards) certified and comply with PESO regulations.' },
        { id: 'faq-6', question: 'How should I store fireworks?', answer: 'Store in a cool, dry place away from direct sunlight and heat sources. Keep out of reach of children.' },
      ],
    },
  ],
});

contentSections.set('notification-settings', {
  emailOrderUpdates: true,
  emailPromotions: false,
  smsOrderUpdates: true,
  smsPromotions: false,
  lowStockAlert: true,
  lowStockThreshold: 20,
});

contentSections.set('security-settings', {
  sessionTimeout: 60,
  maxLoginAttempts: 5,
});

// Small delay to simulate async network calls
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

function now(): string {
  return new Date().toISOString();
}

// =====================
// PRODUCTS
// =====================

export async function getAllProducts(options?: {
  category?: string;
  isActive?: boolean;
  limit?: number;
}): Promise<PaginatedResult<AdminProduct>> {
  await delay();
  let data = [...products];
  if (options?.category) data = data.filter((p) => p.category === options.category);
  if (options?.isActive !== undefined) data = data.filter((p) => p.isActive === options.isActive);
  data.sort((a, b) => a.name.localeCompare(b.name));
  if (options?.limit) data = data.slice(0, options.limit);
  return { data, total: data.length, hasMore: false };
}

export async function getProductById(productId: string): Promise<AdminProduct | null> {
  await delay();
  return products.find((p) => p.id === productId) ?? null;
}

export async function createProduct(
  product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  adminUid: string,
): Promise<string> {
  await delay();
  const id = (product as { slug?: string }).slug || `product-${Date.now()}`;
  const newProduct = {
    ...product,
    id,
    createdBy: adminUid,
    createdAt: now(),
    updatedAt: now(),
  } as AdminProduct;
  products.push(newProduct);
  return id;
}

export async function updateProduct(
  productId: string,
  data: Partial<AdminProduct>,
): Promise<void> {
  await delay();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...data, updatedAt: now() };
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  await delay();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], isActive: false, updatedAt: now() };
  }
}

// =====================
// ORDERS
// =====================

export async function getAllOrders(options?: {
  status?: OrderStatus;
  limit?: number;
}): Promise<PaginatedResult<AdminOrder>> {
  await delay();
  let data = [...orders];
  if (options?.status) data = data.filter((o) => o.status === options.status);
  data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (options?.limit) data = data.slice(0, options.limit);
  return { data, total: data.length, hasMore: false };
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrder | null> {
  await delay();
  return orders.find((o) => o.id === orderId) ?? null;
}

export async function updateOrderStatus(
  orderId: string,
  _userId: string,
  newStatus: OrderStatus,
  note?: string,
): Promise<void> {
  await delay();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    const statusEntry = {
      status: newStatus,
      changedAt: now(),
      changedBy: 'admin',
      note: note || undefined,
    };
    orders[idx] = {
      ...orders[idx],
      status: newStatus,
      statusHistory: [...orders[idx].statusHistory, statusEntry],
      updatedAt: now(),
    };
  }
}

export async function updateOrderTracking(
  orderId: string,
  _userId: string,
  trackingId: string,
): Promise<void> {
  await delay();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], trackingId, updatedAt: now() };
  }
}

// =====================
// CUSTOMERS
// =====================

export async function getAllCustomers(): Promise<PaginatedResult<UserProfile>> {
  await delay();
  const data = [...users].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  );
  return { data, total: data.length, hasMore: false };
}

export async function getCustomerById(uid: string): Promise<UserProfile | null> {
  await delay();
  return users.find((u) => u.uid === uid) ?? null;
}

export async function getCustomerOrders(uid: string): Promise<Order[]> {
  await delay();
  return orders
    .filter((o) => o.userId === uid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await delay();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], role };
  }
}

export async function updateUserProfile(uid: string, data: {
  displayName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  city?: string;
  state?: string;
}): Promise<void> {
  await delay();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...data, updatedAt: now() };
  }
}

export async function toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
  await delay();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], isActive, updatedAt: now() };
  }
}

// =====================
// CATEGORIES
// =====================

export async function getAllCategories(options?: {
  isActive?: boolean;
}): Promise<PaginatedResult<Category>> {
  await delay();
  let data = [...categories];
  if (options?.isActive !== undefined) data = data.filter((c) => c.isActive === options.isActive);
  data.sort((a, b) => a.displayOrder - b.displayOrder);
  return { data, total: data.length, hasMore: false };
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  await delay();
  return categories.find((c) => c.id === categoryId) ?? null;
}

export async function createCategory(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'productCount'>,
  adminUid: string,
): Promise<string> {
  await delay();
  const id = `cat-${category.slug || Date.now()}`;
  const newCategory: Category = {
    ...category,
    id,
    productCount: 0,
    createdBy: adminUid,
    createdAt: now(),
    updatedAt: now(),
  };
  categories.push(newCategory);
  return id;
}

export async function updateCategory(
  categoryId: string,
  data: Partial<Category>,
): Promise<void> {
  await delay();
  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], ...data, updatedAt: now() };
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await delay();
  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], isActive: false, updatedAt: now() };
  }
}

export async function toggleCategoryStatus(categoryId: string, isActive: boolean): Promise<void> {
  await delay();
  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], isActive, updatedAt: now() };
  }
}

// =====================
// SITE SETTINGS
// =====================

export async function getSiteSettings(): Promise<SiteSettings | null> {
  await delay();
  return { ...siteSettings };
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  await delay();
  siteSettings = { ...siteSettings, ...data };
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  await delay();
  return null;
}

export async function updateHeroSettings(_data: Partial<HeroSettings>): Promise<void> {
  await delay();
}

// =====================
// CONTENT SECTIONS
// =====================

export async function getContentSection<T = Record<string, unknown>>(sectionId: string): Promise<T | null> {
  await delay();
  const data = contentSections.get(sectionId);
  return data ? (structuredClone(data) as T) : null;
}

export async function updateContentSection(sectionId: string, data: Record<string, unknown>): Promise<void> {
  await delay();
  const existing = contentSections.get(sectionId) ?? {};
  contentSections.set(sectionId, { ...existing, ...data, updatedAt: now() });
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
  await delay();

  let totalRevenue = 0;
  orders.forEach((o) => {
    if (o.status !== 'cancelled') totalRevenue += o.total;
  });

  let lowStockCount = 0;
  products.forEach((p) => {
    if (p.isActive && (p.stockCount ?? 0) <= 20) lowStockCount++;
  });

  return {
    totalRevenue,
    ordersToday: mockDashboardStats.ordersToday,
    totalCustomers: users.length,
    lowStockCount,
  };
}

// =====================
// PRODUCT MIGRATION (no-op for mock)
// =====================

export async function migrateStaticProducts(
  _products: Array<Record<string, unknown>>,
  _adminUid: string,
): Promise<number> {
  await delay();
  return 0;
}

// =====================
// BILLING / POS
// =====================

const bills: Bill[] = [];
let billSequence = 0;

function generateBillNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  billSequence++;
  return `AK-${yy}${mm}-${String(billSequence).padStart(5, '0')}`;
}

export function getActiveProducts(): AdminProduct[] {
  return products.filter((p) => p.isActive && p.inStock);
}

export async function createBill(
  items: BillItem[],
  payment: BillPayment,
  discount: { percent: number },
  customer: { name?: string; phone?: string },
  adminUid: string,
  packagingFee = 0,
): Promise<Bill> {
  await delay();

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalDiscount = Math.round(subtotal * (discount.percent / 100));
  const taxableAmount = subtotal - totalDiscount;
  const taxBase = taxableAmount + packagingFee;
  const totalCgst = Math.round(taxBase * 0.09);
  const totalSgst = Math.round(taxBase * 0.09);
  const rawTotal = taxBase + totalCgst + totalSgst;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  const billItems: BillItem[] = items.map((item) => {
    const lineSubtotal = item.unitPrice * item.quantity;
    const lineDiscount = Math.round(lineSubtotal * (discount.percent / 100));
    const lineTaxable = lineSubtotal - lineDiscount;
    const cgst = Math.round(lineTaxable * 0.09);
    const sgst = Math.round(lineTaxable * 0.09);
    return {
      ...item,
      taxableValue: lineTaxable,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: lineTaxable + cgst + sgst,
    };
  });

  const bill: Bill = {
    id: `bill-${Date.now()}`,
    billNumber: generateBillNumber(),
    status: 'completed',
    customerName: customer.name || undefined,
    customerPhone: customer.phone || undefined,
    items: billItems,
    discountPercent: discount.percent,
    subtotal,
    totalDiscount,
    packagingFee,
    taxableAmount,
    totalCgst,
    totalSgst,
    grandTotal,
    roundOff: Math.round(roundOff * 100) / 100,
    payment,
    itemCount: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: now(),
    createdBy: adminUid,
  };

  bills.unshift(bill);
  return bill;
}

export async function getAllBills(): Promise<Bill[]> {
  await delay();
  return [...bills];
}
