import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ChevronLeft } from 'lucide-react';
import { slugify } from '@/lib/utils.ts';
import { useAuthStore } from '@/store/auth.ts';
import { Toggle } from '@/components/atoms/Toggle.tsx';

type FormData = {
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  name: '',
  slug: '',
  description: '',
  image: '',
  displayOrder: '0',
  isActive: true,
};

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow';

const labelClass = 'block text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5';

export function AdminCategoryFormPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!categoryId;

  const [form, setForm] = useState<FormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId) return;
    (async () => {
      try {
        const { getCategoryById } = await import('@/services/admin.ts');
        const category = await getCategoryById(categoryId);
        if (category) {
          setForm({
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image ?? '',
            displayOrder: String(category.displayOrder),
            isActive: category.isActive,
          });
        }
      } catch {
        setError('Failed to load category');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [categoryId]);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const { createCategory, updateCategory } = await import('@/services/admin.ts');
      const categoryData = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        image: form.image || undefined,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      if (isEdit && categoryId) {
        await updateCategory(categoryId, categoryData);
      } else {
        await createCategory(categoryData, user?.uid ?? '');
      }
      navigate('/admin/categories');
    } catch {
      setError('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/categories" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ChevronLeft size={16} />
          Back to Categories
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/categories"
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
            {isSaving ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-body-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">
            <h2 className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-50 mb-4">
              Category Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Aerial Fireworks"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className={inputClass}
                  placeholder="auto-generated"
                />
              </div>
              <div className="col-span-full">
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Brief description of this category"
                />
              </div>
              <div className="col-span-full">
                <label className={labelClass}>Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className={inputClass}
                  placeholder="https://..."
                />
                {form.image && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 space-y-4">
            <h2 className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-50">
              Settings
            </h2>
            <Toggle
              label="Active"
              description="Show on the storefront"
              checked={form.isActive}
              onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
            <div>
              <label className={labelClass}>Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                className={inputClass}
                min="0"
              />
              <p className="text-caption text-surface-400 mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </div>
      </div>

    </form>
  );
}
