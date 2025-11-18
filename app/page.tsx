'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/loading-state';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the world-class landing page
    router.push('/landing');
  }, [router]);

  return <LoadingState message="Welcome to Saudi Business Gate..." />;
}
