import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, X, Save, ChevronLeft, Upload, Link as LinkIcon, Eye, Play } from 'lucide-react';
import { slugify, getYouTubeId } from '@/lib/utils.ts';
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
  videoUrl: string;
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
  videoUrl: '',
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
            videoUrl: product.videoUrl ?? '',
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
        videoUrl: form.videoUrl.trim() || undefined,
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
            <ImageUploader
              images={form.images}
              onChange={(images) => setForm((f) => ({ ...f, images }))}
            />
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

          {/* Product Video */}
          <Card title="Product Video">
            <div className="space-y-2">
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="Paste YouTube URL"
                className="input-field"
              />
              {(() => {
                const vid = getYouTubeId(form.videoUrl);
                if (!vid) return null;
                return (
                  <div className="relative rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
                    <img src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} alt="Video thumbnail" className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                        <Play size={18} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, videoUrl: '' }))} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                );
              })()}
              <p className="text-caption text-surface-400">Add a YouTube video showing how this cracker works</p>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

// ─── Image Uploader with URL + File support ───

function ImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const addImage = (src: string) => {
    if (!src) return;
    const emptyIdx = images.findIndex((img) => !img);
    if (emptyIdx >= 0) {
      const updated = [...images];
      updated[emptyIdx] = src;
      onChange(updated);
    } else {
      onChange([...images, src]);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? [''] : updated);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const valid = images.filter(Boolean);
    const moved = valid[index];
    const rest = valid.filter((_, i) => i !== index);
    onChange([moved, ...rest]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') addImage(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (url) { addImage(url); setUrlInput(''); setShowUrl(false); }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

  const validImages = images.filter(Boolean);

  // Empty state
  if (validImages.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'border-brand-500 bg-brand-500/5' : 'border-surface-300 dark:border-surface-600 hover:border-brand-400'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Upload size={20} className="text-surface-400" />
        <p className="text-body-sm text-surface-500">Drop images here or <span className="text-brand-500 font-medium">browse</span></p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-caption text-surface-400">PNG, JPG, WEBP</span>
          <span className="text-surface-300">|</span>
          <button type="button" onClick={(e) => { e.stopPropagation(); setShowUrl(true); }} className="text-caption text-brand-500 font-medium hover:underline">
            Paste URL
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
        {showUrl && (
          <div className="flex gap-2 mt-2 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }} placeholder="https://..." className="input-field flex-1" autoFocus />
            <button type="button" onClick={handleAddUrl} disabled={!urlInput.trim()} className="px-3 h-9 rounded-lg bg-brand-500 text-white text-caption font-medium disabled:opacity-40">Add</button>
          </div>
        )}
      </div>
    );
  }

  // Horizontal scroll strip — all same size
  return (
    <div
      className={`space-y-2 ${isDragging ? 'ring-2 ring-brand-500/30 rounded-xl' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {validImages.map((img, i) => (
          <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 bg-surface-50 dark:bg-surface-800 flex-shrink-0" style={{ borderColor: i === 0 ? 'var(--color-brand-500, #ef4444)' : 'var(--color-surface-200, #e5e5e5)' }}>
            <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            {i === 0 && (
              <span className="absolute top-1 left-1 px-1 py-px rounded text-[8px] font-bold uppercase bg-brand-500 text-white">Main</span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <button type="button" onClick={() => setPreviewImg(img)} className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
              <Eye size={14} />
            </button>
            <button type="button" onClick={() => removeImage(images.indexOf(img))} className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
              <X size={10} />
            </button>
            {i > 0 && (
              <button type="button" onClick={() => setAsPrimary(i)} className="absolute bottom-0.5 inset-x-0.5 rounded bg-black/60 text-white text-[8px] font-medium text-center py-px opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-500">
                Set main
              </button>
            )}
          </div>
        ))}
        {/* Add tile */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex flex-col items-center justify-center gap-0.5 text-surface-400 hover:border-brand-400 hover:text-brand-500 transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span className="text-[9px] font-medium">Add</span>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />

      {/* Bottom actions row */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-caption font-medium text-surface-500 hover:text-brand-500 hover:bg-brand-500/5 transition-colors">
          <Upload size={12} /> Upload
        </button>
        <button type="button" onClick={() => setShowUrl(!showUrl)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-caption font-medium text-surface-500 hover:text-brand-500 hover:bg-brand-500/5 transition-colors">
          <LinkIcon size={12} /> URL
        </button>
        <span className="ml-auto text-caption text-surface-400">{validImages.length} image{validImages.length !== 1 ? 's' : ''}</span>
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }} placeholder="Paste image URL and press Enter" className="input-field flex-1" autoFocus />
          <button type="button" onClick={handleAddUrl} disabled={!urlInput.trim()} className="px-3 h-9 rounded-lg bg-brand-500 text-white text-body-sm font-medium disabled:opacity-40 transition-colors">Add</button>
        </div>
      )}

      {/* Image preview modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={previewImg} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
            <button type="button" onClick={() => setPreviewImg(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
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
