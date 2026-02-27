import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Store, Truck, CreditCard, Bell, Shield } from 'lucide-react';
import { Toggle } from '@/components/atoms/Toggle.tsx';
import { SkeletonCard } from '@/components/admin/Skeleton.tsx';
import { cn } from '@/lib/utils.ts';
import type { SiteSettings, ShippingRates, PaymentSettings } from '@/types/admin.ts';

const defaultSettings: SiteSettings = {
  siteName: 'Akash Crackers',
  announcementBar: { text: '', isActive: false },
  shippingRates: {
    freeThreshold: 999,
    standardRate: 0,
    expressRate: 199,
    packagingFee: 50,
    standardDays: '5-7',
    expressDays: '2-3',
  },
  paymentSettings: {
    razorpayEnabled: true,
    codEnabled: false,
    codLimit: 5000,
  },
  notificationTemplates: {},
};

interface NotifSettings {
  emailOrderUpdates: boolean;
  emailPromotions: boolean;
  smsOrderUpdates: boolean;
  smsPromotions: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
}

interface SecSettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
}

const defaultNotif: NotifSettings = {
  emailOrderUpdates: true,
  emailPromotions: false,
  smsOrderUpdates: false,
  smsPromotions: false,
  lowStockAlert: true,
  lowStockThreshold: 20,
};

const defaultSec: SecSettings = {
  sessionTimeout: 60,
  maxLoginAttempts: 5,
};

type Tab = 'general' | 'shipping' | 'payment' | 'notifications' | 'security';

const tabs: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'general', label: 'General', icon: Store, description: 'Store name & announcement' },
  { id: 'shipping', label: 'Shipping', icon: Truck, description: 'Rates & delivery times' },
  { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Payment methods' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email, SMS & alerts' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Sessions & access' },
];

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow';

const labelClass = 'block text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5';

const hintClass = 'text-caption text-surface-400 mt-1';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-body-md font-semibold text-surface-900 dark:text-surface-100">{children}</h3>;
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5', className)}>
      {children}
    </div>
  );
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(defaultNotif);
  const [secSettings, setSecSettings] = useState<SecSettings>(defaultSec);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  useEffect(() => {
    (async () => {
      try {
        const { getSiteSettings, getContentSection } = await import('@/services/admin.ts');
        const [result, notif, sec] = await Promise.all([
          getSiteSettings(),
          getContentSection<NotifSettings>('notification-settings'),
          getContentSection<SecSettings>('security-settings'),
        ]);
        if (result) setSettings({ ...defaultSettings, ...result });
        if (notif) setNotifSettings({ ...defaultNotif, ...notif });
        if (sec) setSecSettings({ ...defaultSec, ...sec });
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const { updateSiteSettings, updateContentSection } = await import('@/services/admin.ts');
      await Promise.all([
        updateSiteSettings(settings),
        updateContentSection('notification-settings', notifSettings as unknown as Record<string, unknown>),
        updateContentSection('security-settings', secSettings as unknown as Record<string, unknown>),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  };

  const updateShipping = (field: keyof ShippingRates, value: string | number) => {
    setSettings((s) => ({ ...s, shippingRates: { ...s.shippingRates, [field]: value } }));
  };

  const updatePayment = (field: keyof PaymentSettings, value: boolean | number) => {
    setSettings((s) => ({ ...s, paymentSettings: { ...s.paymentSettings, [field]: value } }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-0">
      {/* Vertical Tab Navigation */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 space-y-1">
        {tabs.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-start gap-3 w-full px-3.5 py-3 rounded-xl text-left transition-colors',
              activeTab === id
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800',
            )}
          >
            <Icon size={18} className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className={cn('text-body-sm font-medium', activeTab === id ? 'text-brand-600 dark:text-brand-400' : 'text-surface-700 dark:text-surface-200')}>
                {label}
              </p>
              <p className="text-caption text-surface-400 truncate">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Mobile horizontal tabs */}
      <div className="flex md:hidden gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide absolute top-0 left-0 right-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-body-sm font-medium whitespace-nowrap transition-colors',
              activeTab === id
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800',
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Content Header — tab title + save */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-body-lg text-surface-900 dark:text-surface-50">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-caption text-surface-400">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-body-sm text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 size={16} />
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm shadow-brand-500/20"
            >
              <Save size={15} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <>
            <SectionCard>
              <div className="space-y-5">
                <SectionTitle>Store Information</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
                      className={inputClass}
                    />
                    <p className={hintClass}>Displayed in browser tab and emails</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionTitle>Announcement Bar</SectionTitle>
                  <Toggle
                    checked={settings.announcementBar.isActive}
                    onChange={(v) => setSettings((s) => ({ ...s, announcementBar: { ...s.announcementBar, isActive: v } }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Announcement Text</label>
                  <input
                    type="text"
                    value={settings.announcementBar.text}
                    onChange={(e) => setSettings((s) => ({ ...s, announcementBar: { ...s.announcementBar, text: e.target.value } }))}
                    className={inputClass}
                    placeholder="e.g. Free shipping on orders above ₹999!"
                    disabled={!settings.announcementBar.isActive}
                  />
                  <p className={hintClass}>Shows a banner at the top of your store</p>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <>
            <SectionCard>
              <div className="space-y-5">
                <SectionTitle>Standard Shipping</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Rate (INR)</label>
                    <input
                      type="number"
                      value={settings.shippingRates.standardRate}
                      onChange={(e) => updateShipping('standardRate', Number(e.target.value))}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Delivery Time</label>
                    <input
                      type="text"
                      value={settings.shippingRates.standardDays}
                      onChange={(e) => updateShipping('standardDays', e.target.value)}
                      className={inputClass}
                      placeholder="5-7"
                    />
                    <p className={hintClass}>e.g. 5-7 business days</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-5">
                <SectionTitle>Express Shipping</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Rate (INR)</label>
                    <input
                      type="number"
                      value={settings.shippingRates.expressRate}
                      onChange={(e) => updateShipping('expressRate', Number(e.target.value))}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Delivery Time</label>
                    <input
                      type="text"
                      value={settings.shippingRates.expressDays}
                      onChange={(e) => updateShipping('expressDays', e.target.value)}
                      className={inputClass}
                      placeholder="2-3"
                    />
                    <p className={hintClass}>e.g. 2-3 business days</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-5">
                <SectionTitle>Free Shipping & Packaging</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Free Shipping Threshold (INR)</label>
                    <input
                      type="number"
                      value={settings.shippingRates.freeThreshold}
                      onChange={(e) => updateShipping('freeThreshold', Number(e.target.value))}
                      className={inputClass}
                      min="0"
                    />
                    <p className={hintClass}>Orders above this amount get free standard shipping</p>
                  </div>
                  <div>
                    <label className={labelClass}>Packaging Fee (INR)</label>
                    <input
                      type="number"
                      value={settings.shippingRates.packagingFee}
                      onChange={(e) => updateShipping('packagingFee', Number(e.target.value))}
                      className={inputClass}
                      min="0"
                    />
                    <p className={hintClass}>Optional — can be toggled per bill in Billing</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <>
            <SectionCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SectionTitle>Razorpay</SectionTitle>
                    <p className="text-caption text-surface-400 mt-0.5">Accept online payments via UPI, cards, and net banking</p>
                  </div>
                  <Toggle
                    checked={settings.paymentSettings.razorpayEnabled}
                    onChange={(v) => updatePayment('razorpayEnabled', v)}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SectionTitle>Cash on Delivery</SectionTitle>
                    <p className="text-caption text-surface-400 mt-0.5">Allow customers to pay when order is delivered</p>
                  </div>
                  <Toggle
                    checked={settings.paymentSettings.codEnabled}
                    onChange={(v) => updatePayment('codEnabled', v)}
                  />
                </div>
                {settings.paymentSettings.codEnabled && (
                  <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div className="max-w-sm">
                      <label className={labelClass}>COD Limit (INR)</label>
                      <input
                        type="number"
                        value={settings.paymentSettings.codLimit}
                        onChange={(e) => updatePayment('codLimit', Number(e.target.value))}
                        className={inputClass}
                        min="0"
                      />
                      <p className={hintClass}>Maximum order value allowed for COD</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            <SectionCard>
              <div className="space-y-4">
                <SectionTitle>Email Notifications</SectionTitle>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2.5 border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Order Updates</p>
                      <p className="text-caption text-surface-400">Email customers when order status changes</p>
                    </div>
                    <Toggle
                      checked={notifSettings.emailOrderUpdates}
                      onChange={(v) => setNotifSettings((s) => ({ ...s, emailOrderUpdates: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Promotional Emails</p>
                      <p className="text-caption text-surface-400">Marketing and offer emails to customers</p>
                    </div>
                    <Toggle
                      checked={notifSettings.emailPromotions}
                      onChange={(v) => setNotifSettings((s) => ({ ...s, emailPromotions: v }))}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-4">
                <SectionTitle>SMS Notifications</SectionTitle>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2.5 border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Order Updates</p>
                      <p className="text-caption text-surface-400">SMS customers when order status changes</p>
                    </div>
                    <Toggle
                      checked={notifSettings.smsOrderUpdates}
                      onChange={(v) => setNotifSettings((s) => ({ ...s, smsOrderUpdates: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Promotional SMS</p>
                      <p className="text-caption text-surface-400">Marketing SMS to customers</p>
                    </div>
                    <Toggle
                      checked={notifSettings.smsPromotions}
                      onChange={(v) => setNotifSettings((s) => ({ ...s, smsPromotions: v }))}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SectionTitle>Low Stock Alerts</SectionTitle>
                    <p className="text-caption text-surface-400 mt-0.5">Get notified when products are running low</p>
                  </div>
                  <Toggle
                    checked={notifSettings.lowStockAlert}
                    onChange={(v) => setNotifSettings((s) => ({ ...s, lowStockAlert: v }))}
                  />
                </div>
                {notifSettings.lowStockAlert && (
                  <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div className="max-w-sm">
                      <label className={labelClass}>Stock Threshold</label>
                      <input
                        type="number"
                        value={notifSettings.lowStockThreshold}
                        onChange={(e) => setNotifSettings((s) => ({ ...s, lowStockThreshold: Number(e.target.value) }))}
                        className={inputClass}
                        min="1"
                      />
                      <p className={hintClass}>Alert when stock falls below this number</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <>
            <SectionCard>
              <div className="space-y-5">
                <SectionTitle>Session Management</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={secSettings.sessionTimeout}
                      onChange={(e) => setSecSettings((s) => ({ ...s, sessionTimeout: Number(e.target.value) }))}
                      className={inputClass}
                      min="5"
                      max="1440"
                    />
                    <p className={hintClass}>Auto logout after inactivity (5–1440 min)</p>
                  </div>
                  <div>
                    <label className={labelClass}>Max Login Attempts</label>
                    <input
                      type="number"
                      value={secSettings.maxLoginAttempts}
                      onChange={(e) => setSecSettings((s) => ({ ...s, maxLoginAttempts: Number(e.target.value) }))}
                      className={inputClass}
                      min="3"
                      max="10"
                    />
                    <p className={hintClass}>Lock account after failed attempts</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="space-y-4">
                <SectionTitle>Security Status</SectionTitle>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Firebase Authentication</p>
                      <p className="text-caption text-surface-400">Email/password and Google sign-in enabled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Firestore Security Rules</p>
                      <p className="text-caption text-surface-400">Role-based access control enforced</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                    <div className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-surface-400" />
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-surface-700 dark:text-surface-200">Two-Factor Authentication</p>
                      <p className="text-caption text-surface-400">Configure in Firebase Console</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}

      </div>
    </div>
  );
}
