import React from 'react';
import { Eye, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: any) => React.ReactNode;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

interface Actions {
  view?: (record: any) => void;
  edit?: (record: any) => void;
  delete?: (record: any) => void;
}

interface DataGridProps {
  data: any[];
  columns: Column[];
  selectable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (record: any) => void;
  pagination?: Pagination;
  actions?: Actions;
  className?: string;
}

export function DataGrid({
  data = [],
  columns = [],
  selectable = false,
  searchable = false,
  sortable = false,
  onSelectionChange,
  onSort,
  onRowClick,
  pagination,
  actions,
  className = ''
}: DataGridProps) {
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Handle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(data);
      onSelectionChange?.(data);
    } else {
      setSelectedRows([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, record: any) => {
    e.stopPropagation();
    
    let newSelected = [...selectedRows];
    if (e.target.checked) {
      newSelected.push(record);
    } else {
      newSelected = newSelected.filter(row => row !== record);
    }
    
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const direction = isAsc ? 'desc' : 'asc';
    
    setSortColumn(column);
    setSortDirection(direction);
    onSort?.(column, direction);
  };

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {selectable && (
              <th className="py-3 px-4 text-left">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedRows.length > 0 && selectedRows.length === data.length}
                  className="h-4 w-4"
                  aria-label="Select all rows"
                />
              </th>
            )}
            
            {columns.map((column) => (
              <th 
                key={column.key}
                className={`py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                  column.align === 'center' ? 'text-center' :
                  column.align === 'right' ? 'text-right' : 'text-left'
                } ${(column.sortable || sortable) ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                onClick={(column.sortable || sortable) ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {(column.sortable || sortable) && sortColumn === column.key && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
            
            {actions && (
              <th className="py-3 px-4 text-right">Actions</th>
            )}
          </tr>
        </thead>
        
        <tbody>
          {data.map((record, index) => (
            <tr 
              key={index}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => onRowClick?.(record)}
            >
              {selectable && (
                <td className="py-3 px-4">
                  <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectRow(e, record)}
                    checked={selectedRows.includes(record)}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select row ${index + 1}`}
                  />
                </td>
              )}
              
              {columns.map((column) => (
                <td 
                  key={`${index}-${column.key}`}
                  className={`py-3 px-4 ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.render 
                    ? column.render(record[column.key], record)
                    : record[column.key]
                  }
                </td>
              ))}
              
              {actions && (
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actions.view && (
                      <button
                        onClick={(e) => { e.stopPropagation(); actions.view?.(record); }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        aria-label="View record"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    {actions.edit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); actions.edit?.(record); }}
                        className="p-1 text-gray-400 hover:text-green-600"
                        aria-label="Edit record"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    {actions.delete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); actions.delete?.(record); }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        aria-label="Delete record"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="px-2">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <button
              onClick={() => pagination.onChange(pagination.current + 1)}
              disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
              className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
