'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy Henry Schein Route Redirect
 * Redirects /henryschein to /client/henryschein
 *
 * @deprecated This route is deprecated. Use /client/henryschein instead.
 */
export default function HenryScheinLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new client dashboard
    router.replace('/client/henryschein');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600">
          This page has moved to the new client dashboard.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please update your bookmarks to: <br />
          <code className="bg-gray-100 px-2 py-1 rounded">/client/henryschein</code>
        </p>
      </div>
    </div>
  );
}
