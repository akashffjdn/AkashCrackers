import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Receipt,
  IndianRupee,
  Banknote,
  Smartphone,
  CreditCard,
  Plus,
  Eye,
  Printer,
  Download,
  Share2,
  X,
  Users,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils.ts';
import { DataTable } from '@/components/admin/DataTable.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { FilterPanel, FilterButton } from '@/components/admin/FilterPanel.tsx';
import { ExportButton, exportToCSV } from '@/components/admin/ExportButton.tsx';
import type { Bill } from '@/types/admin.ts';

const paymentMethodOptions = [
  { label: 'All Methods', value: 'all' },
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
];

const dateRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

function getDateRangeStart(range: string): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  if (range === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = range === '7d' ? 7 : 30;
  return new Date(now.getTime() - days * 86400000);
}

const paymentIcons: Record<string, React.ElementType> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
};

export function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { getAllBills } = await import('@/services/admin.ts');
        const result = await getAllBills();
        setBills(result);
      } catch {
        setBills([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Filtering
  let filtered = bills;
  const rangeStart = getDateRangeStart(dateRange);
  if (rangeStart) {
    filtered = filtered.filter((b) => new Date(b.createdAt) >= rangeStart);
  }
  if (paymentFilter !== 'all') {
    filtered = filtered.filter((b) => b.payment.method === paymentFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.billNumber.toLowerCase().includes(q) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)),
    );
  }

  const totalItems = filtered.length;
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, paymentFilter, dateRange]);

  // KPIs
  const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const todayBills = bills.filter((b) => {
    const d = new Date(b.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const uniqueCustomers = new Set(bills.filter((b) => b.customerPhone).map((b) => b.customerPhone)).size;

  const handleExport = () => {
    exportToCSV(
      filtered.map((b) => ({
        'Bill No': b.billNumber,
        Customer: b.customerName || 'Walk-in',
        Phone: b.customerPhone || '',
        Items: b.itemCount,
        Quantity: b.totalQuantity,
        Subtotal: b.subtotal,
        'Discount %': b.discountPercent,
        Discount: b.totalDiscount,
        CGST: b.totalCgst,
        SGST: b.totalSgst,
        Total: b.grandTotal,
        Payment: b.payment.method,
        Date: new Date(b.createdAt).toLocaleString('en-IN'),
      })),
      'bills',
    );
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Bills"
          value={String(bills.length)}
          icon={Receipt}
          color="text-blue-600 bg-blue-500/10"
          isLoading={isLoading}
        />
        <KPICard
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={IndianRupee}
          color="text-green-600 bg-green-500/10"
          isLoading={isLoading}
        />
        <KPICard
          label="Today's Revenue"
          value={formatPrice(todayRevenue)}
          icon={Banknote}
          color="text-amber-600 bg-amber-500/10"
          isLoading={isLoading}
        />
        <KPICard
          label="Unique Customers"
          value={String(uniqueCustomers)}
          icon={Users}
          color="text-purple-600 bg-purple-500/10"
          isLoading={isLoading}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search by bill no, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-[13px] text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all"
          />
        </div>
        <FilterButton
          activeCount={[paymentFilter, dateRange].filter((v) => v !== 'all').length}
          open={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        />
        <div className="flex items-center gap-2 ml-auto">
          <ExportButton onExport={handleExport} />
          <Link
            to="/admin/billing"
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20"
          >
            <Plus size={15} />
            New Bill
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        open={showFilters}
        onClearAll={() => {
          setPaymentFilter('all');
          setDateRange('all');
        }}
        filters={[
          {
            id: 'payment',
            label: 'Payment Method',
            value: paymentFilter,
            options: paymentMethodOptions,
            onChange: setPaymentFilter,
          },
          {
            id: 'date',
            label: 'Date Range',
            value: dateRange,
            options: dateRangeOptions,
            onChange: setDateRange,
          },
        ]}
      />

      {/* Table */}
      <DataTable
        columns={[
          { key: 'bill', label: 'Bill No.' },
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'total', label: 'Total' },
          { key: 'payment', label: 'Payment' },
          { key: 'date', label: 'Date & Time' },
          { key: 'actions', label: '', className: 'w-24' },
        ]}
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<Receipt size={24} className="text-surface-400" />}
        emptyTitle="No bills yet"
        emptyDescription={
          search
            ? 'Try adjusting your search'
            : 'Bills will appear here after you generate them from the Billing page'
        }
        emptyActionLabel="Create First Bill"
        emptyActionHref="/admin/billing"
        pagination={{
          currentPage,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          },
        }}
      >
        {paginatedData.map((bill) => {
          const PayIcon = paymentIcons[bill.payment.method] || Banknote;
          const isExpanded = expandedBill === bill.id;
          return (
            <tr
              key={bill.id}
              className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 transition-colors"
            >
              <td className="px-5 py-3.5">
                <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100 font-mono">
                  {bill.billNumber}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <p className="text-body-sm text-surface-900 dark:text-surface-100">
                  {bill.customerName || '—'}
                </p>
              </td>
              <td className="px-5 py-3.5">
                {bill.customerPhone ? (
                  <a
                    href={`tel:${bill.customerPhone}`}
                    className="text-body-sm text-brand-600 dark:text-brand-400 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      const text = `Bill: ${bill.billNumber}%0ATotal: ₹${bill.grandTotal}%0AThank you for shopping at Akash Crackers!`;
                      window.open(`https://wa.me/91${bill.customerPhone}?text=${text}`, '_blank');
                    }}
                  >
                    {bill.customerPhone}
                  </a>
                ) : (
                  <span className="text-caption text-surface-400">—</span>
                )}
              </td>
              <td className="px-5 py-3.5 text-body-sm font-semibold text-surface-900 dark:text-surface-100 tabular-nums">
                {formatPrice(bill.grandTotal)}
              </td>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-surface-600 dark:text-surface-400 capitalize">
                  <PayIcon size={13} />
                  {bill.payment.method}
                </span>
              </td>
              <td className="px-5 py-3.5 text-body-sm text-surface-500">
                {new Date(bill.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors"
                    title="View Details"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={async () => {
                      const [{ pdf }, { BillPDF }] = await Promise.all([
                        import('@react-pdf/renderer'),
                        import('@/components/admin/BillPDF.tsx'),
                      ]);
                      const blob = await pdf(BillPDF({ bill })).toBlob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${bill.billNumber}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                    title="Download PDF"
                  >
                    <Download size={15} />
                  </button>
                  {bill.customerPhone && (
                    <button
                      onClick={() => {
                        const text = `Bill: ${bill.billNumber}%0ATotal: ₹${bill.grandTotal}%0AThank you for shopping at Akash Crackers!`;
                        window.open(`https://wa.me/91${bill.customerPhone}?text=${text}`, '_blank');
                      }}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-green-600 hover:bg-green-500/10 transition-colors"
                      title="WhatsApp"
                    >
                      <Share2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {/* Expanded Bill Detail Modal */}
      {expandedBill && (
        <BillDetailModal
          bill={bills.find((b) => b.id === expandedBill)!}
          onClose={() => setExpandedBill(null)}
        />
      )}
    </div>
  );
}

// ─── Bill Detail Modal ───

function BillDetailModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  if (!bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800 sticky top-0 bg-white dark:bg-surface-900 z-10">
          <div>
            <h3 className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-50">
              Bill {bill.billNumber}
            </h3>
            <p className="text-caption text-surface-400">
              {new Date(bill.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Customer */}
        {(bill.customerName || bill.customerPhone) && (
          <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Users size={14} className="text-purple-600" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                {bill.customerName || 'Walk-in Customer'}
              </p>
              {bill.customerPhone && (
                <p className="text-caption text-surface-400">{bill.customerPhone}</p>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800">
          <p className="text-caption font-semibold text-surface-500 uppercase tracking-wider mb-2">
            Items ({bill.itemCount})
          </p>
          <div className="space-y-2">
            {bill.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-caption text-surface-400 w-4 text-center">{i + 1}</span>
                {item.image ? (
                  <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-surface-100" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-surface-900 dark:text-surface-100 truncate">{item.name}</p>
                  <p className="text-caption text-surface-400">₹{item.unitPrice} x {item.quantity}</p>
                </div>
                <span className="text-body-sm font-semibold text-surface-900 dark:text-surface-100 tabular-nums">
                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800 space-y-1.5">
          <div className="flex justify-between text-body-sm text-surface-500">
            <span>Subtotal</span>
            <span className="tabular-nums">₹{bill.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {bill.discountPercent > 0 && (
            <div className="flex justify-between text-body-sm text-green-600">
              <span>Discount ({bill.discountPercent}%)</span>
              <span className="tabular-nums">-₹{bill.totalDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}
          {bill.packagingFee > 0 && (
            <div className="flex justify-between text-body-sm text-surface-500">
              <span>Packaging Fee</span>
              <span className="tabular-nums">₹{bill.packagingFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-caption text-surface-400">
            <span>CGST @9%</span>
            <span className="tabular-nums">₹{bill.totalCgst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-caption text-surface-400">
            <span>SGST @9%</span>
            <span className="tabular-nums">₹{bill.totalSgst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-surface-100 dark:border-surface-800">
            <span className="text-body-md font-bold text-surface-900 dark:text-surface-100">Grand Total</span>
            <span className="text-body-md font-bold text-brand-600 dark:text-brand-400 tabular-nums">
              ₹{bill.grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              {(() => {
                const Icon = paymentIcons[bill.payment.method] || Banknote;
                return <Icon size={14} className="text-green-600" />;
              })()}
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 capitalize">
                Paid via {bill.payment.method}
              </p>
              {bill.payment.receivedAmount && (
                <p className="text-caption text-surface-400">
                  Received ₹{bill.payment.receivedAmount}
                  {bill.payment.changeAmount && bill.payment.changeAmount > 0 && (
                    <> · Change ₹{bill.payment.changeAmount}</>
                  )}
                </p>
              )}
              {bill.payment.reference && (
                <p className="text-caption text-surface-400">Ref: {bill.payment.reference}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-2">
          <button
            onClick={async () => {
              const [{ pdf }, { BillPDF }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('@/components/admin/BillPDF.tsx'),
              ]);
              const blob = await pdf(BillPDF({ bill })).toBlob();
              const url = URL.createObjectURL(blob);
              const printWindow = window.open(url, '_blank');
              if (printWindow) {
                printWindow.addEventListener('load', () => printWindow.print());
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-body-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            onClick={async () => {
              const [{ pdf }, { BillPDF }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('@/components/admin/BillPDF.tsx'),
              ]);
              const blob = await pdf(BillPDF({ bill })).toBlob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${bill.billNumber}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-body-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            <Download size={15} />
            PDF
          </button>
          {bill.customerPhone && (
            <button
              onClick={() => {
                const text = `Bill: ${bill.billNumber}%0ATotal: ₹${bill.grandTotal}%0AThank you for shopping at Akash Crackers!`;
                window.open(`https://wa.me/91${bill.customerPhone}?text=${text}`, '_blank');
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-body-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              <Share2 size={15} />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

