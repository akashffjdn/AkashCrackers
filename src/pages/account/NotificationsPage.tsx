import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { Toggle } from '@/components/atoms/Toggle.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { getNotificationPrefs, updateNotificationPrefs } from '@/services/firestore.ts';
import type { NotificationPreferences } from '@/types/index.ts';

const defaultPrefs: NotificationPreferences = {
  emailPromotions: true,
  emailOrderUpdates: true,
  smsOrderUpdates: true,
  smsPromotions: false,
  pushNotifications: true,
};

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getNotificationPrefs(user.uid)
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setIsSaved(false);
    if (!user) return;
    try {
      await updateNotificationPrefs(user.uid, { [key]: value });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch { /* ignore */ }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">
          Notification Preferences
        </h2>
        {isSaved && (
          <span className="flex items-center gap-1.5 text-body-sm text-emerald-500 font-medium">
            <CheckCircle size={16} /> Saved
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Mail size={20} className="text-blue-500" />
            </div>
            <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">Email</h3>
          </div>
          <div className="space-y-4">
            <Toggle
              label="Order Updates"
              description="Get notified about order status changes and delivery updates"
              checked={prefs.emailOrderUpdates}
              onChange={(v) => handleToggle('emailOrderUpdates', v)}
            />
            <Toggle
              label="Promotions & Offers"
              description="Receive exclusive deals, seasonal offers, and new product alerts"
              checked={prefs.emailPromotions}
              onChange={(v) => handleToggle('emailPromotions', v)}
            />
          </div>
        </div>

        {/* SMS */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-emerald-500" />
            </div>
            <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">SMS</h3>
          </div>
          <div className="space-y-4">
            <Toggle
              label="Order Updates"
              description="SMS alerts for shipping and delivery status"
              checked={prefs.smsOrderUpdates}
              onChange={(v) => handleToggle('smsOrderUpdates', v)}
            />
            <Toggle
              label="Promotions"
              description="Special offers and festive deals via SMS"
              checked={prefs.smsPromotions}
              onChange={(v) => handleToggle('smsPromotions', v)}
            />
          </div>
        </div>

        {/* Push */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bell size={20} className="text-purple-500" />
            </div>
            <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">Push Notifications</h3>
          </div>
          <Toggle
            label="Browser Notifications"
            description="Real-time alerts for orders, price drops, and back-in-stock products"
            checked={prefs.pushNotifications}
            onChange={(v) => handleToggle('pushNotifications', v)}
          />
        </div>
      </div>
    </motion.div>
  );
}
