import { ReactNode } from 'react';
import { PlatformShell } from '@/src/components/layout/shell/PlatformShell';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PlatformShell>
        {children}
      </PlatformShell>
    </ThemeProvider>
  );
}
