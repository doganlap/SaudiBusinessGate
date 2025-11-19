import { ReactNode } from 'react';
import { PlatformShell } from '@/src/components/layout/shell/PlatformShell';
import { SaudiBusinessGateFooter } from '@/src/components/SaudiBusinessGateFooter';
import Providers from '@/app/providers';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <PlatformShell>
          {children}
        </PlatformShell>
        <SaudiBusinessGateFooter />
      </div>
    </Providers>
  );
}
