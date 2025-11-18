import React from 'react';

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

export function Alert({
  children,
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}) {
  const base = 'w-full rounded-md px-4 py-3 text-sm border';
  const styles: Record<AlertVariant, string> = {
    default: 'bg-neutral-50 border-neutral-200 text-neutral-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  return <div className={`${base} ${styles[variant]} ${className}`}>{children}</div>;
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-semibold mb-1">{children}</div>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="opacity-80 text-sm">{children}</div>;
}