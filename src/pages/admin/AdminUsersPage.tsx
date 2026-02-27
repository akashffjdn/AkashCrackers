import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Search, Users, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { DataTable } from '@/components/admin/DataTable.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { FilterPanel, FilterButton } from '@/components/admin/FilterPanel.tsx';
import { ExportButton, exportToCSV } from '@/components/admin/ExportButton.tsx';
import type { UserProfile } from '@/types/index.ts';

const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const userStatusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const { getAllCustomers } = await import('@/services/admin.ts');
        const result = await getAllCustomers();
        setUsers(result.data);
      } catch {
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  let filtered = users;
  if (roleFilter !== 'all') {
    filtered = filtered.filter((u) => (u.role ?? 'user') === roleFilter);
  }
  if (statusFilter !== 'all') {
    filtered = filtered.filter((u) =>
      statusFilter === 'active' ? u.isActive !== false : u.isActive === false,
    );
  }
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search)),
    );
  }

  const totalItems = filtered.length;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  useEffect(() => { setCurrentPage(1); }, [search, roleFilter, statusFilter]);

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalActive = users.filter((u) => u.isActive !== false).length;

  const handleExport = () => {
    exportToCSV(
      filtered.map((u) => ({
        Name: u.displayName,
        Email: u.email,
        Phone: u.phone || '',
        Role: u.role ?? 'user',
        City: u.city || '',
        State: u.state || '',
        Status: u.isActive !== false ? 'Active' : 'Inactive',
        Joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '',
      })),
      'users',
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Users" value={String(users.length)} icon={Users} color="text-blue-600 bg-blue-500/10" isLoading={isLoading} />
        <KPICard label="Active Users" value={String(totalActive)} icon={Users} color="text-green-600 bg-green-500/10" isLoading={isLoading} />
        <KPICard label="Admins" value={String(totalAdmins)} icon={UserPlus} color="text-purple-600 bg-purple-500/10" isLoading={isLoading} />
        <KPICard label="Inactive" value={String(users.length - totalActive)} icon={Users} color="text-surface-500 bg-surface-500/10" isLoading={isLoading} />
      </div>

      {/* Toolbar: Search + Filter toggle + Export */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-[13px] text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all"
          />
        </div>
        <FilterButton
          activeCount={[roleFilter, statusFilter].filter((v) => v !== 'all').length}
          open={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        />
        <div className="ml-auto">
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Expandable filter panel — full width */}
      <FilterPanel
        open={showFilters}
        onClearAll={() => { setRoleFilter('all'); setStatusFilter('all'); }}
        filters={[
          { id: 'role', label: 'Role', value: roleFilter, options: roleOptions, onChange: (v) => setRoleFilter(v as 'all' | 'admin' | 'user') },
          { id: 'status', label: 'Status', value: statusFilter, options: userStatusOptions, onChange: (v) => setStatusFilter(v as 'all' | 'active' | 'inactive') },
        ]}
      />

      {/* Table */}
      <DataTable
        columns={[
          { key: 'user', label: 'User' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'location', label: 'Location' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' },
          { key: 'joined', label: 'Joined' },
          { key: 'actions', label: '', className: 'w-12' },
        ]}
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<Users size={24} className="text-surface-400" />}
        emptyTitle="No users found"
        emptyDescription={search ? 'Try adjusting your search' : 'Users will appear here once they sign up'}
        pagination={{
          currentPage,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size) => { setItemsPerPage(size); setCurrentPage(1); },
        }}
      >
        {paginatedData.map((user) => (
          <tr
            key={user.uid}
            onClick={() => navigate(`/admin/users/${user.uid}`)}
            className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                <span className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                  {user.displayName || 'Unnamed'}
                </span>
              </div>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400">{user.email}</td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400">{user.phone || '—'}</td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500">
              {user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || '—'}
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={user.role ?? 'user'} type="role" />
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={user.isActive !== false ? 'active' : 'inactive'} type="user" />
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </td>
            <td className="px-5 py-3.5">
              <Link
                to={`/admin/users/${user.uid}`}
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
