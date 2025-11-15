import React from 'react';
import { Search, Plus, Filter, Download } from 'lucide-react';

interface EnterpriseToolbarProps {
  onSearch?: (query: string) => void;
  onNew?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  showFilter?: boolean;
  showExport?: boolean;
  placeholder?: string;
  className?: string;
}

export function EnterpriseToolbar({
  onSearch,
  onNew,
  onFilter,
  onExport,
  showFilter = true,
  showExport = true,
  placeholder = 'Search...',
  className = ''
}: EnterpriseToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-between mb-4 ${className}`}>
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      
      <div className="flex gap-2">
        {showFilter && onFilter && (
          <button
            onClick={onFilter}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-surface text-foreground hover:bg-muted"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        )}
        
        {showExport && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-surface text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}
        
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}
      </div>
    </div>
  );
}
