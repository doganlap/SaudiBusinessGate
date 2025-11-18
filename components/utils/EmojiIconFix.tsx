'use client';

/**
 * Emoji and Icon Client-Side Fix
 * This component initializes emoji and icon rendering fixes on the client side
 */

import { useEffect } from 'react';
import { initializeEmojiFix } from '@/lib/utils/emoji-fix';

export function EmojiIconFix() {
  useEffect(() => {
    // Initialize emoji and icon fixes when component mounts
    initializeEmojiFix();
    
    // Add emoji font support to document
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced emoji and icon rendering */
      .emoji, .icon {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Twemoji Mozilla", "Android Emoji", sans-serif !important;
        font-style: normal !important;
        font-weight: normal !important;
        font-variant: normal !important;
        text-transform: none !important;
        line-height: 1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        display: inline-block;
        vertical-align: middle;
      }
      
      /* Prevent emoji breaking */
      .emoji {
        white-space: nowrap;
        word-break: keep-all;
      }
      
      /* Icon size consistency */
      .icon {
        width: 1em;
        height: 1em;
        stroke-width: 2;
      }
      
      /* Fallback for missing icons */
      .icon-fallback {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        font-size: inherit;
        line-height: 1;
      }
      
      /* Fix for Windows emoji rendering */
      @supports (-webkit-appearance: none) {
        .emoji {
          -webkit-font-feature-settings: "liga";
          font-feature-settings: "liga";
        }
      }
      
      /* High DPI display optimization */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .emoji, .icon {
          -webkit-font-smoothing: subpixel-antialiased;
          image-rendering: -webkit-optimize-contrast;
        }
      }
      
      /* RTL support for icons and emojis */
      html[dir='rtl'] .icon-flip-rtl {
        transform: scaleX(-1);
      }
      
      /* Loading state for icons */
      .icon-loading {
        opacity: 0.6;
        animation: pulse 1.5s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      /* Error state for icons */
      .icon-error {
        color: #ef4444;
        filter: grayscale(100%);
      }
      
      /* Success state for icons */
      .icon-success {
        color: #10b981;
      }
      
      /* Warning state for icons */
      .icon-warning {
        color: #f59e0b;
      }
      
      /* Info state for icons */
      .icon-info {
        color: #3b82f6;
      }
    `;
    document.head.appendChild(style);
    
    // Handle icon loading errors
    const handleIconError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'svg' || target.classList.contains('lucide')) {
        console.warn('Icon failed to load:', target);
        target.classList.add('icon-error');
        
        // Add fallback emoji if needed
        if (!target.textContent || target.textContent.trim() === '') {
          const fallbackEmoji = document.createElement('span');
          fallbackEmoji.className = 'emoji icon-fallback';
          fallbackEmoji.textContent = '⚠️';
          fallbackEmoji.title = 'Icon failed to load';
          target.parentNode?.insertBefore(fallbackEmoji, target);
        }
      }
    };
    
    // Handle missing emojis
    const handleMissingEmoji = () => {
      const emojis = document.querySelectorAll('.emoji');
      emojis.forEach((emoji) => {
        const element = emoji as HTMLElement;
        if (!element.textContent || element.textContent.trim() === '') {
          element.textContent = '•';
          element.title = 'Emoji not supported';
        }
      });
    };
    
    // Add event listeners
    document.addEventListener('error', handleIconError, true);
    
    // Check for emoji support
    const checkEmojiSupport = () => {
      const testEmoji = '😀';
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '16px Arial';
        context.fillText(testEmoji, 0, 16);
        const imageData = context.getImageData(0, 0, 16, 16);
        const hasColor = imageData.data.some((pixel, index) => {
          return index % 4 === 3 && pixel > 0; // Check alpha channel
        });
        
        if (!hasColor) {
          console.warn('Color emoji support not detected, using fallback fonts');
          document.body.classList.add('emoji-fallback');
        }
      }
    };
    
    // Initialize checks
    checkEmojiSupport();
    handleMissingEmoji();
    
    // Cleanup function
    return () => {
      document.removeEventListener('error', handleIconError, true);
    };
  }, []);
  
  return null; // This component doesn't render anything visible
}

export default EmojiIconFix;