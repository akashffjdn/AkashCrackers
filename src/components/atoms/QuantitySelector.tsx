import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({ quantity, onChange, min = 1, max = 99, className }: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-surface-200 dark:border-surface-700',
        className,
      )}
    >
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="flex items-center justify-center w-11 h-11 lg:w-9 lg:h-9 text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="w-10 text-center text-body-sm font-semibold text-surface-900 dark:text-surface-100 select-none">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex items-center justify-center w-11 h-11 lg:w-9 lg:h-9 text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
