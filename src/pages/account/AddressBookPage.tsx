import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Star, X } from 'lucide-react';
import { Input } from '@/components/atoms/Input.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { EmptyState } from '@/components/atoms/EmptyState.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '@/services/firestore.ts';
import { cn } from '@/lib/utils.ts';
import type { Address } from '@/types/index.ts';

const emptyForm = { label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false };

export function AddressBookPage() {
  const user = useAuthStore((s) => s.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadAddresses = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getAddresses(user.uid);
      setAddresses(data);
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  useEffect(() => { loadAddresses(); }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (addr: Address) => {
    setForm({ label: addr.label, fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 ?? '', city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await updateAddress(user.uid, editingId, form);
      } else {
        await addAddress(user.uid, form);
      }
      await loadAddresses();
      setShowForm(false);
    } catch { /* ignore */ }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteAddress(user.uid, id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">
          Address Book
        </h2>
        <Button onClick={openAdd} size="sm"><Plus size={16} /> Add Address</Button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">
                  {editingId ? 'Edit Address' : 'New Address'}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-body-sm font-medium text-surface-700 dark:text-surface-300">Label</label>
                  <select name="label" value={form.label} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-body-md bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors">
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                  <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
                </div>
                <Input label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="House/Flat No, Street" required />
                <Input label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Landmark (optional)" />
                <div className="grid grid-cols-3 gap-4">
                  <Input label="City" name="city" value={form.city} onChange={handleChange} required />
                  <Input label="State" name="state" value={form.state} onChange={handleChange} required />
                  <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} required />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                  <span className="text-body-sm text-surface-600 dark:text-surface-400">Set as default address</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" fullWidth isLoading={isSaving}>{editingId ? 'Update' : 'Save'} Address</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={36} className="text-surface-400" />}
          title="No saved addresses"
          description="Add an address for faster checkout."
          action={<Button onClick={openAdd}><Plus size={16} /> Add Address</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={cn('bg-white dark:bg-surface-900 rounded-2xl p-5 border transition-colors', addr.isDefault ? 'border-brand-500/30' : 'border-surface-200 dark:border-surface-800')}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-caption font-bold uppercase text-surface-600 dark:text-surface-400">{addr.label}</span>
                  {addr.isDefault && <span className="flex items-center gap-1 text-caption font-bold text-brand-500"><Star size={12} /> Default</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(addr)} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(addr.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="font-medium text-body-md text-surface-900 dark:text-surface-100">{addr.fullName}</p>
              <p className="text-body-sm text-surface-500 mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
              <p className="text-body-sm text-surface-500">{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-body-sm text-surface-400 mt-1">{addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
