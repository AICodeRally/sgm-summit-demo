'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: 'DEMO' | 'BETA' | 'PRODUCTION';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
  createdAt: string;
  expiresAt: string | null;
  _count: {
    users: number;
    documents: number;
    policies: number;
    cases: number;
  };
}

export default function TenantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchTenants();
    }
  }, [status, session, router]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      if (!res.ok) throw new Error('Failed to fetch tenants');
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      DEMO: 'bg-gray-100 text-gray-700',
      BETA: 'bg-blue-100 text-blue-700',
      PRODUCTION: 'bg-green-100 text-green-700',
    };
    return colors[tier as keyof typeof colors] || colors.DEMO;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      TRIAL: 'bg-yellow-100 text-yellow-700',
      EXPIRED: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading tenants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage all tenants, users, and access controls
            </p>
          </div>
          <Link
            href="/admin/tenants/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-md hover:from-purple-700 hover:to-fuchsia-700 transition-all"
          >
            + New Tenant
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Tenants</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{tenants.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {tenants.filter((t) => t.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Beta</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {tenants.filter((t) => t.tier === 'BETA').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Production</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {tenants.filter((t) => t.tier === 'PRODUCTION').length}
            </p>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTierBadge(
                        tenant.tier
                      )}`}
                    >
                      {tenant.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        tenant.status
                      )}`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant._count.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant._count.documents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/tenants/${tenant.id}` as any}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/tenants/${tenant.id}/edit` as any}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tenants found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
