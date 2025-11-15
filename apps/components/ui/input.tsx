import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'default' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    size = 'default',
    ...props 
  }, ref) => {
    const baseClasses = "w-full rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium"
    
    const variants = {
      default: "border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100",
      filled: "border-transparent bg-neutral-100 text-neutral-900 placeholder:text-neutral-500 focus:bg-white focus:border-brand-500 dark:bg-neutral-700 dark:text-neutral-100 dark:focus:bg-neutral-800",
      outlined: "border-2 border-neutral-300 bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500 dark:border-neutral-600 dark:text-neutral-100"
    }
    
    const sizes = {
      sm: "h-8 px-3 text-sm",
      default: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base"
    }

    const hasError = !!error;
    const errorClasses = hasError ? "border-error-500 focus:border-error-500 focus:ring-error-500" : "";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[size],
              errorClasses,
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {rightIcon}
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
Input.displayName = "Input"

export { Input }
