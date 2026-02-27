import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Search, Users } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { DataTable } from '@/components/admin/DataTable.tsx';
import type { UserProfile } from '@/types/index.ts';

export function AdminCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const { getAllCustomers } = await import('@/services/admin.ts');
        const result = await getAllCustomers();
        setCustomers(result.data);
      } catch {
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = search
    ? customers.filter(
        (c) =>
          c.displayName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()),
      )
    : customers;

  // Pagination
  const totalItems = filtered.length;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page on search
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 w-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow"
        />
      </div>

      <DataTable
        columns={[
          { key: 'customer', label: 'Customer' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'role', label: 'Role' },
          { key: 'joined', label: 'Joined' },
          { key: 'actions', label: '', className: 'w-12' },
        ]}
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<Users size={24} className="text-surface-400" />}
        emptyTitle="No customers found"
        emptyDescription={search ? 'Try adjusting your search' : 'Customers will appear here once they sign up'}
        pagination={{
          currentPage,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size) => { setItemsPerPage(size); setCurrentPage(1); },
        }}
      >
        {paginatedData.map((customer) => (
          <tr
            key={customer.uid}
            onClick={() => navigate(`/admin/customers/${customer.uid}`)}
            className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar src={customer.photoURL} name={customer.displayName} size="sm" />
                <span className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                  {customer.displayName || 'Unnamed'}
                </span>
              </div>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400">{customer.email}</td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400">{customer.phone || '—'}</td>
            <td className="px-5 py-3.5">
              <StatusBadge status={customer.role ?? 'user'} type="role" />
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500">
              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </td>
            <td className="px-5 py-3.5">
              <Link
                to={`/admin/customers/${customer.uid}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors inline-flex"
              >
                <Eye size={16} />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
