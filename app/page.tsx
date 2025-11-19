'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/loading-state';
import { defaultLanguage } from '@/lib/i18n';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to Arabic (default) language
    router.push(`/${defaultLanguage}`);
  }, [router]);

  return <LoadingState message="Welcome to Saudi Business Gate..." />;
}
