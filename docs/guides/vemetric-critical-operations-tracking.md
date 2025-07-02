# Critical Operations Tracking with Vemetric

This guide covers comprehensive tracking of critical operations while maintaining PII security.

## Overview

The VT Chat application now includes advanced analytics tracking for:

- **Payment Operations** - Payment flows, subscriptions, errors
- **RAG & Document Processing** - Document uploads, processing, queries
- **Performance & Tools** - API response times, tool executions, errors
- **Security Events** - Authentication, permissions, suspicious activity

## PII Protection Principles

All trackers follow strict PII protection:

- ✅ **Hash sensitive data** - IPs, user IDs, subscription IDs
- ✅ **Sanitize content** - Remove emails, names, dates from filenames
- ✅ **Store metadata only** - File sizes, processing times, not content
- ✅ **Aggregate metrics** - Usage patterns, not individual actions
- ❌ **Never store** - Actual content, queries, personal information

## Quick Start

### 1. Add Trackers to Your App Layout

```tsx
// apps/web/app/layout.tsx
import {
  VemetricPaymentTracker,
  VemetricRagTracker,
  VemetricPerformanceTracker,
  VemetricSecurityTracker
} from '@repo/common/components';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* Add trackers - they don't render UI */}
        <VemetricPaymentTracker />
        <VemetricRagTracker />
        <VemetricPerformanceTracker />
        <VemetricSecurityTracker />
      </body>
    </html>
  );
}
```

### 2. Use Tracking Hooks in Components

```tsx
// Payment tracking example
import { useVemetricPaymentTracking } from '@repo/common/components';

function PaymentFlow() {
  const { trackPaymentInitiated, trackPaymentSuccess } = useVemetricPaymentTracking();

  const handlePayment = async (paymentData) => {
    // Track payment start
    await trackPaymentInitiated({
      tier: 'VT_PLUS',
      amount: VT_PLUS_PRICE, // Use constant from @repo/shared/constants
      currency: 'USD',
      paymentMethod: 'stripe',
    });

    try {
      const result = await processPayment(paymentData);

      // Track success
      await trackPaymentSuccess({
        tier: 'VT_PLUS',
        amount: VT_PLUS_PRICE, // Use constant from @repo/shared/constants
        currency: 'USD',
        paymentMethod: 'stripe',
        processingTime: result.processingTime,
        subscriptionId: result.subscriptionId, // Will be hashed
      });
    } catch (error) {
      // Error tracking handled by performance tracker
    }
  };
}
```

## Critical Operations Examples

### Payment Operations

```tsx
import { useVemetricPaymentTracking } from '@repo/common/components';

function PaymentComponent() {
  const {
    trackPaymentInitiated,
    trackPaymentMethodSelected,
    trackPaymentValidationFailed,
    trackPaymentProcessingError,
    trackPaymentSuccess,
    trackSubscriptionCancellation,
    trackTrialConversion
  } = useVemetricPaymentTracking();

  // Track payment method selection
  const handleMethodSelect = async (method: string) => {
    await trackPaymentMethodSelected({
      paymentMethod: method,
      tier: 'VT_PLUS',
      previousMethod: currentMethod,
    });
  };

  // Track validation errors
  const handleValidationError = async (error: any) => {
    await trackPaymentValidationFailed({
      paymentMethod: 'stripe',
      errorCode: error.code,
      errorType: error.type,
      tier: 'VT_PLUS',
    });
  };

  // Track trial conversion
  const handleTrialConversion = async () => {
    await trackTrialConversion({
      trialLength: 14,
      tier: 'VT_PLUS',
      conversionTime: Date.now() - trialStartTime,
      touchpoints: ['chat', 'web_search', 'file_upload'],
    });
  };
}
```

### RAG & Document Processing

```tsx
import { useVemetricRagTracking } from '@repo/common/components';

function DocumentProcessor() {
  const {
    trackDocumentUpload,
    trackDocumentProcessing,
    trackRagQuery,
    trackContextRetrieval
  } = useVemetricRagTracking();

  // Track document upload
  const handleFileUpload = async (file: File) => {
    await trackDocumentUpload({
      fileName: file.name, // Will be sanitized
      fileSize: file.size,
      fileType: file.type,
      uploadMethod: 'drag_drop',
    });

    const startTime = Date.now();
    try {
      const result = await processDocument(file);

      // Track successful processing
      await trackDocumentProcessing({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        processingTime: Date.now() - startTime,
        pageCount: result.pageCount,
        wordCount: result.wordCount,
        success: true,
      });
    } catch (error) {
      // Track processing failure
      await trackDocumentProcessing({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: error.type,
      });
    }
  };

  // Track RAG queries
  const handleRagQuery = async (query: string) => {
    const startTime = Date.now();

    try {
      const results = await executeRagQuery(query);

      await trackRagQuery({
        queryType: 'semantic',
        queryLength: query.length, // Length only, not content
        documentCount: results.documentCount,
        retrievalTime: Date.now() - startTime,
        contextSize: results.contextSize,
        success: true,
      });
    } catch (error) {
      await trackRagQuery({
        queryType: 'semantic',
        queryLength: query.length,
        documentCount: 0,
        retrievalTime: Date.now() - startTime,
        contextSize: 0,
        success: false,
        errorType: error.type,
      });
    }
  };
}
```

### Performance & Tool Tracking

```tsx
import { useVemetricPerformanceTracking } from '@repo/common/components';

function ToolsComponent() {
  const {
    trackWebSearchExecution,
    trackMathCalculationExecution,
    trackApiResponseTime,
    trackRateLimitExceeded,
    trackFeatureLimitReached
  } = useVemetricPerformanceTracking();

  // Track web search
  const handleWebSearch = async (query: string) => {
    const startTime = Date.now();

    try {
      const results = await webSearch(query);

      await trackWebSearchExecution({
        query, // Only length will be stored
        searchProvider: 'tavily',
        executionTime: Date.now() - startTime,
        resultCount: results.length,
        success: true,
        cached: results.fromCache,
      });
    } catch (error) {
      await trackWebSearchExecution({
        query,
        searchProvider: 'tavily',
        executionTime: Date.now() - startTime,
        resultCount: 0,
        success: false,
        errorType: error.type,
      });
    }
  };

  // Track math calculations
  const handleMathCalculation = async (expression: string) => {
    const startTime = Date.now();

    try {
      const result = await calculateMath(expression);

      await trackMathCalculationExecution({
        calculationType: detectCalculationType(expression),
        complexity: detectComplexity(expression),
        executionTime: Date.now() - startTime,
        inputSize: expression.length,
        success: true,
      });
    } catch (error) {
      await trackMathCalculationExecution({
        calculationType: 'unknown',
        complexity: 'simple',
        executionTime: Date.now() - startTime,
        inputSize: expression.length,
        success: false,
        errorType: error.type,
      });
    }
  };

  // Track API performance
  const trackApiCall = async (url: string, options: RequestInit) => {
    const startTime = Date.now();

    try {
      const response = await fetch(url, options);

      await trackApiResponseTime({
        endpoint: url,
        method: options.method || 'GET',
        responseTime: Date.now() - startTime,
        statusCode: response.status,
        success: response.ok,
        cacheHit: response.headers.get('x-cache') === 'HIT',
      });

      return response;
    } catch (error) {
      await trackApiResponseTime({
        endpoint: url,
        method: options.method || 'GET',
        responseTime: Date.now() - startTime,
        statusCode: 0,
        success: false,
      });
      throw error;
    }
  };
}
```

### Security Tracking

```tsx
import { useVemetricSecurityTracking } from '@repo/common/components';

function SecurityComponent() {
  const {
    trackSuspiciousActivity,
    trackAuthenticationAttempt,
    trackPermissionViolation,
    trackDataAccessAttempt
  } = useVemetricSecurityTracking();

  // Track authentication
  const handleAuth = async (method: string, credentials: any) => {
    const startTime = Date.now();

    try {
      const result = await authenticate(credentials);

      await trackAuthenticationAttempt({
        method,
        success: true,
        timeTaken: Date.now() - startTime,
        userAgent: navigator.userAgent, // Will be sanitized
        ipAddress: await getUserIP(), // Will be hashed
      });
    } catch (error) {
      await trackAuthenticationAttempt({
        method,
        success: false,
        errorCode: error.code,
        timeTaken: Date.now() - startTime,
        userAgent: navigator.userAgent,
        ipAddress: await getUserIP(),
      });
    }
  };

  // Track permission violations
  const handleUnauthorizedAccess = async (resource: string, action: string) => {
    await trackPermissionViolation({
      resource,
      action,
      requiredPermission: 'vt_plus',
      userTier: 'vt_base',
      escalationAttempted: false,
    });
  };

  // Track suspicious behavior
  const handleSuspiciousActivity = async (activity: string) => {
    await trackSuspiciousActivity({
      activityType: activity,
      severity: 'medium',
      blocked: true,
      userAgent: navigator.userAgent,
      ipAddress: await getUserIP(),
    });
  };
}
```

## Event Types Reference

### Payment Events
- `PAYMENT_INITIATED` - Payment process started
- `PAYMENT_METHOD_SELECTED` - Payment method chosen
- `PAYMENT_VALIDATION_FAILED` - Validation errors
- `PAYMENT_PROCESSING_ERROR` - Processing failures
- `SUBSCRIPTION_CREATED` - Successful payment

### Document Events
- `DOCUMENT_UPLOADED` - File upload completed
- `DOCUMENT_PROCESSED` - Processing successful
- `DOCUMENT_PROCESSING_FAILED` - Processing failed
- `RAG_QUERY_EXECUTED` - RAG search performed
- `RAG_CONTEXT_RETRIEVED` - Context extraction

### Performance Events
- `WEB_SEARCH_EXECUTED` - Web search completed
- `WEB_SEARCH_FAILED` - Web search failed
- `MATH_CALCULATION_EXECUTED` - Math calculation
- `CHART_GENERATED` - Chart creation
- `RESPONSE_TIMEOUT` - Request timeouts
- `RATE_LIMIT_EXCEEDED` - Rate limiting
- `QUOTA_EXCEEDED` - Usage limits
- `FEATURE_LIMIT_REACHED` - Feature limits

### Security Events
- `SUSPICIOUS_ACTIVITY` - Unusual behavior
- `SESSION_EXPIRED` - Session timeout
- `PREMIUM_FEATURE_ACCESSED` - Premium feature use

## Best Practices

### 1. Always Track Critical Paths
```tsx
// ✅ Good: Track the entire flow
const processPayment = async (data) => {
  await trackPaymentInitiated(data);
  try {
    const result = await payment.process(data);
    await trackPaymentSuccess(result);
    return result;
  } catch (error) {
    await trackPaymentProcessingError(error);
    throw error;
  }
};

// ❌ Bad: Only track success
const processPayment = async (data) => {
  const result = await payment.process(data);
  await trackPaymentSuccess(result); // Missing error tracking
  return result;
};
```

### 2. Include Performance Metrics
```tsx
// ✅ Good: Track timing and size
const processDocument = async (file) => {
  const timer = createTimer();
  const result = await processFile(file);

  await trackDocumentProcessing({
    fileName: file.name,
    fileSize: file.size,
    processingTime: timer.end(),
    pageCount: result.pages,
    success: true,
  });
};
```

### 3. Sanitize Sensitive Data
```tsx
// ✅ Good: Sanitized filename
await trackDocumentUpload({
  fileName: sanitizeFileName(file.name), // Removes PII
  fileSize: file.size,
  fileType: file.type,
});

// ❌ Bad: Raw filename might contain PII
await trackDocumentUpload({
  fileName: file.name, // Could be "john-doe-medical-records.pdf"
  fileSize: file.size,
});
```

### 4. Use Appropriate Error Handling
```tsx
// ✅ Good: Structured error tracking
try {
  await riskyOperation();
} catch (error) {
  await trackOperationError({
    operation: 'document_processing',
    errorCode: error.code,
    errorType: error.name,
    recoverable: error.recoverable,
  });

  // Don't store error.message (might contain PII)
}
```

## Monitoring & Alerts

The tracking system enables monitoring of:

- **Payment conversion rates** and drop-off points
- **Document processing performance** and error rates
- **Tool usage patterns** and success rates
- **Security incidents** and threat detection
- **Performance bottlenecks** and timeout issues
- **Feature adoption** and usage limits

Use this data to:
- Optimize critical user flows
- Detect and prevent security threats
- Improve system performance
- Guide product development
- Monitor service health

## Privacy Compliance

All tracking follows privacy-first principles:

- **No PII storage** - Personal data is hashed or excluded
- **Minimal data collection** - Only essential metrics
- **User consent** - Respects analytics preferences
- **Data retention** - Follows company retention policies
- **GDPR/CCPA compliance** - Supports data deletion requests

The tracking system is designed to provide valuable insights while maintaining user privacy and security.
