import * as React from "react"
import { cn } from "./utils/cn.js"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'success' | 'warning'
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'icon'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'default', 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden"
    
    const variants = {
      default: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-sm hover:shadow-md active:scale-[0.98]",
      primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-sm hover:shadow-md active:scale-[0.98]",
      secondary: "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus-visible:ring-brand-500 shadow-sm hover:shadow-md active:scale-[0.98]",
      destructive: "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 shadow-sm hover:shadow-md active:scale-[0.98]",
      outline: "border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-500 active:scale-[0.98]",
      ghost: "text-neutral-700 hover:bg-neutral-100 focus-visible:ring-brand-500 active:scale-[0.98]",
      link: "text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline focus-visible:ring-brand-500",
      success: "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500 shadow-sm hover:shadow-md active:scale-[0.98]",
      warning: "bg-warning-600 text-white hover:bg-warning-700 focus-visible:ring-warning-500 shadow-sm hover:shadow-md active:scale-[0.98]",
    } as const
    
    const sizes = {
      sm: "h-8 px-3 text-sm gap-1.5",
      default: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      xl: "h-14 px-8 text-lg gap-3",
      icon: "h-10 w-10 p-0",
    } as const

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className={cn("flex items-center gap-2", loading && "opacity-0")}> 
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children && <span className="truncate">{children}</span>}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }