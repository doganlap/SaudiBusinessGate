'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { LoadingState } from '@/components/ui/loading-state';

export default function LangHomePage() {
  const router = useRouter();
  const params = useParams();
  const lng = params.lng as string;

  useEffect(() => {
    // Redirect to platform dashboard
    router.push(`/${lng}/dashboard`);
  }, [router, lng]);

  return <LoadingState message="Redirecting to platform..." />;
}
