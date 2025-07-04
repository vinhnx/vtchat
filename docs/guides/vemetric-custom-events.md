# Vemetric Custom Event Tracking Guide

This guide covers the enhanced Vemetric custom event tracking implementation in VTChat, including frontend data attributes and backend server-side tracking for critical business events.

## Overview

The implementation provides three layers of event tracking:

1. **Frontend Tracking** - User interactions via data attributes and React hooks
2. **Backend Tracking** - Critical business events via Node.js SDK
3. **Automated Tracking** - Page views and outbound links (enabled by default)

## Frontend Tracking

### Data Attributes

Add `data-vmtrc` attributes to HTML elements for automatic event tracking:

```jsx
// Basic event tracking
<button data-vmtrc="ButtonClicked">Click me</button>

// Event with metadata
<button
    data-vmtrc="SubscriptionSelected"
    data-vmtrc-plan="VT_PLUS"
    data-vmtrc-price="10"
    data-vmtrc-context="pricing_page"
>
    Subscribe to VT+
</button>
```

### React Hook Usage

Use the `useVemetric` hook for programmatic tracking:

```tsx
import { useVemetric } from '@repo/common/hooks/use-vemetric';

function MyComponent() {
    const { trackEvent, identifyUser } = useVemetric();

    const handleUserAction = async () => {
        await trackEvent('CustomAction', {
            context: 'component',
            value: 1,
        });
    };

    return <button onClick={handleUserAction}>Track Action</button>;
}
```

### Helper Functions

Use pre-built helper functions for common events:

```tsx
import { vemetricHelpers } from '@repo/common/hooks/use-vemetric';

// Track message sent
await vemetricHelpers.trackMessageSent({
    modelName: 'gpt-4',
    messageLength: 150,
    hasAttachments: true,
    toolsUsed: ['web_search'],
});

// Track feature usage
await vemetricHelpers.trackFeatureUsed('file_upload', 'chat_interface');

// Track file upload
await vemetricHelpers.trackFileUploaded('pdf', 1024000);
```

## Backend Tracking

### Service Usage

Use the backend service for server-side tracking:

```typescript
import { vemetricBackend } from '@repo/common/services/vemetric-backend';

// Track custom event
await vemetricBackend.trackEvent(userId, 'PaymentProcessed', {
    amount: 10,
    currency: 'USD',
    tier: 'VT_PLUS',
});

// Update user properties
await vemetricBackend.updateUser(userId, {
    subscriptionTier: 'VT_PLUS',
    messageCount: 50,
});
```

### Integration Functions

Use pre-built integration functions for critical events:

```typescript
import {
    trackPaymentSuccess,
    trackUserRegistration,
    trackSubscriptionCreated,
    trackPremiumFeatureUsage,
} from '@/lib/vemetric-integrations';

// Payment webhook handler
export async function handlePaymentSuccess(paymentData) {
    await trackPaymentSuccess(userId, {
        amount: 10,
        currency: 'USD',
        subscriptionTier: 'VT_PLUS',
        paymentMethod: 'card',
        subscriptionId: 'sub_123',
    });
}

// Auth callback
export async function handleUserRegistration(userData) {
    await trackUserRegistration(userId, {
        provider: 'google',
        referralSource: 'organic',
    });
}

// API route
export async function handlePremiumFeature(userId: string) {
    await trackPremiumFeatureUsage(userId, {
        featureName: 'advanced_rag',
        context: 'api_call',
        processingTime: 1500,
    });
}
```

## Event Types

### Pre-defined Events

The system includes 50+ pre-defined events in [`packages/shared/types/analytics.ts`](file:///Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/packages/shared/types/analytics.ts):

- **Authentication**: `UserSignedIn`, `UserRegistered`, `AuthMethodSelected`
- **Chat**: `MessageSent`, `ModelSelected`, `ResponseReceived`, `ThreadCreated`
- **Features**: `ToolUsed`, `FileUploaded`, `SettingsChanged`, `PromptBoostUsed`
- **Subscriptions**: `SubscriptionCreated`, `PlanUpgradeCompleted`, `PaymentInitiated`
- **User Journey**: `OnboardingStarted`, `FirstMessageSent`, `FeatureDiscovered`
- **Performance**: `APIResponseTime`, `PageLoadTime`, `ResponseTimeout`
- **Security**: `SuspiciousActivity`, `SessionExpired`

### Custom Events

Create custom events following the naming convention:

```typescript
// Good: PascalCase, descriptive
'DocumentProcessed';
'AdvancedSearchUsed';
'ExportCompleted';

// Avoid: generic names
'Event';
'Action';
'Click';
```

## Data Attributes Reference

### Basic Syntax

```html
<!-- Event name only -->
<element data-vmtrc="EventName">
    <!-- Event with metadata -->
    <element data-vmtrc="EventName" data-vmtrc-key1="value1" data-vmtrc-key2="value2"></element
></element>
```

### Common Patterns

```html
<!-- Subscription buttons -->
<button
    data-vmtrc="PlanSelected"
    data-vmtrc-plan="VT_PLUS"
    data-vmtrc-price="10"
    data-vmtrc-context="pricing_page"
>
    <!-- Authentication buttons -->
    <button
        data-vmtrc="AuthMethodSelected"
        data-vmtrc-provider="google"
        data-vmtrc-context="login_form"
    >
        <!-- Feature usage -->
        <button
            data-vmtrc="FeatureUsed"
            data-vmtrc-feature="file_upload"
            data-vmtrc-context="chat_interface"
        >
            <!-- Navigation -->
            <a data-vmtrc="PageVisited" data-vmtrc-page="pricing" data-vmtrc-source="navbar"></a>
        </button>
    </button>
</button>
```

## Privacy & Security

### Data Sanitization

All data is automatically sanitized to remove PII:

```typescript
// Automatically redacted fields
const sensitiveFields = [
    'apiKey',
    'api_key',
    'token',
    'password',
    'secret',
    'email',
    'phone',
    'ssn',
    'credit_card',
];

// URLs are sanitized to domain only
const sanitizedUrl = AnalyticsUtils.sanitizeUrl('https://api.example.com/users/123/data');
// Result: 'api.example.com'
```

### User Properties

Only non-PII user properties are tracked:

```typescript
interface UserProperties {
    subscriptionTier: PlanSlug;
    accountAge: number;
    messageCount: number;
    preferredModel: string;
    themePreference: 'light' | 'dark' | 'system';
    deviceType: 'desktop' | 'mobile' | 'tablet';
    // No email, name, or other PII
}
```

## Implementation Examples

### Payment Flow

```typescript
// apps/web/app/api/webhooks/payments/route.ts
import { trackPaymentSuccess, trackPaymentFailure } from '@/lib/vemetric-integrations';

export async function POST(request: Request) {
    const payload = await request.json();

    if (payload.type === 'payment.succeeded') {
        await trackPaymentSuccess(payload.customer.id, {
            amount: payload.amount,
            currency: payload.currency,
            subscriptionTier: 'VT_PLUS',
            paymentMethod: payload.payment_method.type,
            subscriptionId: payload.subscription.id,
        });
    }
}
```

### Chat Interface

```typescript
// apps/web/components/chat-input.tsx
import { vemetricHelpers } from '@repo/common/hooks/use-vemetric';

export function ChatInput() {
    const handleSendMessage = async (message: string) => {
        // Send message logic...

        // Track the event
        await vemetricHelpers.trackMessageSent({
            modelName: selectedModel,
            messageLength: message.length,
            hasAttachments: attachments.length > 0,
            toolsUsed: detectedTools
        });
    };

    return (
        <button
            onClick={handleSendMessage}
            data-vmtrc="MessageSent"
            data-vmtrc-context="chat_interface"
        >
            Send Message
        </button>
    );
}
```

### Feature Gate

```typescript
// apps/web/components/premium-feature.tsx
import { trackFeatureGateEncounter } from '@/lib/vemetric-integrations';

export function PremiumFeature({ user }: { user: User }) {
    const handleFeatureAccess = async () => {
        if (user.tier === 'VT_BASE') {
            await trackFeatureGateEncounter(user.id, {
                featureName: 'advanced_rag',
                userTier: user.tier,
                context: 'feature_attempt',
                actionTaken: 'blocked'
            });

            // Show upgrade modal
            return;
        }

        // Allow feature access
        await trackPremiumFeatureUsage(user.id, {
            featureName: 'advanced_rag',
            context: 'feature_used'
        });
    };

    return (
        <button
            onClick={handleFeatureAccess}
            data-vmtrc="PremiumFeatureAccessed"
            data-vmtrc-feature="advanced_rag"
            data-vmtrc-tier={user.tier}
        >
            Use Advanced RAG
        </button>
    );
}
```

## Testing

### Development Mode

Enable debug mode for detailed logging:

```typescript
const { trackEvent } = useVemetric({ debug: true });
```

### Verification

Check events in browser console and server logs:

```bash
# Frontend events
# Check browser dev tools console for event confirmations

# Backend events
bun run dev
# Look for: "Backend event tracked" log messages
```

## Best Practices

1. **Use descriptive event names** in PascalCase
2. **Add contextual metadata** for better analysis
3. **Track critical business events on backend** for reliability
4. **Use data attributes for UI interactions** for simplicity
5. **Follow privacy guidelines** - no PII in events
6. **Test in development** before deploying
7. **Monitor event volume** to avoid hitting API limits

## Configuration

Environment variables:

```bash
# Required
VEMETRIC_TOKEN=your_token_here
NEXT_PUBLIC_VEMETRIC_TOKEN=your_token_here

# Optional
VEMETRIC_HOST=https://your-proxy-domain.com
```

## Troubleshooting

### Common Issues

1. **Events not appearing**: Check token configuration and network connectivity
2. **Backend tracking failing**: Verify server environment variables
3. **Data attributes not working**: Ensure Vemetric script is loaded
4. **PII in events**: Review data sanitization in AnalyticsUtils

### Debug Mode

Enable comprehensive logging:

```typescript
// Frontend
const { trackEvent } = useVemetric({ debug: true });

// Backend
// Check server logs for "Failed to track" error messages
```

For more detailed troubleshooting, check the [Vemetric documentation](https://vemetric.com/docs).
