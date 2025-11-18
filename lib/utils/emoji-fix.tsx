/**
 * Emoji and Icon Rendering Fix Utilities
 * 
 * This module provides utilities to fix emoji rendering issues across different platforms
 * and browsers, particularly for Arabic and RTL content. It also includes icon fallback
 * mechanisms for when icons fail to load.
 */

/**
 * Common emojis used throughout the application
 */
export const EMOJIS = {
  saudiFlag: '🇸🇦',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  chart: '📊',
  tools: '🔧',
  paint: '🎨',
  diamond: '💎',
  arabic: 'ع',
  english: 'EN'
} as const;

/**
 * Emoji component with proper rendering
 */
export function Emoji({ 
  emoji, 
  label, 
  className = '' 
}: { 
  emoji: string; 
  label?: string; 
  className?: string;
}) {
  return (
    <span 
      className={`emoji emoji-render emoji-no-break ${className}`}
      role="img" 
      aria-label={label}
      aria-hidden={!label}
    >
      {emoji}
    </span>
  );
}

/**
 * Icon fallback component for when icons fail to load
 */
export function IconFallback({ 
  name, 
  className = '' 
}: { 
  name: string; 
  className?: string;
}) {
  const iconMap: Record<string, string> = {
    'home': '🏠',
    'user': '👤',
    'settings': '⚙️',
    'search': '🔍',
    'menu': '☰',
    'close': '✕',
    'check': '✓',
    'error': '✗',
    'warning': '⚠️',
    'info': 'ℹ️',
    'loading': '⏳',
    'success': '✅',
    'arrow-right': '→',
    'arrow-left': '←',
    'arrow-up': '↑',
    'arrow-down': '↓',
    'chevron-right': '›',
    'chevron-left': '‹',
    'chevron-up': '∧',
    'chevron-down': '∨',
    'plus': '+',
    'minus': '−',
    'multiply': '×',
    'divide': '÷',
    'equals': '=',
    'dollar': '$',
    'euro': '€',
    'pound': '£',
    'yen': '¥',
    'bitcoin': '₿',
    'percent': '%',
    'at': '@',
    'hash': '#',
    'star': '★',
    'heart': '♥',
    'spade': '♠',
    'club': '♣',
    'diamond': '♦',
    'checkmark': '✓',
    'cross': '✗',
    'bullet': '•',
    'circle': '○',
    'square': '□',
    'triangle': '△',
    'alpha': 'α',
    'beta': 'β',
    'gamma': 'γ',
    'delta': 'δ',
    'epsilon': 'ε',
    'zeta': 'ζ',
    'eta': 'η',
    'theta': 'θ',
    'iota': 'ι',
    'kappa': 'κ',
    'lambda': 'λ',
    'mu': 'μ',
    'nu': 'ν',
    'xi': 'ξ',
    'omicron': 'ο',
    'pi': 'π',
    'rho': 'ρ',
    'sigma': 'σ',
    'tau': 'τ',
    'upsilon': 'υ',
    'phi': 'φ',
    'chi': 'χ',
    'psi': 'ψ',
    'omega': 'ω'
  };
  
  const emoji = iconMap[name.toLowerCase()] || '•';
  
  return (
    <span className={`icon-fallback ${className}`} title={name}>
      {emoji}
    </span>
  );
}

/**
 * Initialize emoji and icon fixes on app load
 */
export function initializeEmojiFix() {
  if (typeof window !== 'undefined') {
    // Fix emoji rendering
    fixEmojiRendering();
    
    // Add global emoji classes to body
    document.body.classList.add('emoji-support');
    
    // Handle icon loading errors
    const handleIconError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'svg' || target.classList.contains('lucide')) {
        // Replace broken icon with fallback
        const iconName = target.getAttribute('data-icon') || 'help';
        const fallback = document.createElement('span');
        fallback.className = 'icon-fallback';
        fallback.textContent = IconFallback({ name: iconName }) as any;
        target.parentNode?.replaceChild(fallback, target);
      }
    };
    
    document.addEventListener('error', handleIconError, true);
  }
}

/**
 * Fix emoji rendering by adding appropriate CSS
 */
export function fixEmojiRendering() {
  const style = document.createElement('style');
  style.textContent = `
    .emoji {
      font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", 
      "Noto Color Emoji", "Twemoji Mozilla", "Android Emoji", sans-serif;
    }
    
    .emoji-render {
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
      font-size: inherit;
    }
    
    .emoji-no-break {
      white-space: nowrap;
    }
    
    .icon-fallback {
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
      font-size: inherit;
      font-weight: normal;
      font-style: normal;
      text-decoration: none;
      text-transform: none;
    }
    
    .emoji-support {
      font-feature-settings: "liga" 1;
      font-variant-ligatures: common-ligatures;
    }
    
    /* RTL support for Arabic text */
    [dir="rtl"] .emoji {
      direction: ltr;
      unicode-bidi: embed;
    }
    
    /* Ensure emojis render correctly in different contexts */
    .emoji-render {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;
  
  if (!document.querySelector('#emoji-fix-style')) {
    style.id = 'emoji-fix-style';
    document.head.appendChild(style);
  }
}

// Export common emoji components
export const SaudiFlag = () => <Emoji emoji={EMOJIS.saudiFlag} label="Saudi Arabia" />;
export const SuccessIcon = () => <Emoji emoji={EMOJIS.success} label="Success" />;
export const ErrorIcon = () => <Emoji emoji={EMOJIS.error} label="Error" />;
export const WarningIcon = () => <Emoji emoji={EMOJIS.warning} label="Warning" />;
export const InfoIcon = () => <Emoji emoji={EMOJIS.info} label="Information" />;
export const LoadingIcon = () => <Emoji emoji={EMOJIS.loading} label="Loading" />;
export const ChartIcon = () => <Emoji emoji={EMOJIS.chart} label="Chart" />;
export const ToolsIcon = () => <Emoji emoji={EMOJIS.tools} label="Tools" />;
export const PaintIcon = () => <Emoji emoji={EMOJIS.paint} label="Paint" />;
export const DiamondIcon = () => <Emoji emoji={EMOJIS.diamond} label="Diamond" />;