'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  PersonIcon,
  CalendarIcon,
  GlobeIcon,
  ImageIcon,
  RocketIcon,
  HomeIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';

// Wizard steps
type WizardStep = 'organization' | 'engagement' | 'contacts' | 'branding' | 'review';

const STEPS: { id: WizardStep; label: string; icon: any }[] = [
  { id: 'organization', label: 'Organization', icon: HomeIcon },
  { id: 'engagement', label: 'Engagement', icon: CalendarIcon },
  { id: 'contacts', label: 'Contacts', icon: PersonIcon },
  { id: 'branding', label: 'Branding', icon: ImageIcon },
  { id: 'review', label: 'Review', icon: CheckCircledIcon },
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Telecommunications',
  'Energy & Utilities',
  'Professional Services',
  'Insurance',
  'Life Sciences',
  'Other',
];

const ENGAGEMENT_TYPES = [
  { value: 'GAP_ANALYSIS', label: 'Gap Analysis', description: 'Analyze existing plans against best practices' },
  { value: 'FULL_IMPLEMENTATION', label: 'Full Implementation', description: 'End-to-end governance implementation' },
  { value: 'AUDIT', label: 'Audit', description: 'Compliance and governance audit' },
  { value: 'CONSULTING', label: 'Consulting', description: 'Advisory and consulting engagement' },
];

const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1,000 employees' },
  { value: '1001-5000', label: '1,001-5,000 employees' },
  { value: '5001-10000', label: '5,001-10,000 employees' },
  { value: '10001+', label: '10,001+ employees' },
];

interface OrganizationData {
  name: string;
  slug: string;
  industry: string;
  companySize: string;
  headquarters: string;
  tier: 'DEMO' | 'BETA' | 'PRODUCTION';
}

interface EngagementData {
  type: string;
  startDate: string;
  targetEndDate: string;
  planCount: string;
  scope: string;
}

interface Contact {
  name: string;
  email: string;
  role: string;
  isPrimary: boolean;
}

interface BrandingData {
  primaryColor: string;
  logo: string;
  timezone: string;
}

export default function ClientOnboardingWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session as any)?.user?.role;

  const [currentStep, setCurrentStep] = useState<WizardStep>('organization');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [organization, setOrganization] = useState<OrganizationData>({
    name: '',
    slug: '',
    industry: '',
    companySize: '',
    headquarters: '',
    tier: 'BETA',
  });

  const [engagement, setEngagement] = useState<EngagementData>({
    type: 'GAP_ANALYSIS',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    planCount: '1-5',
    scope: '',
  });

  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', email: '', role: 'Primary Contact', isPrimary: true },
  ]);

  const [branding, setBranding] = useState<BrandingData>({
    primaryColor: '#0066cc',
    logo: '',
    timezone: 'America/New_York',
  });

  // Access control
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router, userRole]);

  // Auto-generate slug from name
  useEffect(() => {
    if (organization.name && !organization.slug) {
      const slug = organization.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setOrganization((prev) => ({ ...prev, slug }));
    }
  }, [organization.name, organization.slug]);

  const getStepIndex = (step: WizardStep) => STEPS.findIndex((s) => s.id === step);
  const getProgress = () => ((getStepIndex(currentStep) + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'organization':
        return organization.name && organization.slug && organization.industry;
      case 'engagement':
        return engagement.type && engagement.startDate;
      case 'contacts':
        return contacts.some((c) => c.name && c.email);
      case 'branding':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const idx = getStepIndex(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1].id);
    }
  };

  const handlePrev = () => {
    const idx = getStepIndex(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
    }
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', email: '', role: '', isPrimary: false }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create tenant
      const tenantRes = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: organization.name,
          slug: organization.slug,
          tier: organization.tier,
          status: 'ACTIVE',
          features: {
            maxDocuments: 100,
            maxUsers: 50,
            aiEnabled: true,
            auditRetentionDays: 365,
            customBranding: true,
          },
          settings: {
            industry: organization.industry,
            companySize: organization.companySize,
            headquarters: organization.headquarters,
            logo: branding.logo,
            primaryColor: branding.primaryColor,
            timezone: branding.timezone,
          },
        }),
      });

      if (!tenantRes.ok) {
        const data = await tenantRes.json();
        throw new Error(data.error || 'Failed to create tenant');
      }

      const tenant = await tenantRes.json();

      // Step 2: Create engagement
      const engagementRes = await fetch(`/api/client/${organization.slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: engagement.type,
          status: 'ACTIVE',
          startDate: engagement.startDate,
          targetEndDate: engagement.targetEndDate || undefined,
          clientContacts: contacts.filter((c) => c.name && c.email),
          brandingConfig: {
            primaryColor: branding.primaryColor,
            logo: branding.logo,
          },
        }),
      });

      if (!engagementRes.ok) {
        // If engagement creation fails but tenant was created, still redirect
        console.error('Engagement creation failed, but tenant was created');
      }

      // Success - redirect to tenant details
      router.push(`/admin/tenants/${tenant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[color:var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SetPageTitle title="Client Onboarding" description="Set up a new client" />

      <div className="min-h-screen sparcc-hero-bg flex flex-col">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/tenants"
                  className="flex items-center gap-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Cancel
                </Link>
                <div className="h-6 w-px bg-[color:var(--color-border)]" />
                <div>
                  <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                    Client Onboarding
                  </h1>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    Set up a new client organization
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-[color:var(--color-primary)]">
                    Step {getStepIndex(currentStep) + 1} of {STEPS.length}
                  </div>
                  <div className="text-xs text-[color:var(--color-muted)]">
                    {Math.round(getProgress())}% complete
                  </div>
                </div>
                <div className="w-32 h-2 bg-[color:var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] transition-all duration-300"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)]">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isCompleted = getStepIndex(currentStep) > idx;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white'
                            : isCompleted
                            ? 'border-[color:var(--color-success)] bg-[color:var(--color-success)] text-white'
                            : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-muted)]'
                        }`}
                      >
                        {isCompleted ? <CheckCircledIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span
                        className={`text-sm font-medium hidden sm:inline ${
                          isActive
                            ? 'text-[color:var(--color-primary)]'
                            : isCompleted
                            ? 'text-[color:var(--color-success)]'
                            : 'text-[color:var(--color-muted)]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? 'bg-[color:var(--color-success)]' : 'bg-[color:var(--color-border)]'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)]">
                <p className="text-[color:var(--color-error)]">{error}</p>
              </div>
            )}

            {/* Step 1: Organization */}
            {currentStep === 'organization' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                    Organization Profile
                  </h2>
                  <p className="text-[color:var(--color-muted)] mt-1">
                    Enter the client's company information
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={organization.name}
                        onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={organization.slug}
                        onChange={(e) =>
                          setOrganization({
                            ...organization,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                        placeholder="acme-corp"
                      />
                      <p className="text-xs text-[color:var(--color-muted)] mt-1">
                        Used in URLs: /client/{organization.slug || 'slug'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Industry *
                      </label>
                      <select
                        value={organization.industry}
                        onChange={(e) => setOrganization({ ...organization, industry: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      >
                        <option value="">Select industry...</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Company Size
                      </label>
                      <select
                        value={organization.companySize}
                        onChange={(e) => setOrganization({ ...organization, companySize: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      >
                        <option value="">Select size...</option>
                        {COMPANY_SIZES.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Headquarters
                      </label>
                      <input
                        type="text"
                        value={organization.headquarters}
                        onChange={(e) => setOrganization({ ...organization, headquarters: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                        placeholder="New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Tier
                      </label>
                      <select
                        value={organization.tier}
                        onChange={(e) =>
                          setOrganization({ ...organization, tier: e.target.value as 'DEMO' | 'BETA' | 'PRODUCTION' })
                        }
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      >
                        <option value="DEMO">Demo</option>
                        <option value="BETA">Beta</option>
                        <option value="PRODUCTION">Production</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Engagement */}
            {currentStep === 'engagement' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                    Engagement Details
                  </h2>
                  <p className="text-[color:var(--color-muted)] mt-1">
                    Define the scope and timeline of the engagement
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-3">
                      Engagement Type *
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ENGAGEMENT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setEngagement({ ...engagement, type: type.value })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            engagement.type === type.value
                              ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5'
                              : 'border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/50'
                          }`}
                        >
                          <div className="font-medium text-[color:var(--color-foreground)]">{type.label}</div>
                          <div className="text-sm text-[color:var(--color-muted)] mt-1">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={engagement.startDate}
                        onChange={(e) => setEngagement({ ...engagement, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Target End Date
                      </label>
                      <input
                        type="date"
                        value={engagement.targetEndDate}
                        onChange={(e) => setEngagement({ ...engagement, targetEndDate: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                      Number of Compensation Plans
                    </label>
                    <select
                      value={engagement.planCount}
                      onChange={(e) => setEngagement({ ...engagement, planCount: e.target.value })}
                      className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                    >
                      <option value="1-5">1-5 plans</option>
                      <option value="6-10">6-10 plans</option>
                      <option value="11-25">11-25 plans</option>
                      <option value="26-50">26-50 plans</option>
                      <option value="50+">50+ plans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                      Scope Notes
                    </label>
                    <textarea
                      value={engagement.scope}
                      onChange={(e) => setEngagement({ ...engagement, scope: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      placeholder="Describe the engagement scope, key objectives, or specific requirements..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contacts */}
            {currentStep === 'contacts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                    Client Contacts
                  </h2>
                  <p className="text-[color:var(--color-muted)] mt-1">
                    Add key stakeholders and contacts for this engagement
                  </p>
                </div>

                <div className="space-y-4">
                  {contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <PersonIcon className="w-5 h-5 text-[color:var(--color-primary)]" />
                          <span className="font-medium text-[color:var(--color-foreground)]">
                            Contact {idx + 1}
                          </span>
                          {contact.isPrimary && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">
                              Primary
                            </span>
                          )}
                        </div>
                        {contacts.length > 1 && (
                          <button
                            onClick={() => removeContact(idx)}
                            className="text-sm text-[color:var(--color-error)] hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm text-[color:var(--color-muted)] mb-1">Name *</label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateContact(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[color:var(--color-muted)] mb-1">Email *</label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContact(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                            placeholder="john@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[color:var(--color-muted)] mb-1">Role</label>
                          <input
                            type="text"
                            value={contact.role}
                            onChange={(e) => updateContact(idx, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                            placeholder="VP of Sales Operations"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={contact.isPrimary}
                              onChange={(e) => updateContact(idx, 'isPrimary', e.target.checked)}
                              className="w-4 h-4 rounded border-[color:var(--color-border)]"
                            />
                            <span className="text-sm text-[color:var(--color-foreground)]">Primary contact</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addContact}
                    className="w-full py-3 border-2 border-dashed border-[color:var(--color-border)] rounded-lg text-[color:var(--color-muted)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] transition-colors"
                  >
                    + Add Another Contact
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Branding */}
            {currentStep === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                    Branding & Settings
                  </h2>
                  <p className="text-[color:var(--color-muted)] mt-1">
                    Customize the client experience (optional)
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Primary Brand Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          className="w-12 h-10 rounded border border-[color:var(--color-border)] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                          placeholder="#0066cc"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                        Timezone
                      </label>
                      <select
                        value={branding.timezone}
                        onChange={(e) => setBranding({ ...branding, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">GMT/BST</option>
                        <option value="Europe/Paris">Central European Time</option>
                        <option value="Asia/Tokyo">Japan Standard Time</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={branding.logo}
                      onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                      className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                      placeholder="https://company.com/logo.png"
                    />
                    <p className="text-xs text-[color:var(--color-muted)] mt-1">
                      Enter a URL to the client's logo image
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                    Review & Create
                  </h2>
                  <p className="text-[color:var(--color-muted)] mt-1">
                    Review the client details before creating
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Organization Summary */}
                  <div className="p-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <h3 className="font-medium text-[color:var(--color-foreground)] mb-3 flex items-center gap-2">
                      <HomeIcon className="w-4 h-4" />
                      Organization
                    </h3>
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">Company</dt>
                        <dd className="text-[color:var(--color-foreground)]">{organization.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">URL Slug</dt>
                        <dd className="text-[color:var(--color-foreground)]">{organization.slug}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">Industry</dt>
                        <dd className="text-[color:var(--color-foreground)]">{organization.industry}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">Tier</dt>
                        <dd className="text-[color:var(--color-foreground)]">{organization.tier}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Engagement Summary */}
                  <div className="p-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <h3 className="font-medium text-[color:var(--color-foreground)] mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Engagement
                    </h3>
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">Type</dt>
                        <dd className="text-[color:var(--color-foreground)]">
                          {ENGAGEMENT_TYPES.find((t) => t.value === engagement.type)?.label}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">Start Date</dt>
                        <dd className="text-[color:var(--color-foreground)]">
                          {new Date(engagement.startDate).toLocaleDateString()}
                        </dd>
                      </div>
                      {engagement.targetEndDate && (
                        <div className="flex justify-between">
                          <dt className="text-[color:var(--color-muted)]">Target End</dt>
                          <dd className="text-[color:var(--color-foreground)]">
                            {new Date(engagement.targetEndDate).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--color-muted)]">Plans</dt>
                        <dd className="text-[color:var(--color-foreground)]">{engagement.planCount}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Contacts Summary */}
                  <div className="p-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <h3 className="font-medium text-[color:var(--color-foreground)] mb-3 flex items-center gap-2">
                      <PersonIcon className="w-4 h-4" />
                      Contacts ({contacts.filter((c) => c.name).length})
                    </h3>
                    <div className="space-y-2">
                      {contacts
                        .filter((c) => c.name)
                        .map((contact, idx) => (
                          <div key={idx} className="text-sm flex items-center gap-2">
                            <span className="text-[color:var(--color-foreground)]">{contact.name}</span>
                            <span className="text-[color:var(--color-muted)]">({contact.email})</span>
                            {contact.isPrimary && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-[color:var(--color-surface)] border-t border-[color:var(--color-border)]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 'organization'}
              className="flex items-center gap-2 px-4 py-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Previous
            </button>

            {currentStep === 'review' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <RocketIcon className="w-4 h-4" />
                    Create Client
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
