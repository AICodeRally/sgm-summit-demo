'use client';
export const dynamic = 'force-dynamic';


import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/auth/signin' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-fuchsia-800 to-yellow-600">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-8">
        <p className="text-gray-700">Signing you out...</p>
      </div>
    </div>
  );
}
