import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Layers } from 'lucide-react';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { DataTable } from '@/components/admin/DataTable.tsx';
import { Toggle } from '@/components/atoms/Toggle.tsx';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog.tsx';
import type { Category } from '@/types/admin.ts';

export function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { getAllCategories } = await import('@/services/admin.ts');
      const result = await getAllCategories();
      setCategories(result.data);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { deleteCategory } = await import('@/services/admin.ts');
      await deleteCategory(deleteTarget);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget));
    } catch {
      // handle error
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { toggleCategoryStatus } = await import('@/services/admin.ts');
      await toggleCategoryStatus(categoryId, !currentStatus);
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, isActive: !currentStatus } : c)),
      );
    } catch {
      // handle error
    }
  };

  // Search filtering only
  let filtered = categories;
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // Pagination
  const totalItems = filtered.length;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page on search
  useEffect(() => { setCurrentPage(1); }, [search]);

  // Stats
  const totalActive = categories.filter((c) => c.isActive).length;
  const totalInactive = categories.filter((c) => !c.isActive).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Total Categories" value={String(categories.length)} icon={Layers} color="text-blue-600 bg-blue-500/10" isLoading={isLoading} />
        <KPICard label="Active" value={String(totalActive)} icon={Layers} color="text-green-600 bg-green-500/10" isLoading={isLoading} />
        <KPICard label="Inactive" value={String(totalInactive)} icon={Layers} color="text-surface-500 bg-surface-500/10" isLoading={isLoading} />
      </div>

      {/* Toolbar: Search + Add */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-[13px] text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all"
          />
        </div>
        <Link
          to="/admin/categories/new"
          className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 ml-auto"
        >
          <Plus size={15} />
          Add Category
        </Link>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          { key: 'category', label: 'Category' },
          { key: 'slug', label: 'Slug' },
          { key: 'products', label: 'Products' },
          { key: 'status', label: 'Status' },
          { key: 'order', label: 'Order' },
          { key: 'actions', label: '', className: 'w-20' },
        ]}
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<Layers size={24} className="text-surface-400" />}
        emptyTitle="No categories found"
        emptyDescription={search ? 'Try adjusting your search' : 'Create your first category to organize products'}
        emptyActionLabel={!search ? 'Add Category' : undefined}
        emptyActionHref={!search ? '/admin/categories/new' : undefined}
        pagination={{
          currentPage,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size) => { setItemsPerPage(size); setCurrentPage(1); },
        }}
      >
        {paginatedData.map((cat) => (
          <tr
            key={cat.id}
            onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}
            className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-surface-100 dark:bg-surface-800" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <Layers size={18} className="text-surface-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 truncate">{cat.name}</p>
                  {cat.description && (
                    <p className="text-caption text-surface-400 truncate max-w-xs">{cat.description}</p>
                  )}
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500 font-mono">{cat.slug}</td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400 tabular-nums">
              {cat.productCount ?? 0}
            </td>
            <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
              <Toggle
                checked={cat.isActive}
                onChange={() => handleToggleStatus(cat.id, cat.isActive)}
              />
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500 tabular-nums">{cat.displayOrder}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Link
                  to={`/admin/categories/${cat.id}/edit`}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => setDeleteTarget(cat.id)}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
