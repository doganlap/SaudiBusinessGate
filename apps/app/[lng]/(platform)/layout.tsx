import { ReactNode } from 'react';
import { PlatformShell } from '@/components/shell/PlatformShell';
import Providers from '@/apps/app/providers';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <PlatformShell>
        {children}
      </PlatformShell>
    </Providers>
  );
}
