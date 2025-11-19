'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLanguage } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Arabic register page
    router.replace(`/${defaultLanguage}/register`);
  }, [router]);

  return null;
}
