# SGM Summit Demo

[![CI](https://github.com/AICodeRally/sgm-summit-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/AICodeRally/sgm-summit-demo/actions/workflows/ci.yml)

**Sales Governance Manager** - A Summit-tier demonstration of governance capabilities for sales compensation management.

## Architecture: Contracts + Ports + Bindings

This application demonstrates a novel **3-layer clean architecture pattern** designed for flexible data sourcing and easy testing:

1. **Contracts** (`lib/contracts/`) - Entity definitions with TypeScript types + Zod schemas
2. **Ports** (`lib/ports/`) - Service interfaces for dependency injection
3. **Bindings** (`lib/bindings/`) - Provider implementations (Synthetic | Mapped | Live)

### Why This Pattern?

- **Zero Setup** - Synthetic mode works instantly without external dependencies
- **Type-Safe** - Zod provides runtime validation + TypeScript compile-time safety
- **Testable** - Easy to mock ports for unit tests
- **Flexible** - Swap data sources without changing business logic

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (port 4200)
npm run dev

# Visit the app
open http://localhost:4200

# Test the API
curl http://localhost:4200/api/sgm/diagnostics
```

## Features

### ✅ Implemented (MVP)

- **Policies** - Governance documents with versioning and lifecycle management
  - Semantic versioning (major.minor.patch)
  - Status transitions: draft → published → superseded → retired
  - Full-text search and filtering
  - CRUD API endpoints

- **Territories** - Sales territory hierarchy and assignment
  - Geographic, account, industry, and named territory types
  - Parent/child relationships
  - Assignment tracking

- **Approvals** - Multi-level approval workflows
  - Pending/approved/rejected states
  - Workflow steps with SLA tracking
  - Statistics and compliance metrics

- **Audit Logs** - Append-only event logging
  - All mutations tracked
  - Actor, timestamp, changes recorded
  - Export capabilities

- **Links** - Entity relationships (ConnectItem pattern)
  - Policy versioning links
  - Policy-territory coverage mapping
  - Graph traversal support

- **Search** - Full-text search with indexing (IndexItem pattern)
  - Relevance scoring
  - Faceted search
  - Highlighting

### 📋 Planned (Future)

- UI pages with 3-pane workspace layouts
- Approval workflow UI
- Policy editor with markdown support
- Link graph visualizations
- Coverage matrix views
- Export to PDF/Excel
- File ingestion (.md, .xlsx)

## API Endpoints

### Diagnostics

```bash
# Get system status
GET /api/sgm/diagnostics
```

Returns:
- Binding mode configuration
- Provider status
- Data availability counts
- Architecture info

### Policies

```bash
# List policies
GET /api/sgm/policies?status=published&search=commission

# Get policy by ID
GET /api/sgm/policies/pol-001

# Create policy
POST /api/sgm/policies
{
  "tenantId": "demo-tenant-001",
  "name": "New Policy",
  "version": "0.1.0",
  "content": "Policy content...",
  "createdBy": "user-001"
}

# Update policy
PUT /api/sgm/policies/pol-001
{
  "name": "Updated Name",
  "updatedBy": "user-001"
}

# Delete policy
DELETE /api/sgm/policies/pol-001?deletedBy=user-001
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Validation**: Zod (runtime + compile-time)
- **Styling**: Tailwind CSS (Summit Navy/Cyan theme)
- **Icons**: @radix-ui/react-icons (mandatory)
- **Dates**: date-fns
- **Database**: Prisma ORM (for future live mode)

## Project Structure

```
sgm-summit-demo/
├── app/                      # Next.js App Router
│   ├── api/sgm/              # API routes
│   ├── sgm/                  # UI pages (planned)
│   └── page.tsx              # Landing page
├── components/               # React components (planned)
├── lib/                      # Core business logic
│   ├── contracts/            # Entity definitions + Zod schemas
│   ├── ports/                # Service interfaces
│   ├── bindings/             # Provider implementations
│   │   ├── synthetic/        # In-memory providers
│   │   ├── registry.ts       # Provider registry
│   │   └── index.ts          # Exports
│   ├── data/synthetic/       # Mock data
│   └── config/               # Configuration
├── knowledge/                # Documentation (planned)
├── .claude/                  # Agent guidance
├── next.config.ts            # Next.js config
├── tailwind.config.ts        # Tailwind config (Summit theme)
└── tsconfig.json             # TypeScript config
```

## Configuration

### Binding Modes

Set via environment variables:

```bash
# Use synthetic providers (default)
BINDING_MODE=synthetic

# Use external API adapters (future)
BINDING_MODE=mapped
EXTERNAL_API_URL=https://api.example.com
EXTERNAL_API_KEY=your-key

# Use Prisma database (future)
BINDING_MODE=live
DATABASE_URL=postgresql://...
```

### Environment Variables

See `.env.example` for all available options.

## Development

```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Deploy automatically
4. No environment variables needed for synthetic mode

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
EXPOSE 4200
```

## Data

### Synthetic Data (Demo)

Pre-loaded mock data includes:
- **10 policies** - Commission rates, split credit, quotas, accelerators
- **10 territories** - US geographic hierarchy, industry verticals, named accounts
- **3 approvals** - Pending, approved, and rejected examples
- **12 links** - Versioning and coverage relationships

All data uses tenant ID: `demo-tenant-001`

## Design System

### Summit Navy/Cyan Theme

```css
--color-primary: #06B6D4 (Cyan)
--color-navy: #0F172A (Navy)
```

- **Background**: Navy gradient
- **Cards**: Glass-morphism with backdrop-blur
- **Borders**: rounded-md (0.5rem)
- **Icons**: @radix-ui/react-icons only
- **Typography**: Inter font

## Testing

```bash
# Manual API testing
curl http://localhost:4200/api/sgm/diagnostics
curl http://localhost:4200/api/sgm/policies?status=published
curl http://localhost:4200/api/sgm/policies/pol-001

# Future: Automated tests
npm test
```

## Documentation

- Architecture: `.claude/architecture-context.md`
- Project context: `.claude/project-context.md`
- Implementation plan: `~/.claude/plans/scalable-spinning-turtle.md`

## Related Projects

- **aicoderally-stack** - Monorepo with Summit patterns
- **sparcc-spm** - SPARCC SPM reference
- **bhg-edge-demo** - Edge tier demo
- **np-edge-demo** - Nonprofit Edge demo

## Status

**Current Phase**: MVP Complete (Phase 4)

**Next Steps**:
- Phase 5: UI Components
- Phase 6: UI Pages
- Phase 7: Documentation & Polish

## Contributing

This is a demonstration project. For production use:
1. Implement Prisma live mode
2. Add authentication/authorization
3. Implement UI pages
4. Add comprehensive tests
5. Set up CI/CD

## License

ISC

---

**Built with:**
- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
