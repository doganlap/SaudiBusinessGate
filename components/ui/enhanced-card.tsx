import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

interface EnhancedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface EnhancedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface EnhancedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface EnhancedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      gradient: 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border border-blue-200/50 shadow-lg',
      glass: 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl',
      elevated: 'bg-white border border-gray-200 shadow-2xl'
    };

    const sizes = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 hover:shadow-lg',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const EnhancedCardHeader = React.forwardRef<HTMLDivElement, EnhancedCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const EnhancedCardTitle = React.forwardRef<HTMLHeadingElement, EnhancedCardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-bold leading-none tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);

const EnhancedCardDescription = React.forwardRef<HTMLParagraphElement, EnhancedCardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
);

const EnhancedCardContent = React.forwardRef<HTMLDivElement, EnhancedCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

EnhancedCard.displayName = 'EnhancedCard';
EnhancedCardHeader.displayName = 'EnhancedCardHeader';
EnhancedCardTitle.displayName = 'EnhancedCardTitle';
EnhancedCardDescription.displayName = 'EnhancedCardDescription';
EnhancedCardContent.displayName = 'EnhancedCardContent';

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardContent,
  EnhancedCardTitle,
  EnhancedCardDescription,
};
