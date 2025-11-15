'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/loading-state';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to English platform dashboard
    router.push('/en/dashboard');
  }, [router]);

  return <LoadingState message="Redirecting to DoganHub Store..." />;
}
