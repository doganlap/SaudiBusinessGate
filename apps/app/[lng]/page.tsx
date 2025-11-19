'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { LoadingState } from '@/components/ui/loading-state';
import { defaultLanguage } from '@/lib/i18n';

export default function LangHomePage() {
  const router = useRouter();
  const params = useParams() as any;
  const lng = (params?.lng as string) || defaultLanguage;

  useEffect(() => {
    // Redirect to platform dashboard
    router.push(`/${lng}/dashboard`);
  }, [router, lng]);

  return <LoadingState message="Redirecting to platform..." />;
}
