# Vemetric Analytics Integration Guide

This guide covers the comprehensive Vemetric analytics integration implemented in VT Chat. The integration provides detailed user behavior tracking, performance monitoring, and business intelligence while maintaining strict privacy compliance.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup and Configuration](#setup-and-configuration)
4. [User Identification](#user-identification)
5. [Event Tracking](#event-tracking)
6. [Analytics Components](#analytics-components)
7. [Custom Hooks](#custom-hooks)
8. [Privacy and Compliance](#privacy-and-compliance)
9. [Testing and Verification](#testing-and-verification)
10. [Troubleshooting](#troubleshooting)

## Overview

VT Chat uses Vemetric for comprehensive product analytics to understand user behavior, track feature usage, and optimize the user experience. The integration includes:

- **User Identification**: Seamless integration with Better-Auth for user tracking
- **Event Tracking**: Custom events for all major user interactions
- **Performance Monitoring**: Response times and application performance
- **User Journey Tracking**: Onboarding flows and feature discovery
- **Privacy Compliance**: No PII collection, automatic data sanitization

## Architecture

### Core Components

```
packages/
├── shared/types/analytics.ts          # Type definitions
├── common/utils/analytics.ts          # Analytics utilities
├── common/hooks/use-vemetric.ts       # Main analytics hook
└── common/components/
    ├── vemetric-auth-provider.tsx     # Auth integration
    ├── vemetric-chat-tracker.tsx      # Chat event tracking
    ├── vemetric-subscription-tracker.tsx # Subscription tracking
    └── vemetric-settings-tracker.tsx  # Settings tracking
```

### Integration Points

- **Layout**: VemetricScript and VemetricAuthProvider in root layout
- **Chat Components**: Message sending, model selection, feature usage
- **Authentication**: User identification and sign-in/out events
- **Subscriptions**: Plan changes and upgrade tracking
- **Settings**: Theme changes, preferences, exports

## Setup and Configuration

### Environment Variables

Add to your `.env` file:

```env
NEXT_PUBLIC_VEMETRIC_TOKEN=your_vemetric_token_here
```

### Layout Integration

The integration is automatically included in the root layout:

```tsx
// apps/web/app/layout.tsx
import { VemetricScript } from '@vemetric/react';
import { VemetricAuthProvider, VemetricChatTracker } from '@repo/common/components';

export default function Layout({ children }) {
    return (
        <html>
            <head>
                <VemetricScript token={process.env.NEXT_PUBLIC_VEMETRIC_TOKEN} />
            </head>
            <body>
                <VemetricAuthProvider>
                    <VemetricChatTracker />
                    {children}
                </VemetricAuthProvider>
            </body>
        </html>
    );
}
```

## User Identification

### Automatic Integration with Better-Auth

The `VemetricAuthProvider` automatically handles user identification:

```tsx
// Automatically identifies users when they sign in
const vemetricUser = {
    identifier: session.user.id,
    displayName: session.user.name || session.user.email?.split('@')[0],
    subscriptionTier: session.user.subscriptionTier || 'VT_BASE',
    allowCookies: true, // For authenticated users
    data: {
        accountAge: calculateAccountAge(session.user.createdAt),
        authProvider: session.user.accounts?.[0]?.providerId,
    },
};
```

### User Properties

User properties are automatically updated and include:

```typescript
interface UserProperties {
    subscriptionTier: 'VT_BASE' | 'VT_PLUS';
    accountAge?: number; // Days since registration
    messageCount?: number;
    preferredModel?: string;
    themePreference?: 'light' | 'dark' | 'system';
    timezone?: string;
    locale?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browserName?: string;
    referralSource?: string;
}
```

## Event Tracking

### Core Events

#### Authentication Events

- `UserSignedIn` - User successfully signs in
- `UserSignedOut` - User signs out
- `UserRegistered` - New user registration
- `AuthMethodSelected` - OAuth provider selection

#### Chat Events

- `MessageSent` - User sends a message
- `ChatStarted` - New chat/thread created
- `ModelSelected` - AI model changed
- `ResponseReceived` - AI response completed
- `ThreadCreated` - New conversation thread
- `ThreadDeleted` - Thread removed

#### Feature Usage

- `FileUploaded` - File attachment uploaded
- `ToolUsed` - Feature toggle (web search, calculator, charts)
- `SettingsChanged` - User preferences modified
- `ThemeChanged` - Theme/appearance changed
- `PromptBoostUsed` - Prompt enhancement feature used

#### Subscription Events

- `SubscriptionCreated` - New paid subscription
- `SubscriptionCancelled` - Subscription cancelled
- `PlanUpgradeInitiated` - User starts upgrade process
- `PlanUpgradeCompleted` - Upgrade successful

#### User Journey Events

- `OnboardingStarted` - User begins onboarding
- `FirstMessageSent` - User's first interaction
- `FeatureDiscovered` - User finds new feature
- `HelpAccessed` - User views help/documentation

### Event Data Structure

All events include sanitized metadata:

```typescript
// Chat event example
{
  messageLength: 142,
  modelName: 'CLAUDE_3_5_SONNET',
  hasAttachments: true,
  toolsUsed: ['webSearch', 'mathCalculator'],
  threadId: 'abc12345', // Truncated for privacy
  responseTime: 2450 // milliseconds
}
```

## Analytics Components

### VemetricChatTracker

Automatically tracks chat-related state changes:

```tsx
// Tracks model selection, feature toggles, thread creation
<VemetricChatTracker />
```

### VemetricSubscriptionTracker

Monitors subscription tier changes:

```tsx
import { VemetricSubscriptionTracker } from '@repo/common/components';

function App() {
    return (
        <div>
            <VemetricSubscriptionTracker />
            {/* Your app content */}
        </div>
    );
}
```

### VemetricSettingsTracker

Tracks theme and preference changes:

```tsx
import { VemetricSettingsTracker } from '@repo/common/components';

function SettingsPage() {
    return (
        <div>
            <VemetricSettingsTracker />
            {/* Settings UI */}
        </div>
    );
}
```

## Custom Hooks

### useVemetric

Main analytics hook for custom tracking:

```tsx
import { useVemetric } from '@repo/common/hooks/use-vemetric';

function MyComponent() {
    const { trackEvent, identifyUser, isEnabled } = useVemetric();

    const handleCustomAction = async () => {
        if (isEnabled) {
            await trackEvent('CustomAction', {
                context: 'button_click',
                value: 100,
            });
        }
    };

    return <button onClick={handleCustomAction}>Custom Action</button>;
}
```

### useVemetricMessageTracking

Specialized hook for chat interactions:

```tsx
import { useVemetricMessageTracking } from '@repo/common/components/vemetric-chat-tracker';

function ChatInput() {
    const { trackMessageSent, createTimer } = useVemetricMessageTracking();

    const sendMessage = async (text: string) => {
        const timer = createTimer();

        // Send message logic here
        await sendToAPI(text);

        // Track the event
        await trackMessageSent({
            messageLength: text.length,
            modelName: selectedModel,
            hasAttachments: hasFiles,
        });

        // Track performance
        timer.end('MessageSendTime', { modelName: selectedModel });
    };
}
```

### useVemetricSubscriptionTracking

For subscription-related events:

```tsx
import { useVemetricSubscriptionTracking } from '@repo/common/components/vemetric-subscription-tracker';

function UpgradeButton() {
    const { trackUpgradeInitiated } = useVemetricSubscriptionTracking();

    const handleUpgrade = async () => {
        await trackUpgradeInitiated('pricing_page');
        // Redirect to payment...
    };
}
```

## Privacy and Compliance

### Data Sanitization

All data is automatically sanitized before sending:

```typescript
// PII patterns are automatically removed
const sanitized = AnalyticsUtils.sanitizeData({
    email: 'user@example.com', // Becomes '[email]'
    message: 'Call me at 555-1234', // Becomes 'Call me at [phone]'
    apiKey: 'sk-1234567890', // Removed entirely
});
```

### No PII Collection

The system is designed to never collect:

- Email addresses
- Real names
- Phone numbers
- API keys or tokens
- Message content
- File contents
- IP addresses (handled by Vemetric)

### Data Minimization

- User IDs are truncated to 8 characters for correlation
- File names are sanitized to extensions only
- URLs are reduced to domains
- Search queries only track length, not content

## Testing and Verification

### Development Mode

Enable debug mode for testing:

```tsx
const { trackEvent } = useVemetric({ debug: true });
```

### Verification Steps

1. **Check Event Tracking**:

    ```typescript
    // Events are logged in development
    console.log('Analytics event tracked:', eventName, eventData);
    ```

2. **Verify User Identification**:

    ```typescript
    // Check if user is properly identified
    const { currentUser } = useVemetric();
    console.log('Current user:', currentUser);
    ```

3. **Test Privacy Compliance**:
    ```typescript
    // Ensure no PII in event data
    const eventData = AnalyticsUtils.sanitizeData(rawData);
    console.log('Sanitized data:', eventData);
    ```

### Manual Testing Checklist

- [ ] User sign-in tracked
- [ ] Message sending tracked with correct metadata
- [ ] Model changes recorded
- [ ] Feature toggles tracked
- [ ] Subscription changes detected
- [ ] Theme changes recorded
- [ ] Performance metrics captured
- [ ] No PII in any events
- [ ] Events only fire when user is authenticated

## Troubleshooting

### Common Issues

#### Events Not Tracking

1. Check environment variable is set:

    ```bash
    echo $NEXT_PUBLIC_VEMETRIC_TOKEN
    ```

2. Verify user is authenticated:

    ```typescript
    const { data: session } = useSession();
    console.log('Session:', session);
    ```

3. Check Vemetric initialization:
    ```typescript
    const { isEnabled, isInitialized } = useVemetric();
    console.log('Vemetric status:', { isEnabled, isInitialized });
    ```

#### User Not Identified

1. Check auth provider is working:

    ```typescript
    // Should see user identification in logs
    console.log('Identifying user:', userId);
    ```

2. Verify session data:
    ```typescript
    const { data: session } = useSession();
    console.log('User ID:', session?.user?.id);
    ```

#### Performance Issues

1. Check if events are being batched:

    ```typescript
    // Use batch tracking for multiple events
    const { trackEvents } = useVemetric();
    await trackEvents([
      { name: 'Event1', data: { ... } },
      { name: 'Event2', data: { ... } }
    ]);
    ```

2. Verify timers are being ended:
    ```typescript
    const timer = createTimer();
    // ... operation ...
    timer.end('OperationName'); // Don't forget this!
    ```

### Debug Mode

Enable comprehensive logging:

```typescript
const vemetric = useVemetric({
    debug: process.env.NODE_ENV === 'development',
    autoTrack: true,
});
```

### Error Handling

All analytics calls are wrapped in try-catch blocks and won't break the application:

```typescript
try {
    await trackEvent('MyEvent', eventData);
} catch (error) {
    log.error({ error }, 'Analytics tracking failed');
    // Application continues normally
}
```

## Best Practices

1. **Always check if enabled** before tracking events
2. **Use type-safe event names** from `ANALYTICS_EVENTS`
3. **Sanitize data** using `AnalyticsUtils` methods
4. **Track user journeys** with meaningful steps
5. **Monitor performance** with timers for key operations
6. **Respect privacy** by avoiding PII collection
7. **Test thoroughly** in development mode
8. **Document custom events** for team understanding

## Support

For issues or questions about the Vemetric integration:

1. Check the [Vemetric documentation](https://vemetric.com/docs)
2. Review this implementation guide
3. Check the debug logs in development mode
4. Verify environment configuration
5. Test with a simplified event first

Remember: Analytics should enhance the user experience, not degrade it. All tracking is non-blocking and fails gracefully.
