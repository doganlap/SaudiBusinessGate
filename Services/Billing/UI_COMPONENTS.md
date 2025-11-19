# Billing Service UI Components

This document describes the React UI components that have been migrated and created for the Billing Service.

## Components Overview

### 1. SubscriptionPlans Component

**Location**: `src/components/SubscriptionPlans.tsx`

**Purpose**: Displays available subscription plans with pricing and features, allowing users to select and purchase plans.

**Features**:

- Fetches plans from `/api/billing/plans` endpoint
- Responsive grid layout (1-3 columns)
- Popular plan highlighting
- Feature comparison lists
- Loading and error states
- Current plan indication
- Stripe integration ready

**Props**:

```typescript
interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
  loading?: boolean;
}
```

**Usage**:

```tsx
import { SubscriptionPlans } from '@/components';

<SubscriptionPlans 
  onSelectPlan={(plan) => handlePlanSelection(plan)}
  currentPlan="basic"
/>
```

### 2. BillingDashboard Component

**Location**: `src/components/BillingDashboard.tsx`

**Purpose**: Comprehensive billing dashboard showing subscription status, payment history, and account management.

**Features**:

- Account status overview
- Current subscription details
- Next billing date
- Subscription management (cancel/reactivate)
- Billing portal integration
- Customer information display
- Real-time data fetching

**Props**:

```typescript
interface BillingDashboardProps {
  tenantId: string;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
}
```

**Usage**:

```tsx
import { BillingDashboard } from '@/components';

<BillingDashboard 
  tenantId="tenant_123"
  onUpgrade={() => showUpgradePlans()}
  onManageBilling={() => openBillingPortal()}
/>
```

### 3. VisitorActivation Component

**Location**: `src/components/VisitorActivation.tsx`

**Purpose**: Handles visitor activation workflow including email collection and account activation via tokens.

**Features**:

- Email collection form
- Activation token processing
- Multi-step workflow (email → activating → success/error)
- Email validation
- Error handling and retry logic
- Success confirmation
- Integration with activation API

**Props**:

```typescript
interface VisitorActivationProps {
  token?: string;
  tenantId?: string;
  onActivationComplete?: (data: any) => void;
  onSendActivation?: (email: string, tenantId: string) => void;
}
```

**Usage**:

```tsx
import { VisitorActivation } from '@/components';

// For email collection
<VisitorActivation 
  tenantId="tenant_123"
  onSendActivation={(email, tenantId) => handleEmailSent(email, tenantId)}
/>

// For token activation
<VisitorActivation 
  token="jwt_activation_token"
  tenantId="tenant_123"
  onActivationComplete={(data) => handleActivationComplete(data)}
/>
```

## Component Architecture

### Design System

All components follow a consistent design system:

- **Colors**: Blue primary, green success, red error, gray neutral
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px grid system
- **Icons**: Lucide React icons
- **Layout**: Responsive grid and flexbox

### State Management

- Local state with React hooks (`useState`, `useEffect`)
- API integration with fetch
- Loading, error, and success states
- Form validation and submission

### Styling

- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Hover and focus states
- Accessibility considerations

## Integration Points

### API Endpoints

Components integrate with the following billing service endpoints:

1. **SubscriptionPlans**:
   - `GET /api/billing/plans` - Fetch available plans

2. **BillingDashboard**:
   - `GET /api/billing/dashboard/:tenantId` - Get billing data
   - `POST /api/billing/portal` - Create billing portal session

3. **VisitorActivation**:
   - `POST /api/billing/send-activation` - Send activation email
   - `POST /api/billing/activate` - Activate visitor account

### Data Flow

```
User Interaction → Component State → API Call → Response Handling → UI Update
```

## Migrated Archive Components

The following components were migrated and adapted from the Archive:

### From Archive/app/activation/page.tsx

- **Migrated to**: VisitorActivation component
- **Enhancements**:
  - Added proper TypeScript interfaces
  - Integrated with billing API
  - Added multi-step workflow
  - Enhanced error handling

### From Archive/app/pricing/page.tsx

- **Migrated to**: SubscriptionPlans component
- **Enhancements**:
  - Dynamic plan loading from API
  - Enhanced feature comparison
  - Popular plan highlighting
  - Better responsive design

### Archive Integration Benefits

- Consistent UI patterns from existing codebase
- Proven user experience flows
- Familiar design language
- Reduced development time

## Usage Examples

### Complete Billing Flow

```tsx
import { SubscriptionPlans, BillingDashboard, VisitorActivation } from '@/components';

function BillingApp({ user, tenantId }) {
  const [currentView, setCurrentView] = useState('dashboard');
  
  if (!user.activated) {
    return (
      <VisitorActivation 
        tenantId={tenantId}
        onActivationComplete={() => setCurrentView('plans')}
      />
    );
  }
  
  if (currentView === 'plans') {
    return (
      <SubscriptionPlans 
        currentPlan={user.currentPlan}
        onSelectPlan={(plan) => handlePlanSelection(plan)}
      />
    );
  }
  
  return (
    <BillingDashboard 
      tenantId={tenantId}
      onUpgrade={() => setCurrentView('plans')}
    />
  );
}
```

### Standalone Components

```tsx
// Just the subscription plans
<SubscriptionPlans onSelectPlan={handlePlanSelection} />

// Just the billing dashboard
<BillingDashboard tenantId="tenant_123" />

// Just the activation flow
<VisitorActivation tenantId="tenant_123" />
```

## Customization

### Theming

Components use CSS custom properties for easy theming:

```css
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --error-color: #ef4444;
  --gray-color: #6b7280;
}
```

### Feature Flags

Components support feature flags for conditional rendering:

```tsx
<SubscriptionPlans 
  showTrialBadge={features.showTrial}
  enableAnnualPlans={features.annualBilling}
/>
```

## Accessibility

All components include:

- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Testing

Components are designed for easy testing:

- Predictable props interface
- Separated business logic
- Mockable API calls
- Clear state transitions

## Future Enhancements

Planned improvements:

- Dark mode support
- Animation and transitions
- Advanced filtering and search
- Bulk operations
- Export functionality
- Mobile app integration

## Dependencies

Required packages:

- `react` - Core React library
- `lucide-react` - Icon library
- `tailwindcss` - Styling framework

Optional packages:

- `@stripe/stripe-js` - Stripe frontend integration
- `react-query` - Advanced data fetching
- `framer-motion` - Animations
