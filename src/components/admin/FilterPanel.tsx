import { ChevronDown, X, ListFilter } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterPanelProps {
  open: boolean;
  filters: FilterField[];
  onClearAll: () => void;
}

export function FilterButton({
  activeCount,
  open,
  onClick,
}: {
  activeCount: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-all border ${
        open
          ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/30'
          : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-750'
      }`}
    >
      <ListFilter size={15} />
      <span>Filters</span>
      {activeCount > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-500 text-[11px] font-bold text-white flex items-center justify-center leading-none">
          {activeCount}
        </span>
      )}
      <ChevronDown
        size={14}
        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

export function FilterPanel({ open, filters, onClearAll }: FilterPanelProps) {
  const activeCount = filters.filter((f) => f.value !== f.options[0]?.value).length;

  if (!open) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
      {/* Filter fields — equal width grid */}
      <div
        className="grid gap-4 p-4"
        style={{ gridTemplateColumns: `repeat(${filters.length}, 1fr)` }}
      >
        {filters.map((filter) => {
          const isActive = filter.value !== filter.options[0]?.value;

          return (
            <div key={filter.id} className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 px-0.5">
                {filter.label}
              </label>
              <div className="relative">
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className={`w-full h-10 pl-3.5 pr-9 rounded-xl text-[13px] font-medium appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:ring-offset-0 ${
                    isActive
                      ? 'bg-brand-500/8 text-brand-700 dark:text-brand-300 border-2 border-brand-500/30'
                      : 'bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isActive ? 'text-brand-500' : 'text-surface-400'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active filter chips footer */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mr-1">
            Active:
          </span>
          {filters
            .filter((f) => f.value !== f.options[0]?.value)
            .map((filter) => {
              const activeLabel =
                filter.options.find((o) => o.value === filter.value)?.label ?? filter.value;
              return (
                <button
                  key={`chip-${filter.id}`}
                  onClick={() => filter.onChange(filter.options[0]?.value ?? 'all')}
                  className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full bg-brand-500/10 text-[12px] font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-500/20 transition-all group/chip"
                >
                  <span className="truncate max-w-[100px]">{activeLabel}</span>
                  <span className="w-4 h-4 rounded-full bg-brand-500/15 group-hover/chip:bg-brand-500/30 flex items-center justify-center transition-colors">
                    <X size={10} className="text-brand-600 dark:text-brand-400" />
                  </span>
                </button>
              );
            })}
          <button
            onClick={onClearAll}
            className="ml-auto h-7 px-2.5 rounded-full text-[12px] font-medium text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
