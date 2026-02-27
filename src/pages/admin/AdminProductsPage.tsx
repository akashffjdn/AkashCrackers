import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, ShoppingBag, AlertTriangle, CheckCircle2, XCircle, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils.ts';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { DataTable } from '@/components/admin/DataTable.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { FilterPanel, FilterButton } from '@/components/admin/FilterPanel.tsx';
import { ExportButton, exportToCSV } from '@/components/admin/ExportButton.tsx';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog.tsx';
import type { AdminProduct } from '@/types/admin.ts';
import type { ProductCategory } from '@/types/index.ts';

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Aerial', value: 'aerial' },
  { label: 'Ground', value: 'ground' },
  { label: 'Rockets', value: 'rockets' },
  { label: 'Sparklers', value: 'sparklers' },
  { label: 'Fountains', value: 'fountains' },
  { label: 'Roman Candles', value: 'roman-candles' },
  { label: 'Novelty', value: 'novelty' },
  { label: 'Combo Packs', value: 'combo-packs' },
];

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const stockOptions = [
  { label: 'All Stock Levels', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [productStatus, setProductStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { getAllProducts } = await import('@/services/admin.ts');
      const result = await getAllProducts({
        category: category === 'all' ? undefined : category,
      });
      setProducts(result.data);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { deleteProduct } = await import('@/services/admin.ts');
      await deleteProduct(deleteTarget);
      fetchProducts();
    } catch {
      // handle error
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSaveStock = async (productId: string) => {
    try {
      const { updateProduct } = await import('@/services/admin.ts');
      const newStock = Number(editStock);
      await updateProduct(productId, {
        stockCount: newStock,
        inStock: newStock > 0,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockCount: newStock, inStock: newStock > 0 } : p)),
      );
      setEditingId(null);
    } catch {
      // handle error
    }
  };

  let filtered = products;
  if (productStatus !== 'all') {
    filtered = filtered.filter((p) => (productStatus === 'active' ? p.isActive !== false : p.isActive === false));
  }
  if (stockFilter !== 'all') {
    filtered = filtered.filter((p) => {
      const stock = p.stockCount ?? 0;
      if (stockFilter === 'out-of-stock') return !p.inStock || stock === 0;
      if (stockFilter === 'low-stock') return p.inStock && stock > 0 && stock <= 20;
      return p.inStock && stock > 20;
    });
  }
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // Pagination
  const totalItems = filtered.length;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, category, productStatus, stockFilter]);

  // Stock level calculations
  const outOfStock = products.filter((p) => !p.inStock || (p.stockCount ?? 0) === 0);
  const lowStock = products.filter((p) => p.inStock && (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 20);
  const inStockProducts = products.filter((p) => p.inStock && (p.stockCount ?? 0) > 20);

  return (
    <div className="space-y-6">
      {/* Stock KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Products" value={String(products.length)} icon={Package} color="text-blue-600 bg-blue-500/10" isLoading={isLoading} />
        <KPICard label="In Stock" value={String(inStockProducts.length)} icon={CheckCircle2} color="text-green-600 bg-green-500/10" isLoading={isLoading} />
        <KPICard label="Low Stock" value={String(lowStock.length)} icon={AlertTriangle} color="text-amber-600 bg-amber-500/10" isLoading={isLoading} />
        <KPICard label="Out of Stock" value={String(outOfStock.length)} icon={XCircle} color="text-red-600 bg-red-500/10" isLoading={isLoading} />
      </div>

      {/* Toolbar: Search + Filter toggle + Add Product */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-[13px] text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all"
          />
        </div>
        <FilterButton
          activeCount={[category, productStatus, stockFilter].filter((v) => v !== 'all').length}
          open={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        />
        <div className="flex items-center gap-2 ml-auto">
          <ExportButton
            onExport={() => exportToCSV(
              filtered.map((p) => ({
                name: p.name,
                category: p.category,
                price: p.price,
                originalPrice: p.originalPrice ?? '',
                discount: p.originalPrice ? `${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%` : '',
                stock: p.stockCount ?? 0,
                status: p.isActive !== false ? 'Active' : 'Inactive',
                badge: p.badge ?? '',
              })),
              'products',
            )}
          />
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20"
          >
            <Plus size={15} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Expandable filter panel — full width */}
      <FilterPanel
        open={showFilters}
        onClearAll={() => { setCategory('all'); setProductStatus('all'); setStockFilter('all'); }}
        filters={[
          { id: 'category', label: 'Category', value: category, options: categoryOptions, onChange: (v) => setCategory(v as ProductCategory | 'all') },
          { id: 'status', label: 'Status', value: productStatus, options: statusOptions, onChange: (v) => setProductStatus(v as 'all' | 'active' | 'inactive') },
          { id: 'stock', label: 'Stock Level', value: stockFilter, options: stockOptions, onChange: (v) => setStockFilter(v as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock') },
        ]}
      />

      {/* Products Table */}
      <DataTable
        columns={[
          { key: 'product', label: 'Product' },
          { key: 'category', label: 'Category' },
          { key: 'price', label: 'Price' },
          { key: 'stock', label: 'Stock' },
          { key: 'stockStatus', label: 'Stock Status' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: '', className: 'w-20' },
        ]}
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<ShoppingBag size={24} className="text-surface-400" />}
        emptyTitle="No products found"
        emptyDescription={search ? 'Try adjusting your search' : 'Add your first product to get started'}
        emptyActionLabel={!search ? 'Add Product' : undefined}
        emptyActionHref={!search ? '/admin/products/new' : undefined}
        pagination={{
          currentPage,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size) => { setItemsPerPage(size); setCurrentPage(1); },
        }}
      >
        {paginatedData.map((product) => {
          const stock = product.stockCount ?? 0;
          const stockStatus = stock === 0 ? 'out-of-stock' : stock <= 20 ? 'low-stock' : 'in-stock';

          return (
            <tr
              key={product.id}
              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
              className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
            >
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-surface-100 dark:bg-surface-800"
                  />
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {product.name}
                    </p>
                    {product.badge && (
                      <span className="text-caption text-brand-600 dark:text-brand-400 capitalize">
                        {product.badge}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400 capitalize">
                {product.category.replace('-', ' ')}
              </td>
              <td className="px-5 py-3.5">
                <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 tabular-nums">
                  {formatPrice(product.price)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-surface-400 line-through tabular-nums">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-caption text-green-600 font-semibold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </div>
                )}
              </td>
              <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                {editingId === product.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-brand-300 dark:border-brand-500/40 text-body-sm bg-white dark:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      min="0"
                      autoFocus
                    />
                    <button onClick={() => handleSaveStock(product.id)} className="px-2.5 py-1 rounded-lg text-caption text-white bg-brand-500 hover:bg-brand-600 font-medium transition-colors">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-2.5 py-1 rounded-lg text-caption text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingId(product.id); setEditStock(String(stock)); }}
                    className={`text-body-sm font-semibold tabular-nums hover:underline ${
                      stock === 0 ? 'text-red-600' : stock <= 20 ? 'text-amber-600' : 'text-green-600'
                    }`}
                    title="Click to edit stock"
                  >
                    {stock}
                  </button>
                )}
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={stockStatus} type="stock" />
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge
                  status={product.isActive !== false ? 'active' : 'inactive'}
                  type="product"
                />
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(product.id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate Product"
        description="Are you sure you want to deactivate this product? It will no longer be visible on the storefront."
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
