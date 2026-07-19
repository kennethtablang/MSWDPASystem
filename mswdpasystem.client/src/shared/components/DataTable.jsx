import { useMemo, useRef, useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Columns3, Download } from 'lucide-react';
import { SkeletonTable } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export default function DataTable({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = 'No records found.',
  keyField = 'id',
  columnToggle = false,
  onExport,
  exportLabel = 'Export',
}) {
  const [sort, setSort] = useState(null); // { key, dir: 'asc' | 'desc' }
  const [hidden, setHidden] = useState(() => new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const visibleColumns = columns.filter((c) => !hidden.has(c.key));

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    const copy = [...data].sort((a, b) => {
      const av = col?.sortValue ? col.sortValue(a) : a[sort.key];
      const bv = col?.sortValue ? col.sortValue(b) : b[sort.key];
      return sort.dir === 'asc' ? compareValues(av, bv) : compareValues(bv, av);
    });
    return copy;
  }, [data, sort, columns]);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null;
    });
  };

  if (loading) {
    return <SkeletonTable rows={6} cols={Math.min(columns.length, 5)} />;
  }

  const hasToolbar = columnToggle || onExport;

  return (
    <div>
      {hasToolbar && (
        <div className="flex items-center justify-end gap-2 mb-2">
          {columnToggle && (
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                size="sm"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <Columns3 size={14} aria-hidden="true" />
                Columns
              </Button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white dark:bg-gray-100 shadow-card-hover p-2">
                  {columns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!hidden.has(col.key)}
                        onChange={() =>
                          setHidden((prev) => {
                            const next = new Set(prev);
                            if (next.has(col.key)) next.delete(col.key);
                            else if (next.size < columns.length - 1) next.add(col.key);
                            return next;
                          })
                        }
                        className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                      />
                      {col.header}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download size={14} aria-hidden="true" />
              {exportLabel}
            </Button>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {visibleColumns.map((col) => {
                const sortedHere = sort?.key === col.key;
                const SortIcon = sortedHere ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={sortedHere ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-primary-700 transition-colors"
                      >
                        {col.header}
                        <SortIcon size={13} aria-hidden="true" className={sortedHere ? 'text-primary-700' : 'text-gray-300'} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-100 divide-y divide-gray-100">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length}>
                  <EmptyState title={emptyMessage} className="py-10" />
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr
                  key={row[keyField] ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-primary-50' : 'hover:bg-gray-50'}`}
                >
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
