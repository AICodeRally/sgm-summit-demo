'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NewTenantPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tier: 'BETA',
    status: 'ACTIVE',
    maxDocuments: 500,
    maxUsers: 50,
    aiEnabled: true,
    auditRetentionDays: 2555,
    customBranding: true,
    industry: '',
    logo: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          tier: formData.tier,
          status: formData.status,
          features: {
            maxDocuments: formData.maxDocuments,
            maxUsers: formData.maxUsers,
            aiEnabled: formData.aiEnabled,
            auditRetentionDays: formData.auditRetentionDays,
            customBranding: formData.customBranding,
          },
          settings: {
            industry: formData.industry,
            logo: formData.logo,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create tenant');
      }

      const tenant = await res.json();
      router.push(`/admin/tenants/${tenant.id}` as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (session?.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. SUPER_ADMIN role required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/tenants" className="text-purple-600 hover:underline text-sm">
            ← Back to Tenants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Tenant</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new organization to the SGM platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tenant Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Henry Schein, Inc."
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug * (URL-friendly identifier)
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="henryschein"
                pattern="[a-z0-9-]+"
              />
              <p className="mt-1 text-sm text-gray-500">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tier" className="block text-sm font-medium text-gray-700">
                  Tier *
                </label>
                <select
                  id="tier"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="DEMO">Demo</option>
                  <option value="BETA">Beta</option>
                  <option value="PRODUCTION">Production</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900">Features & Limits</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maxDocuments"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max Documents
                </label>
                <input
                  type="number"
                  id="maxDocuments"
                  value={formData.maxDocuments}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDocuments: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700">
                  Max Users
                </label>
                <input
                  type="number"
                  id="maxUsers"
                  value={formData.maxUsers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsers: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label
                  htmlFor="auditRetentionDays"
                  className="block text-sm font-medium text-gray-700"
                >
                  Audit Retention (Days)
                </label>
                <input
                  type="number"
                  id="auditRetentionDays"
                  value={formData.auditRetentionDays}
                  onChange={(e) =>
                    setFormData({ ...formData, auditRetentionDays: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="mt-1 text-sm text-gray-500">2555 days = 7 years</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.aiEnabled}
                  onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable AI Features</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.customBranding}
                  onChange={(e) =>
                    setFormData({ ...formData, customBranding: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Custom Branding</span>
              </label>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900">Settings</h2>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Healthcare Distribution"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                type="text"
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="/logos/henryschein.png"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Link
              href="/admin/tenants"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-md hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
