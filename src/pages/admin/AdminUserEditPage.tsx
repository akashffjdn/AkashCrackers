import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Toggle } from '@/components/atoms/Toggle.tsx';
import type { UserProfile, UserRole } from '@/types/index.ts';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow';

const labelClass = 'block text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5';

export function AdminUserEditPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isActive, setIsActive] = useState(true);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const { getCustomerById } = await import('@/services/admin.ts');
        const data = await getCustomerById(uid);
        if (data) {
          setUser(data);
          setDisplayName(data.displayName);
          setPhone(data.phone || '');
          setRole(data.role ?? 'user');
          setIsActive(data.isActive !== false);
          setCity(data.city || '');
          setState(data.state || '');
        }
      } catch {
        setError('Failed to load user');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setIsSaving(true);
    setError('');
    try {
      const { updateUserProfile } = await import('@/services/admin.ts');
      await updateUserProfile(uid, {
        displayName,
        phone,
        role,
        isActive,
        city,
        state,
      });
      navigate(`/admin/users/${uid}`);
    } catch {
      setError('Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to={`/admin/users/${uid}`} className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to User
        </Link>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/admin/users/${uid}`} className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to User
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/users/${uid}`}
            className="px-4 h-9 rounded-lg border border-surface-200 dark:border-surface-700 text-[13px] font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-850 transition-colors inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm shadow-brand-500/20"
          >
            <Save size={15} />
            {isSaving ? 'Saving...' : 'Update User'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-body-sm font-medium">
          {error}
        </div>
      )}

      {/* Single card with all fields */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 space-y-5">
        {/* Status toggle at the top */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
          <Toggle
            label="Active"
            description="Allow user to access the store"
            checked={isActive}
            onChange={setIsActive}
          />
        </div>

        {/* User fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
            <p className="text-caption text-surface-400 mt-1">Cannot be changed</p>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+91..." />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City" />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} placeholder="State" />
          </div>
        </div>
      </div>
    </form>
  );
}
