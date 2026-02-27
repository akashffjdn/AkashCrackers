import { Download } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
  isExporting?: boolean;
  className?: string;
}

export function ExportButton({ onExport, label = 'Export', isExporting, className }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={isExporting}
      className={cn(
        'flex items-center gap-2 px-3.5 h-9 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-[13px] font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors disabled:opacity-50',
        className,
      )}
    >
      <Download size={16} className={isExporting ? 'animate-pulse' : ''} />
      {isExporting ? 'Exporting...' : label}
    </button>
  );
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? '' : String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(','),
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
