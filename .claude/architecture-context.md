# SGM Summit Demo - Architecture Context

## Architecture Pattern: Contracts + Ports + Bindings

This application implements a novel 3-layer clean architecture pattern designed for flexible data sourcing and easy testing.

## Layer 1: Contracts

**Location**: `lib/contracts/`

**Purpose**: Define domain entities with both TypeScript types and Zod schemas

**Structure**:
```typescript
// Example: lib/contracts/policy.contract.ts
import { z } from 'zod';

export const PolicySchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string(),
  name: z.string().min(1).max(200),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  status: z.enum(['draft', 'published', 'superseded', 'retired']),
  // ... more fields
});

export type Policy = z.infer<typeof PolicySchema>;
```

**Benefits**:
- Runtime validation via Zod
- Compile-time type safety via TypeScript
- Single source of truth for entity shape
- API request/response validation

## Layer 2: Ports

**Location**: `lib/ports/`

**Purpose**: Define service interfaces for dependency injection

**Structure**:
```typescript
// Example: lib/ports/policy.port.ts
import type { Policy } from '@/lib/contracts/policy.contract';

export interface IPolicyPort {
  findAll(filters?: PolicyFilters): Promise<Policy[]>;
  findById(id: string): Promise<Policy | null>;
  create(data: CreatePolicy): Promise<Policy>;
  update(data: UpdatePolicy): Promise<Policy>;
  createVersion(policyId: string, changes: Partial<Policy>): Promise<Policy>;
  delete(id: string): Promise<void>;
}
```

**Benefits**:
- No implementation details in interface
- Enables dependency injection
- Swappable implementations
- Easy to mock for testing

## Layer 3: Bindings

**Location**: `lib/bindings/`

**Purpose**: Provide concrete implementations of ports

**Modes**:

### 1. Synthetic (Default)

**Location**: `lib/bindings/synthetic/`

In-memory providers with pre-loaded mock data. Zero external dependencies.

```typescript
// Example: lib/bindings/synthetic/policy.synthetic.ts
export class SyntheticPolicyProvider implements IPolicyPort {
  private policies: Map<string, Policy>;

  constructor() {
    this.policies = new Map(syntheticPolicies.map(p => [p.id, p]));
  }

  async findAll(filters?: PolicyFilters): Promise<Policy[]> {
    let results = Array.from(this.policies.values());
    // In-memory filtering logic
    return results;
  }

  // ... implement all IPolicyPort methods
}
```

**Benefits**:
- Instant demo-ready
- No database required
- Perfect for development
- Fast test execution

### 2. Mapped (Future)

**Location**: `lib/bindings/mapped/`

Adapters for external APIs or services.

```typescript
// Example: lib/bindings/mapped/policy.mapped.ts
export class MappedPolicyProvider implements IPolicyPort {
  constructor(private apiClient: ExternalAPIClient) {}

  async findAll(filters?: PolicyFilters): Promise<Policy[]> {
    const response = await this.apiClient.get('/policies', filters);
    return response.data.map(transformToPolicy);
  }

  // ... implement all IPolicyPort methods
}
```

**Use Cases**:
- Integrate with existing APIs
- Connect to external services
- Bridge legacy systems

### 3. Live (Future)

**Location**: `lib/bindings/live/`

Prisma-based database access.

```typescript
// Example: lib/bindings/live/policy.live.ts
export class LivePolicyProvider implements IPolicyPort {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: PolicyFilters): Promise<Policy[]> {
    return await this.prisma.policy.findMany({
      where: buildPrismaFilters(filters),
    });
  }

  // ... implement all IPolicyPort methods
}
```

**Use Cases**:
- Production deployments
- Multi-tenant SaaS
- Persistent data storage

## Provider Registry

**Location**: `lib/bindings/registry.ts`

**Purpose**: Resolve ports to implementations based on configuration

```typescript
export class ProviderRegistry {
  constructor(private config: BindingConfig) {}

  getPolicy(): IPolicyPort {
    const mode = this.config.providers.policy;
    switch (mode) {
      case 'synthetic': return new SyntheticPolicyProvider();
      case 'mapped': return new MappedPolicyProvider(this.apiClient);
      case 'live': return new LivePolicyProvider(this.prisma);
      default: throw new Error(`Unknown binding mode: ${mode}`);
    }
  }

  // ... similar methods for other ports
}
```

## Configuration

**Location**: `lib/config/binding-config.ts`

```typescript
export type BindingMode = 'synthetic' | 'mapped' | 'live';

export interface BindingConfig {
  providers: {
    policy: BindingMode;
    territory: BindingMode;
    approval: BindingMode;
    audit: BindingMode;
    link: BindingMode;
    search: BindingMode;
  };
}
```

**Environment Variables**:
- `BINDING_MODE=synthetic` - Sets default mode for all providers
- Can be overridden per-provider in config

## Data Flow

```
┌─────────────────────────────────────────────────┐
│ API Route (app/api/sgm/policies/route.ts)      │
│ - Validates request with Zod                    │
│ - Calls registry.getPolicy()                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Provider Registry (lib/bindings/registry.ts)    │
│ - Resolves IPolicyPort to implementation        │
│ - Returns SyntheticPolicyProvider (default)     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Synthetic Provider                              │
│ (lib/bindings/synthetic/policy.synthetic.ts)    │
│ - Performs in-memory CRUD                       │
│ - Returns Policy[] conforming to contract       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ API Response                                    │
│ - Validated Policy[] returned to client         │
└─────────────────────────────────────────────────┘
```

## Core Entities

### Policy
- **Purpose**: Governance policy documents with versioning
- **Contract**: `lib/contracts/policy.contract.ts`
- **Port**: `lib/ports/policy.port.ts`
- **Statuses**: draft → published → superseded → retired

### Territory
- **Purpose**: Sales territory definitions with hierarchy
- **Contract**: `lib/contracts/territory.contract.ts`
- **Port**: `lib/ports/territory.port.ts`
- **Features**: Parent/child relationships, assignment rules

### Approval
- **Purpose**: Multi-level approval workflows
- **Contract**: `lib/contracts/approval.contract.ts`
- **Port**: `lib/ports/approval.port.ts`
- **Statuses**: pending → approved | rejected

### AuditLog
- **Purpose**: Append-only event logging
- **Contract**: `lib/contracts/audit-log.contract.ts`
- **Port**: `lib/ports/audit.port.ts`
- **Features**: Actor tracking, timestamp, metadata

### Link
- **Purpose**: Entity relationships (ConnectItem pattern)
- **Contract**: `lib/contracts/link.contract.ts`
- **Port**: `lib/ports/link.port.ts`
- **Features**: Source/target entities, link types, metadata

### IndexItem
- **Purpose**: Full-text search index
- **Contract**: `lib/contracts/index-item.contract.ts`
- **Port**: `lib/ports/search.port.ts`
- **Features**: Content indexing, field boosting, ranking

## UI Architecture

### Layout Pattern: 3-Pane Workspace

```
┌─────────────────────────────────────────────────┐
│ Page Header (breadcrumbs, actions)             │
├───────┬─────────────────────┬───────────────────┤
│       │                     │                   │
│ Nav   │ List Pane           │ Detail Pane       │
│ Tree  │ - Filters           │ - Entity details  │
│       │ - Search            │ - Links section   │
│       │ - Saved views       │ - Audit section   │
│       │ - Item cards        │ - Actions         │
│       │                     │                   │
└───────┴─────────────────────┴───────────────────┘
```

**Use Cases**:
- Policy Library (policies page)
- Territory Browser (territories page)
- Approval Queue (approvals page)

### Component Hierarchy

```
app/sgm/policies/page.tsx
└── ThreePaneLayout
    ├── NavTree (left)
    │   └── PolicyTreeView
    ├── ListPane (middle)
    │   ├── FilterBar
    │   ├── SavedViewsSelector
    │   └── PolicyCard (multiple)
    └── DetailPane (right)
        ├── PolicyViewer
        ├── LinksSection (ConnectItem)
        └── AuditSection
```

## Testing Strategy

### Unit Tests (Future)
```typescript
describe('SyntheticPolicyProvider', () => {
  it('should return all policies', async () => {
    const provider = new SyntheticPolicyProvider();
    const policies = await provider.findAll();
    expect(policies.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests (Future)
```typescript
describe('POST /api/sgm/policies', () => {
  it('should create policy via synthetic provider', async () => {
    const response = await fetch('/api/sgm/policies', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Policy' }),
    });
    expect(response.status).toBe(201);
  });
});
```

## Design System

### Summit Navy/Cyan Theme

**Primary Colors**:
- Navy: `#0F172A` (navy-900)
- Cyan: `#06B6D4` (primary-500)

**Surfaces**:
- Background: `navy-900`
- Cards: `navy-800` with `backdrop-blur`
- Borders: `navy-700`

**Typography**:
- Font: Inter (sans-serif)
- Mono: Fira Code

**Borders**:
- Radius: `rounded-md` (0.5rem) - Summit tier standard
- Style: 1px solid with hover transitions

**Icons**:
- Library: @radix-ui/react-icons (mandatory)
- No emoji allowed

## Deployment

**Vercel (Recommended)**:
1. Connect GitHub repo
2. Set build command: `next build`
3. Set output directory: `.next`
4. Environment: `BINDING_MODE=synthetic` (default)
5. Auto-deploy on push

**Docker (Alternative)**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3003
```

## Future Enhancements

1. **Prisma Integration** - Add live mode with PostgreSQL
2. **External API Adapters** - Add mapped mode for SPARCC integration
3. **Advanced Search** - Implement full-text search with ranking
4. **Export Engine** - Generate audit packets as PDF/Excel
5. **Ingestion Pipeline** - Import .md and .xlsx files
6. **Multi-tenant** - Add tenant isolation and routing

## Key Design Decisions

1. **Why Standalone Repo?**
   - Independent deployment
   - Easier distribution
   - No monorepo complexity

2. **Why Synthetic-First?**
   - Zero setup required
   - Instant demo-ready
   - Perfect for development

3. **Why Contracts + Ports + Bindings?**
   - Clean architecture
   - Testable design
   - Flexible data sourcing

4. **Why Next.js 14+?**
   - App Router stability
   - React Server Components
   - Simplified data fetching

5. **Why Port 3003?**
   - Summit tier standard (matches apps/summit in monorepo)
   - Avoids conflicts with other apps

## References

- **Plan**: `/Users/todd.lebaron/.claude/plans/scalable-spinning-turtle.md`
- **Monorepo**: `~/dev/aicoderally-stack`
- **SPARCC Reference**: `~/dev/sparcc-spm`
- **Edge Demos**: `~/dev/bhg-edge-demo`, `~/dev/np-edge-demo`
