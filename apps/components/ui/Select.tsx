'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check, X } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  label?: string
  error?: string
  helperText?: string
  disabled?: boolean
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  onChange?: (value: string | string[]) => void
  onSearch?: (query: string) => void
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    options,
    value,
    defaultValue,
    placeholder = "Select an option...",
    label,
    error,
    helperText,
    disabled = false,
    multiple = false,
    searchable = false,
    clearable = false,
    size = 'default',
    variant = 'default',
    onChange,
    onSearch,
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      multiple 
        ? (Array.isArray(value) ? value : [])
        : value ? [value] : defaultValue ? [defaultValue] : []
    );
    const [searchQuery, setSearchQuery] = React.useState('');
    const selectRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = React.useMemo(() => {
      if (!searchable || !searchQuery) return options;
      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery, searchable]);

    const handleSelect = (optionValue: string) => {
      let newValues: string[];
      
      if (multiple) {
        if (selectedValues.includes(optionValue)) {
          newValues = selectedValues.filter(v => v !== optionValue);
        } else {
          newValues = [...selectedValues, optionValue];
        }
      } else {
        newValues = [optionValue];
        setIsOpen(false);
      }
      
      setSelectedValues(newValues);
      onChange?.(multiple ? newValues : newValues[0] || '');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      onChange?.(multiple ? [] : '');
    };

    const getDisplayValue = () => {
      if (selectedValues.length === 0) return placeholder;
      
      if (multiple) {
        if (selectedValues.length === 1) {
          const option = options.find(opt => opt.value === selectedValues[0]);
          return option?.label || selectedValues[0];
        }
        return `${selectedValues.length} items selected`;
      }
      
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    };

    const baseClasses = "w-full rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const variants = {
      default: "border-neutral-300 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100",
      filled: "border-transparent bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100",
      outlined: "border-2 border-neutral-300 bg-transparent text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
    }
    
    const sizes = {
      sm: "h-8 px-3 text-sm",
      default: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base"
    }

    const hasError = !!error;
    const errorClasses = hasError ? "border-error-500 focus:border-error-500 focus:ring-error-500" : "";

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative" ref={selectRef}>
          <div
            className={cn(
              baseClasses,
              variants[variant],
              sizes[size],
              errorClasses,
              "flex items-center justify-between cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={cn(
              "truncate",
              selectedValues.length === 0 && "text-neutral-500 dark:text-neutral-400"
            )}>
              {getDisplayValue()}
            </span>
            
            <div className="flex items-center gap-2">
              {clearable && selectedValues.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  aria-label="Clear selection"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-neutral-400 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-enterprise-lg max-h-60 overflow-auto">
              {searchable && (
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onSearch?.(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
              
              <div className="py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors",
                        option.disabled 
                          ? "text-neutral-400 cursor-not-allowed" 
                          : "text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                        selectedValues.includes(option.value) && "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      <span className="truncate">{option.label}</span>
                      {selectedValues.includes(option.value) && (
                        <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
