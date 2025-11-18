'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Home() {
  const params = useParams() as any;
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';

  useEffect(() => {
    // Redirect to dashboard
    router.replace(`/${lng}/dashboard`);
  }, [lng, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </main>
  )
}