import React from 'react';
import { Search, Plus, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ToolbarAction {
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant?: 'outline' | 'secondary' | 'link' | 'primary' | 'destructive' | 'ghost' | 'success' | 'warning';
}

interface FilterOption {
  value: string;
  label: string;
}

interface EnterpriseToolbarProps {
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: ToolbarAction[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  className?: string;
}

export function EnterpriseToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions = [],
  filterValue,
  onFilterChange,
  filterOptions = [],
  className = ''
}: EnterpriseToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-between mb-4 ${className}`}>
      <div className="flex gap-3 flex-1">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Dropdown */}
        {filterOptions.length > 0 && (
          <select
            value={filterValue}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter options"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              className="flex items-center gap-2"
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
