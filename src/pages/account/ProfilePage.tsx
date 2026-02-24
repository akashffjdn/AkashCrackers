import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { Input } from '@/components/atoms/Input.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { updateUserProfile } from '@/services/firestore.ts';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    phone: user?.phone ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, { displayName: form.displayName, phone: form.phone });
      setUser({ ...user, displayName: form.displayName, phone: form.phone });
      setIsSaved(true);
    } catch {
      // handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
        Personal Information
      </h2>

      <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-surface-200 dark:border-surface-800">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-surface-100 dark:border-surface-800">
          <Avatar src={user?.photoURL} name={user?.displayName ?? 'U'} size="xl" />
          <div>
            <p className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">
              {user?.displayName || 'User'}
            </p>
            <p className="text-body-sm text-surface-400">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <Input
            label="Full Name"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
          <Input
            label="Email"
            value={user?.email ?? ''}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="lg" isLoading={isLoading}>
              <Save size={18} />
              Save Changes
            </Button>
            {isSaved && (
              <span className="flex items-center gap-1.5 text-body-sm text-emerald-500 font-medium">
                <CheckCircle size={16} /> Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
