import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, X, Save, ChevronLeft } from 'lucide-react';
import { slugify } from '@/lib/utils.ts';
import { useAuthStore } from '@/store/auth.ts';
import { Toggle } from '@/components/atoms/Toggle.tsx';
import type { ProductCategory, ProductOccasion, ProductBadge } from '@/types/index.ts';

const categoryOptions: ProductCategory[] = [
  'aerial',
  'ground',
  'rockets',
  'sparklers',
  'fountains',
  'roman-candles',
  'novelty',
  'combo-packs',
];

const occasionOptions: ProductOccasion[] = [
  'diwali',
  'new-year',
  'wedding',
  'birthday',
  'festival',
  'professional',
];

const badgeOptions: (ProductBadge | '')[] = ['', 'new', 'bestseller', 'limited', 'premium', 'low-noise'];
const safetyOptions = ['family', 'standard', 'professional'] as const;
const noiseOptions = ['low', 'medium', 'high'] as const;

type Spec = { key: string; value: string };

type FormData = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  originalPrice: string;
  images: string[];
  category: ProductCategory;
  occasion: ProductOccasion[];
  badge: ProductBadge | '';
  rating: string;
  reviewCount: string;
  inStock: boolean;
  stockCount: string;
  features: string[];
  safetyRating: 'family' | 'standard' | 'professional';
  noiseLevel: 'low' | 'medium' | 'high';
  effects: string[];
  duration: string;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  specifications: Spec[];
};

const emptyForm: FormData = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: '',
  originalPrice: '',
  images: [''],
  category: 'aerial',
  occasion: [],
  badge: '',
  rating: '4.5',
  reviewCount: '0',
  inStock: true,
  stockCount: '100',
  features: [''],
  safetyRating: 'family',
  noiseLevel: 'medium',
  effects: [''],
  duration: '',
  isNew: false,
  isFeatured: false,
  isActive: true,
  tags: [],
  specifications: [],
};

export function AdminProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!productId;

  const [form, setForm] = useState<FormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const { getProductById } = await import('@/services/admin.ts');
        const product = await getProductById(productId);
        if (product) {
          setForm({
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.shortDescription,
            price: String(product.price),
            originalPrice: product.originalPrice ? String(product.originalPrice) : '',
            images: product.images.length > 0 ? product.images : [''],
            category: product.category,
            occasion: product.occasion,
            badge: product.badge ?? '',
            rating: String(product.rating),
            reviewCount: String(product.reviewCount),
            inStock: product.inStock,
            stockCount: String(product.stockCount ?? 0),
            features: product.features.length > 0 ? product.features : [''],
            safetyRating: product.safetyRating,
            noiseLevel: product.noiseLevel,
            effects: product.effects.length > 0 ? product.effects : [''],
            duration: product.duration ?? '',
            isNew: product.isNew ?? false,
            isFeatured: product.isFeatured ?? false,
            isActive: product.isActive !== false,
            tags: product.tags ?? [],
            specifications: product.specifications ?? [],
          });
        }
      } catch {
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [productId]);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
  };

  const handleListChange = (field: 'images' | 'features' | 'effects', index: number, value: string) => {
    setForm((f) => {
      const arr = [...f[field]];
      arr[index] = value;
      return { ...f, [field]: arr };
    });
  };

  const addListItem = (field: 'images' | 'features' | 'effects') => {
    setForm((f) => ({ ...f, [field]: [...f[field], ''] }));
  };

  const removeListItem = (field: 'images' | 'features' | 'effects', index: number) => {
    setForm((f) => {
      const arr = f[field].filter((_, i) => i !== index);
      return { ...f, [field]: arr.length === 0 ? [''] : arr };
    });
  };

  const toggleOccasion = (occ: ProductOccasion) => {
    setForm((f) => ({
      ...f,
      occasion: f.occasion.includes(occ)
        ? f.occasion.filter((o) => o !== occ)
        : [...f.occasion, occ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const { createProduct, updateProduct } = await import('@/services/admin.ts');
      const productData = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        images: form.images.filter(Boolean),
        category: form.category,
        occasion: form.occasion,
        badge: form.badge || undefined,
        rating: Number(form.rating) || 4.5,
        reviewCount: Number(form.reviewCount) || 0,
        inStock: form.inStock,
        stockCount: Number(form.stockCount) || 0,
        features: form.features.filter(Boolean),
        safetyRating: form.safetyRating,
        noiseLevel: form.noiseLevel,
        effects: form.effects.filter(Boolean),
        duration: form.duration || undefined,
        isNew: form.isNew,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        tags: form.tags.filter(Boolean),
        specifications: form.specifications.filter((s) => s.key && s.value),
      };

      if (isEdit && productId) {
        await updateProduct(productId, productData);
      } else {
        await createProduct(productData, user?.uid ?? '');
      }
      navigate('/admin/products');
    } catch {
      setError('Failed to save product');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top Header — Back + Actions */}
      <div className="flex items-center justify-between">
        <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ChevronLeft size={16} />
          Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
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
            {isSaving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-body-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ──────────── Primary Column (2/3) ──────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Product Name">
                <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="input-field" required />
              </Field>
              <Field label="Slug">
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input-field" />
              </Field>
              <Field label="Short Description" full>
                <input type="text" value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="input-field" />
              </Field>
              <Field label="Description" full>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
              </Field>
            </div>
          </Card>

          {/* Pricing + Inventory (combined) */}
          <Card title="Pricing">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Selling Price (INR)">
                <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input-field" required min="0" />
              </Field>
              <Field label="MRP / Original Price">
                <input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} className="input-field" min="0" />
              </Field>
              <Field label="Stock Count">
                <input type="number" value={form.stockCount} onChange={(e) => setForm((f) => ({ ...f, stockCount: e.target.value }))} className="input-field" min="0" />
              </Field>
              {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                <div className="col-span-full p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                  <p className="text-body-sm font-medium text-green-700 dark:text-green-400">
                    Discount: {Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% off
                    <span className="text-surface-500 font-normal ml-2">(Save ₹{Number(form.originalPrice) - Number(form.price)})</span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Images */}
          <Card title="Images">
            <div className="space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input type="url" value={img} onChange={(e) => handleListChange('images', i, e.target.value)} placeholder="Image URL" className="input-field flex-1" />
                  <button type="button" onClick={() => removeListItem('images', i)} className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addListItem('images')} className="flex items-center gap-1.5 text-body-sm text-brand-600 font-medium hover:underline">
                <Plus size={14} /> Add Image URL
              </button>
            </div>
          </Card>

          {/* Attributes */}
          <Card title="Attributes">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Safety Rating">
                <select value={form.safetyRating} onChange={(e) => setForm((f) => ({ ...f, safetyRating: e.target.value as typeof form.safetyRating }))} className="input-field">
                  {safetyOptions.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
                </select>
              </Field>
              <Field label="Noise Level">
                <select value={form.noiseLevel} onChange={(e) => setForm((f) => ({ ...f, noiseLevel: e.target.value as typeof form.noiseLevel }))} className="input-field">
                  {noiseOptions.map((n) => (<option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>))}
                </select>
              </Field>
              <Field label="Duration">
                <input type="text" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g., 45s" className="input-field" />
              </Field>
              <Field label="Rating">
                <input type="number" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} className="input-field" min="0" max="5" step="0.1" />
              </Field>
            </div>
          </Card>

          {/* Features + Effects side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="Features">
              <div className="space-y-2">
                {form.features.map((feat, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={feat} onChange={(e) => handleListChange('features', i, e.target.value)} placeholder="Feature" className="input-field flex-1" />
                    <button type="button" onClick={() => removeListItem('features', i)} className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addListItem('features')} className="flex items-center gap-1.5 text-body-sm text-brand-600 font-medium hover:underline"><Plus size={14} /> Add Feature</button>
              </div>
            </Card>

            <Card title="Effects">
              <div className="space-y-2">
                {form.effects.map((eff, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={eff} onChange={(e) => handleListChange('effects', i, e.target.value)} placeholder="Effect" className="input-field flex-1" />
                    <button type="button" onClick={() => removeListItem('effects', i)} className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addListItem('effects')} className="flex items-center gap-1.5 text-body-sm text-brand-600 font-medium hover:underline"><Plus size={14} /> Add Effect</button>
              </div>
            </Card>
          </div>

          {/* Specifications */}
          <Card title="Specifications">
            <div className="space-y-2">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => setForm((f) => ({ ...f, specifications: f.specifications.map((s, idx) => idx === i ? { ...s, key: e.target.value } : s) }))}
                    placeholder="Key (e.g., Weight)"
                    className="input-field flex-1"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => setForm((f) => ({ ...f, specifications: f.specifications.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s) }))}
                    placeholder="Value (e.g., 500g)"
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }))} className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }))}
                className="flex items-center gap-1.5 text-body-sm text-brand-600 font-medium hover:underline"
              >
                <Plus size={14} /> Add Specification
              </button>
            </div>
          </Card>
        </div>

        {/* ──────────── Sidebar (1/3, sticky) ──────────── */}
        <div className="lg:sticky lg:top-4 self-start space-y-4">

          {/* Status & Visibility */}
          <Card title="Status">
            <div className="space-y-3">
              <Toggle label="Active" description="Visible on storefront" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <Toggle label="In Stock" description="Available for purchase" checked={form.inStock} onChange={(v) => setForm((f) => ({ ...f, inStock: v }))} />
              <div className="border-t border-surface-100 dark:border-surface-800 pt-3">
                <Toggle label="New Badge" description="Show 'New' label" checked={form.isNew} onChange={(v) => setForm((f) => ({ ...f, isNew: v }))} />
              </div>
              <Toggle label="Featured" description="Show on homepage" checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
            </div>
          </Card>

          {/* Organization */}
          <Card title="Organization">
            <div className="space-y-3">
              <Field label="Category" full>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))} className="input-field">
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                  ))}
                </select>
              </Field>
              <Field label="Badge" full>
                <select value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value as ProductBadge | '' }))} className="input-field">
                  {badgeOptions.map((b) => (
                    <option key={b} value={b}>{b ? b.charAt(0).toUpperCase() + b.slice(1) : 'None'}</option>
                  ))}
                </select>
              </Field>
              <div>
                <label className="block text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Occasions</label>
                <div className="flex flex-wrap gap-1.5">
                  {occasionOptions.map((occ) => (
                    <button key={occ} type="button" onClick={() => toggleOccasion(occ)} className={`px-2.5 py-1 rounded-lg text-caption font-medium border transition-colors ${form.occasion.includes(occ) ? 'bg-brand-500/10 text-brand-600 border-brand-500/20' : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-surface-300'}`}>
                      {occ.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card title="Tags">
            <div className="space-y-2">
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 text-caption font-medium">
                      {tag}
                      <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Type a tag and press Enter"
                className="input-field"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !form.tags.includes(val)) {
                      setForm((f) => ({ ...f, tags: [...f.tags, val] }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <p className="text-caption text-surface-400">Press Enter to add</p>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4">
      <h2 className="font-display font-semibold text-body-sm text-surface-900 dark:text-surface-50 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <label className="block text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
