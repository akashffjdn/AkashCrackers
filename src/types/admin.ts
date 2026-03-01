import type { Product, OrderStatus, Order } from './index.ts';
export type { PaymentStatus } from './index.ts';

// =====================
// ADMIN PRODUCT
// =====================

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface AdminProduct extends Product {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  tags?: string[];
  specifications?: ProductSpecification[];
}

// =====================
// ADMIN ORDER
// =====================

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface AdminOrder extends Order {
  customerName: string;
  customerEmail: string;
  notes: string;
  statusHistory: StatusHistoryEntry[];
}

// =====================
// CATEGORY
// =====================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// =====================
// SITE SETTINGS
// =====================

export interface AnnouncementBar {
  text: string;
  isActive: boolean;
  link?: string;
}

export interface ShippingRates {
  freeThreshold: number;
  standardRate: number;
  expressRate: number;
  packagingFee: number;
  standardDays: string;
  expressDays: string;
}

export interface PaymentSettings {
  razorpayEnabled: boolean;
  codEnabled: boolean;
  codLimit: number;
}

export interface SiteSettings {
  siteName: string;
  announcementBar: AnnouncementBar;
  shippingRates: ShippingRates;
  paymentSettings: PaymentSettings;
  notificationTemplates: Record<string, string>;
}

export interface HeroSlideAdmin {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  isActive: boolean;
  order: number;
}

export interface HeroSettings {
  slides: HeroSlideAdmin[];
  featuredProductIds: string[];
}

// =====================
// DASHBOARD & ANALYTICS
// =====================

export interface DashboardKPIs {
  totalRevenue: number;
  ordersToday: number;
  totalCustomers: number;
  lowStockCount: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

export interface DailyAnalytics {
  date: string;
  revenue: number;
  orderCount: number;
  newCustomers: number;
  productsSold: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

// =====================
// PAGINATION
// =====================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
}

// =====================
// TABLE
// =====================

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

// =====================
// CONTENT MANAGEMENT
// =====================

export interface ContentSection {
  id: string;
  type: 'header' | 'hero' | 'about' | 'features' | 'how-it-works' | 'testimonials' | 'footer' | 'cta' | 'custom';
  title: string;
  content: Record<string, unknown>;
  isActive: boolean;
  order: number;
  updatedAt: string;
}

export interface AdminTestimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  isActive: boolean;
  order: number;
}

export interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  value: string;
  isActive: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  items: FAQItem[];
  order: number;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
}

export interface FooterSettings {
  copyrightText: string;
  badges: string[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

// =====================
// ADMIN SETTINGS (EXPANDED)
// =====================

export interface StoreSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  logo?: string;
}

export interface ShippingSettings {
  freeThreshold: number;
  standardRate: number;
  expressRate: number;
  standardDays: string;
  expressDays: string;
  enableExpress: boolean;
  restrictedPincodes: string[];
}

export interface NotificationSettings {
  emailOrderUpdates: boolean;
  emailPromotions: boolean;
  smsOrderUpdates: boolean;
  smsPromotions: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  maxLoginAttempts: number;
}

export interface AdminSettings {
  store: StoreSettings;
  shipping: ShippingSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

// =====================
// ADMIN PROFILE
// =====================

export interface AdminProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL: string | null;
  role: string;
  department?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  device?: string;
  ip?: string;
}

// =====================
// ANALYTICS (ENHANCED)
// =====================

export interface RevenueBreakdown {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  todayChange: number;
  weekChange: number;
  monthChange: number;
}

export interface CustomerInsight {
  newCustomers: number;
  returningCustomers: number;
  newChange: number;
  returningChange: number;
}

export interface AnalyticsKPI {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

// =====================
// BILLING / POS
// =====================

export type BillPaymentMethod = 'cash' | 'upi' | 'card';
export type BillStatus = 'completed' | 'held' | 'cancelled';

export interface BillItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
}

export interface BillPayment {
  method: BillPaymentMethod;
  amount: number;
  reference?: string;
  receivedAmount?: number;
  changeAmount?: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  status: BillStatus;
  customerName?: string;
  customerPhone?: string;
  items: BillItem[];
  discountPercent: number;
  subtotal: number;
  totalDiscount: number;
  packagingFee: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  grandTotal: number;
  roundOff: number;
  payment: BillPayment;
  itemCount: number;
  totalQuantity: number;
  createdAt: string;
  createdBy: string;
}
