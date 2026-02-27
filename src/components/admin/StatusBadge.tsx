
import { cn } from '@/lib/utils.ts';

type StatusType = 'order' | 'product' | 'stock' | 'role' | 'payment' | 'user';

const orderColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  confirmed: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  processing: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
  shipped: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  delivered: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const orderDots: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-cyan-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const productColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  inactive: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const productDots: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-red-500',
};

const stockColors: Record<string, string> = {
  'in-stock': 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  'low-stock': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  'out-of-stock': 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const stockDots: Record<string, string> = {
  'in-stock': 'bg-green-500',
  'low-stock': 'bg-amber-500',
  'out-of-stock': 'bg-red-500',
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  user: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
};

const roleDots: Record<string, string> = {
  admin: 'bg-purple-500',
  user: 'bg-surface-400',
};

const paymentColors: Record<string, string> = {
  paid: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  refunded: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
};

const paymentDots: Record<string, string> = {
  paid: 'bg-green-500',
  pending: 'bg-amber-500',
  failed: 'bg-red-500',
  refunded: 'bg-purple-500',
};

const userColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  inactive: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
};

const userDots: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-surface-400',
};

function getColorMap(type: StatusType) {
  switch (type) {
    case 'order': return { colors: orderColors, dots: orderDots };
    case 'product': return { colors: productColors, dots: productDots };
    case 'stock': return { colors: stockColors, dots: stockDots };
    case 'role': return { colors: roleColors, dots: roleDots };
    case 'payment': return { colors: paymentColors, dots: paymentDots };
    case 'user': return { colors: userColors, dots: userDots };
  }
}

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const { colors, dots } = getColorMap(type);
  const colorClass = colors[status] ?? 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400';
  const dotClass = dots[status] ?? 'bg-surface-400';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-caption font-medium capitalize',
        colorClass,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClass)} />
      {status.replace('-', ' ')}
    </span>
  );
}
