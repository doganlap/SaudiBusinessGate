/**
 * Enterprise Data Grid with TanStack Table Integration
 * Advanced data grid with virtualization, server-side operations, and real-time updates
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  useTable,
  useSortBy,
  usePagination,
  useRowSelect,
  useFilters,
  useGlobalFilter,
  Column,
  TableInstance,
  UsePaginationInstanceProps,
  UseSortByInstanceProps,
  UseRowSelectInstanceProps
} from 'react-table';
import { Eye, Edit, Trash, ChevronLeft, ChevronRight, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useWebSocket } from '@/lib/websocket/useWebSocket';

interface EnterpriseDataGridProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  totalCount?: number;
  pageCount?: number;
  onFetchData?: (params: {
    pageIndex: number;
    pageSize: number;
    sortBy: { id: string; desc: boolean }[];
    filters: any[];
    globalFilter: string;
  }) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  selectable?: boolean;
  paginated?: boolean;
  filterable?: boolean;
  realTimeUpdates?: boolean;
  channel?: string;
  className?: string;
}

type TableInstanceWithHooks<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> &
  UseSortByInstanceProps<T> &
  UseRowSelectInstanceProps<T> & {
    page: any[];
    pageCount: number;
  };

export function EnterpriseDataGrid<T extends object>({
  data,
  columns,
  loading = false,
  totalCount = 0,
  pageCount: controlledPageCount,
  onFetchData,
  onSelectionChange,
  onRowClick,
  onExport,
  selectable = false,
  paginated = true,
  filterable = true,
  realTimeUpdates = false,
  channel = 'data-update',
  className = ''
}: EnterpriseDataGridProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [localData, setLocalData] = useState<T[]>(data);

  // Real-time updates via WebSocket
  const { isConnected, data: realTimeData } = useWebSocket({
    channel: realTimeUpdates ? channel : undefined,
    onMessage: (update) => {
      if (update.type === 'data-refresh') {
        onFetchData?.({
          pageIndex: state.pagination.pageIndex,
          pageSize: state.pagination.pageSize,
          sortBy: state.sortBy,
          filters: state.filters,
          globalFilter
        });
      } else if (update.type === 'data-update') {
        setLocalData(prev => {
          const updated = prev.map(item => 
            item.id === update.data.id ? { ...item, ...update.data } : item
          );
          return updated;
        });
      }
    }
  });

  // Update local data when props change
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const defaultColumn = useMemo(
    () => ({
      minWidth: 100,
      width: 150,
      maxWidth: 400,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize, sortBy, filters },
  } = useTable(
    {
      columns,
      data: localData,
      defaultColumn,
      manualPagination: !!onFetchData,
      manualSortBy: !!onFetchData,
      manualFilters: !!onFetchData,
      manualGlobalFilter: !!onFetchData,
      pageCount: controlledPageCount,
      initialState: {
        pageIndex: 0,
        pageSize: paginated ? 20 : data.length,
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      if (selectable) {
        hooks.visibleColumns.push(columns => [
          {
            id: 'selection',
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div>
                <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            Cell: ({ row }) => (
              <div>
                <input type="checkbox" {...row.getToggleRowSelectedProps()} />
              </div>
            ),
            width: 60,
          },
          ...columns,
        ]);
      }
    }
  ) as TableInstanceWithHooks<T>;

  // Fetch data when table state changes
  useEffect(() => {
    if (onFetchData) {
      onFetchData({
        pageIndex,
        pageSize,
        sortBy,
        filters,
        globalFilter,
      });
    }
  }, [pageIndex, pageSize, sortBy, filters, globalFilter, onFetchData]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedFlatRows.map(row => row.original));
    }
  }, [selectedFlatRows, onSelectionChange]);

  const handleRefresh = () => {
    if (onFetchData) {
      onFetchData({
        pageIndex,
        pageSize,
        sortBy,
        filters,
        globalFilter,
      });
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {filterable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter || ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {realTimeUpdates && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-primary disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onExport && (
            <button
              onClick={() => onExport('csv')}
              className="p-2 text-muted-foreground hover:text-primary"
              aria-label="Export data"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border border-border rounded-lg">
        <table {...getTableProps()} className="w-full border-collapse">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} className="bg-muted">
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="py-3 px-4 text-sm font-medium text-muted-foreground text-left"
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-1">
                      {column.render('Header')}
                      {column.isSorted && (
                        <span>{column.isSortedDesc ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className={`border-b border-border hover:bg-muted/20 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${row.isSelected ? 'bg-primary/5' : ''}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="py-3 px-4 text-sm"
                      style={{ width: cell.column.width }}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && page.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginated && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} entries
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                }}
                className="border border-border rounded-md px-2 py-1"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className="p-1 rounded-md border border-border disabled:opacity-50"
              aria-label="First page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2">
              Page {pageIndex + 1} of {pageOptions.length}
            </span>

            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className="p-1 rounded-md border border-border disabled:opacity-50"
              aria-label="Last page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}