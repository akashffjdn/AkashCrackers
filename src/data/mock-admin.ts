/**
 * Mock data for admin screens.
 * Products mirror the user-facing catalog so admin edits = user-visible changes.
 */
import { products } from './products.ts';
import type { AdminProduct, AdminOrder, Category, SiteSettings } from '@/types/admin.ts';
import type { UserProfile, OrderStatus, PaymentStatus } from '@/types/index.ts';

// =====================
// HELPERS
// =====================

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// =====================
// PRODUCTS  (wraps the user-facing products with admin fields)
// =====================

export const mockProducts: AdminProduct[] = products.map((p, i) => ({
  ...p,
  isActive: i < 10, // first 10 active, rest inactive
  createdAt: daysAgo(90 - i * 5),
  updatedAt: daysAgo(i * 2),
  createdBy: 'admin-001',
  tags: p.badge ? [p.badge, p.category] : [p.category],
  specifications: [
    { key: 'Weight', value: `${200 + i * 50}g` },
    { key: 'BIS License', value: 'AK-2025-' + String(1000 + i) },
  ],
}));

// =====================
// CATEGORIES
// =====================

const catImages: Record<string, string> = {
  aerial: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&q=80',
  ground: 'https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=400&q=80',
  rockets: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80',
  sparklers: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=400&q=80',
  fountains: 'https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=400&q=80',
  'roman-candles': 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&q=80',
  novelty: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=400&q=80',
  'combo-packs': 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80',
};

const catIcons: Record<string, string> = {
  aerial: '🎆', ground: '🎇', rockets: '🚀', sparklers: '✨',
  fountains: '⛲', 'roman-candles': '🕯️', novelty: '🎉', 'combo-packs': '📦',
};

export const mockCategories: Category[] = [
  { id: 'cat-aerial', name: 'Aerial Shells', slug: 'aerial', description: 'Sky-high multi-shot cakes and aerial shells that paint the sky with colour.', image: catImages.aerial, icon: catIcons.aerial, displayOrder: 1, isActive: true, productCount: 2, createdAt: daysAgo(120), updatedAt: daysAgo(5), createdBy: 'admin-001' },
  { id: 'cat-ground', name: 'Ground Effects', slug: 'ground', description: 'Chakras, ground spinners, and ground-level pyrotechnics.', image: catImages.ground, icon: catIcons.ground, displayOrder: 2, isActive: true, productCount: 1, createdAt: daysAgo(120), updatedAt: daysAgo(3), createdBy: 'admin-001' },
  { id: 'cat-rockets', name: 'Rockets', slug: 'rockets', description: 'High-altitude rockets with star burst and report effects.', image: catImages.rockets, icon: catIcons.rockets, displayOrder: 3, isActive: true, productCount: 1, createdAt: daysAgo(120), updatedAt: daysAgo(7), createdBy: 'admin-001' },
  { id: 'cat-sparklers', name: 'Sparklers', slug: 'sparklers', description: 'Premium hand-held sparklers in gold, silver, and multi-colour.', image: catImages.sparklers, icon: catIcons.sparklers, displayOrder: 4, isActive: true, productCount: 1, createdAt: daysAgo(115), updatedAt: daysAgo(2), createdBy: 'admin-001' },
  { id: 'cat-fountains', name: 'Fountains', slug: 'fountains', description: 'Elegant colour-changing fountain displays for ground-level shows.', image: catImages.fountains, icon: catIcons.fountains, displayOrder: 5, isActive: true, productCount: 2, createdAt: daysAgo(110), updatedAt: daysAgo(4), createdBy: 'admin-001' },
  { id: 'cat-roman', name: 'Roman Candles', slug: 'roman-candles', description: 'Classic Roman candle tubes that fire star shells skyward.', image: catImages['roman-candles'], icon: catIcons['roman-candles'], displayOrder: 6, isActive: true, productCount: 1, createdAt: daysAgo(110), updatedAt: daysAgo(6), createdBy: 'admin-001' },
  { id: 'cat-novelty', name: 'Novelty', slug: 'novelty', description: 'Fun, family-safe novelty items — smoke balls, snakes, pop-pops.', image: catImages.novelty, icon: catIcons.novelty, displayOrder: 7, isActive: true, productCount: 1, createdAt: daysAgo(100), updatedAt: daysAgo(8), createdBy: 'admin-001' },
  { id: 'cat-combos', name: 'Combo Packs', slug: 'combo-packs', description: 'Complete celebration kits with everything you need for a show.', image: catImages['combo-packs'], icon: catIcons['combo-packs'], displayOrder: 8, isActive: true, productCount: 3, createdAt: daysAgo(100), updatedAt: daysAgo(1), createdBy: 'admin-001' },
];

// =====================
// USERS / CUSTOMERS
// =====================

const indianFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Sai', 'Arnav', 'Dhruv', 'Kabir', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Isha', 'Priya', 'Kavya', 'Riya', 'Nisha', 'Rohan', 'Vikram', 'Suresh', 'Mahesh', 'Kiran'];
const indianLastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Mehta', 'Joshi', 'Nair', 'Iyer', 'Das', 'Roy', 'Rao', 'Verma', 'Mishra'];
const cities = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Sivakasi', state: 'Tamil Nadu' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
];

export const mockUsers: UserProfile[] = Array.from({ length: 25 }, (_, i) => {
  const first = indianFirstNames[i % indianFirstNames.length];
  const last = indianLastNames[i % indianLastNames.length];
  const loc = cities[i % cities.length];
  return {
    uid: `user-${String(i + 1).padStart(3, '0')}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
    displayName: `${first} ${last}`,
    photoURL: i < 5 ? `https://i.pravatar.cc/150?u=${first.toLowerCase()}` : null,
    phone: `+91 ${9876500000 + i * 111}`,
    role: i === 0 ? 'admin' as const : 'user' as const,
    isActive: i !== 22, // one inactive
    city: loc.city,
    state: loc.state,
    createdAt: daysAgo(180 - i * 6),
    updatedAt: daysAgo(i),
  };
});

// =====================
// ORDERS
// =====================

export const mockOrders: AdminOrder[] = Array.from({ length: 30 }, (_, i) => {
  const user = mockUsers[i % mockUsers.length];
  const numItems = 1 + (i % 4);
  const orderProducts = Array.from({ length: numItems }, (_, j) => {
    const p = mockProducts[(i + j) % mockProducts.length];
    return {
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0],
      price: p.price,
      quantity: 1 + (j % 3),
    };
  });

  const subtotal = orderProducts.reduce((s, item) => s + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const status = i < 3 ? 'pending' : i < 5 ? 'confirmed' : i < 8 ? 'processing' : i < 12 ? 'shipped' : i < 25 ? 'delivered' : 'cancelled';
  const pStatus: PaymentStatus = status === 'cancelled' ? 'refunded' : status === 'pending' ? 'pending' : 'paid';
  const created = daysAgo(i * 2);

  return {
    id: `ORD-${String(2025001 + i)}`,
    userId: user.uid,
    items: orderProducts,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: status as OrderStatus,
    paymentStatus: pStatus,
    paymentMethod: i % 3 === 0 ? 'COD' : 'Razorpay',
    paymentId: pStatus === 'paid' ? `pay_${String(Math.random()).slice(2, 14)}` : undefined,
    trackingId: status === 'shipped' || status === 'delivered' ? `TRACK${String(1000 + i)}IN` : undefined,
    shippingAddress: {
      id: 'addr-1',
      label: 'Home',
      fullName: user.displayName,
      phone: user.phone,
      addressLine1: `${100 + i}, Block ${String.fromCharCode(65 + (i % 8))}, Main Road`,
      city: user.city ?? 'Mumbai',
      state: user.state ?? 'Maharashtra',
      pincode: String(400001 + i * 11),
      isDefault: true,
    },
    createdAt: created,
    updatedAt: daysAgo(Math.max(0, i * 2 - 1)),
    customerName: user.displayName,
    customerEmail: user.email,
    notes: i === 0 ? 'Please deliver before 6 PM — birthday surprise!' : '',
    statusHistory: [
      { status: 'pending', changedAt: created, changedBy: 'system' },
      ...(status !== 'pending' ? [{ status: 'confirmed' as OrderStatus, changedAt: daysAgo(i * 2 - 1), changedBy: 'admin-001' }] : []),
      ...(status === 'delivered' || status === 'shipped' ? [{ status: 'shipped' as OrderStatus, changedAt: daysAgo(Math.max(0, i * 2 - 3)), changedBy: 'admin-001' }] : []),
      ...(status === 'delivered' ? [{ status: 'delivered' as OrderStatus, changedAt: daysAgo(Math.max(0, i * 2 - 5)), changedBy: 'system' }] : []),
    ],
  };
});

// =====================
// SITE SETTINGS
// =====================

export const mockSiteSettings: SiteSettings = {
  siteName: 'Akash Crackers',
  announcementBar: {
    text: '🎆 Diwali Sale LIVE — Flat 30% off on all combo packs! Free shipping above ₹999',
    isActive: true,
    link: '/shop?category=combo-packs',
  },
  shippingRates: {
    freeThreshold: 999,
    standardRate: 99,
    expressRate: 199,
    packagingFee: 50,
    standardDays: '5-7',
    expressDays: '2-3',
  },
  paymentSettings: {
    razorpayEnabled: true,
    codEnabled: true,
    codLimit: 5000,
  },
  notificationTemplates: {},
};

// =====================
// DASHBOARD STATS
// =====================

export const mockDashboardStats = {
  totalRevenue: mockOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  ordersToday: 4,
  totalCustomers: mockUsers.length,
  lowStockCount: mockProducts.filter((p) => p.isActive && (p.stockCount ?? 0) <= 20).length,
};
