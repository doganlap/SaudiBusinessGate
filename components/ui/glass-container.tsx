'use client';

import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassContainer({ children, className = '', padding = 'md' }: GlassContainerProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface GlassBackgroundProps {
  children: React.ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export function GlassBackground({ children, className = '', dir = 'ltr' }: GlassBackgroundProps) {
  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${className}`}
      dir={dir}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full">
        {children}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isArabic?: boolean;
}

export function GlassInput({ icon, iconPosition = 'left', isArabic = false, className = '', ...props }: GlassInputProps) {
  const iconPadding = icon ? (iconPosition === 'left' ? (isArabic ? 'pr-12' : 'pl-12') : (isArabic ? 'pl-12' : 'pr-12')) : '';
  
  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-white/70`}>
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full ${iconPadding} py-3 px-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all ${className}`}
      />
      {icon && iconPosition === 'right' && (
        <div className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-white/70`}>
          {icon}
        </div>
      )}
    </div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success';
}

export function GlassButton({ variant = 'primary', children, className = '', ...props }: GlassButtonProps) {
  const variantClasses = {
    primary: 'bg-white/30 hover:bg-white/40 border-white/40',
    secondary: 'bg-white/20 hover:bg-white/30 border-white/30',
    success: 'bg-green-500/30 hover:bg-green-500/40 border-green-300/30'
  };

  return (
    <button
      {...props}
      className={`w-full py-3 px-6 backdrop-blur-md ${variantClasses[variant]} border rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

