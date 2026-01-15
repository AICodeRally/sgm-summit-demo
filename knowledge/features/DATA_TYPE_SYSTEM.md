# Data Type System

> **Feature Documentation**
> Last Updated: 2026-01-15

## Overview

The Data Type System provides a universal classification mechanism for distinguishing between demonstration data, template data, and production client data across the SGM platform. This enables users to quickly identify the nature of any record and ensures clear separation between sample data used for training and real production data.

## Data Types

| Type | Badge Color | Purpose |
|------|-------------|---------|
| **demo** | Orange gradient | Sample data for demonstrations, training, and testing |
| **template** | Teal gradient | Reusable templates and standard configurations |
| **client** | Green gradient | Production client data requiring action |

## Visual Components

### DataTypeBadge

The primary component for displaying data type classification.

```tsx
import { DataTypeBadge } from '@/components/demo/DemoBadge';

<DataTypeBadge dataType="demo" size="sm" />
<DataTypeBadge dataType="template" size="md" />
<DataTypeBadge dataType="client" size="lg" />
```

**Props:**
- `dataType`: 'demo' | 'template' | 'client'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `demoMetadata`: Optional metadata for tooltip display

### Individual Badge Components

- `DemoBadge` - Orange gradient badge with cube icon
- `TemplateBadge` - Teal gradient badge with file icon
- `ClientBadge` - Green gradient badge with person icon

### Highlight Wrappers

For wrapping content with data type-specific visual treatment:

```tsx
import { DataTypeHighlight, DemoHighlight, TemplateHighlight, ClientHighlight } from '@/components/demo/DemoBadge';

<DemoHighlight>Demo content here</DemoHighlight>
<TemplateHighlight>Template content here</TemplateHighlight>
<ClientHighlight>Client content here</ClientHighlight>
```

## Contract Integration

### DataType Schema

```typescript
// lib/contracts/data-type.contract.ts
export const DataTypeSchema = z.enum(['demo', 'template', 'client']);
export type DataType = z.infer<typeof DataTypeSchema>;
```

### DemoMetadata Schema

```typescript
export const DemoMetadataSchema = z.object({
  year: z.number().optional(),
  bu: z.string().optional(),        // Business unit
  division: z.string().optional(),
  category: z.string().optional(),
}).optional();
```

### Entity Integration

The following entities support data type classification:

| Entity | Default Type | Contract Location |
|--------|--------------|-------------------|
| Plan | client | `lib/contracts/plan.contract.ts` |
| PlanTemplate | template | `lib/contracts/plan-template.contract.ts` |
| Document | client | `lib/contracts/document.contract.ts` |
| DocumentVersion | (inherits) | `lib/contracts/document-version.contract.ts` |
| Approval | client | Defined in synthetic data |
| Case | client | Defined in synthetic data |

## Pages Using Data Types

| Page | Location | Badge Display |
|------|----------|---------------|
| Plans | `/plans` | Card title |
| Templates | `/templates` | Card title |
| Documents | `/documents` | List item + detail pane |
| Approvals | `/approvals` | List item title |
| Cases | `/cases` | List item title |
| Policies | `/policies` | Policy item header |

## Filtering

Pages support filtering by data type:

```typescript
// In filter state
const [filters, setFilters] = useState({
  dataType: 'ALL' as DataType | 'ALL',
  // ... other filters
});

// API call with filter
fetch(`/api/plans?dataType=${filters.dataType}`);
```

## Best Practices

1. **Always display badges** - Show the DataTypeBadge wherever entity titles appear
2. **Default appropriately** - Use sensible defaults: `client` for new records, `template` for system templates
3. **Filter support** - Provide data type filtering on list pages
4. **Consistent placement** - Place badges immediately after titles, before other metadata
5. **Size appropriately** - Use `sm` in lists, `md` in cards, `lg` in detail views

## Technical Implementation

### Badge Styling

Badges use CSS gradients for visual distinction:

```css
/* Demo - Orange */
background: linear-gradient(135deg, #f97316, #fb923c, #fdba74);

/* Template - Teal */
background: linear-gradient(135deg, #0d9488, #14b8a6, #2dd4bf);

/* Client - Green */
background: linear-gradient(135deg, #059669, #10b981, #34d399);
```

### API Response Format

APIs return data with `dataType` field:

```json
{
  "plans": [
    {
      "id": "plan-001",
      "title": "Annual Sales Compensation",
      "dataType": "demo",
      "demoMetadata": {
        "year": 2026,
        "bu": "SPARCC",
        "division": "Sales"
      }
    }
  ]
}
```

## Related Documentation

- [Plans Page](/knowledge/ui/pages/plans/page.md)
- [Templates Page](/knowledge/ui/pages/templates/page.md)
- [Documents Page](/knowledge/ui/pages/documents/page.md)
- [Approvals Page](/knowledge/ui/pages/approvals/page.md)
- [Cases Page](/knowledge/ui/pages/cases/page.md)

## Changelog

- **2026-01-15**: Initial implementation with demo, template, and client types
- Badges added to Plans, Templates, Documents, Approvals, Cases pages
- Contract schemas extended with dataType and demoMetadata fields
- API routes updated to include data type in responses
