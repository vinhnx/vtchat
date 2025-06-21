# Structured Output Testing Documentation

## Overview

This document outlines the testing strategy for the structured output extraction feature implemented for VTChat.

## Testing Challenges

During implementation, we encountered an issue with client-side PDF processing. Initially, we used the `pdf-parse` package, but it's designed for Node.js environments and requires the `fs` module which isn't available in browsers.

**Resolution**: We switched to `pdfjs-dist` (Mozilla PDF.js) which is specifically designed for browser environments and provides excellent PDF text extraction capabilities.

## Test Coverage Plan

### 1. Hook Testing (`useStructuredExtraction`)

**File**: `packages/common/hooks/__tests__/use-structured-extraction.test.ts`

**Coverage**:

- ✅ Initialization with correct default state
- ✅ Model detection (Gemini vs non-Gemini)
- ✅ Document attachment detection
- ✅ PDF file type validation
- ✅ Error handling for extraction failures
- ✅ Successful extraction flow with mocked AI responses
- ✅ Store integration testing

**Note**: Tests require proper mocking of `pdfjs-dist`, `ai` SDK, and store dependencies.

### 2. Component Testing (`StructuredOutputButton`)

**File**: `packages/common/components/chat-input/__tests__/structured-output-button.test.tsx`

**Coverage**:

- ✅ Conditional rendering based on model type, document presence, and file type
- ✅ Click handler functionality
- ✅ Accessibility attributes
- ✅ Visual styling verification

### 3. Component Testing (`StructuredDataDisplay`)

**File**: `packages/common/components/__tests__/structured-data-display.test.tsx`

**Coverage**:

- ✅ Conditional rendering based on structured data presence
- ✅ Data display formatting (JSON pretty print)
- ✅ Download functionality
- ✅ Close/clear functionality
- ✅ Different document type handling
- ✅ Empty data graceful handling

### 4. Integration Testing

**File**: `packages/common/components/chat-input/__tests__/structured-output-integration.test.ts`

**Coverage**:

- ✅ Schema validation with Zod
- ✅ Valid/invalid data handling
- ❌ Component import verification (blocked by pdf-parse issue)

## Schemas Tested

### Resume Schema

```typescript
personalInfo: { name, email, phone, location, linkedin, website }
experience: [{ company, position, startDate, endDate, description }]
education: [{ institution, degree, field, startDate, endDate }]
skills: { technical: [], soft: [], languages: [] }
```

### Invoice Schema

```typescript
invoiceNumber, date, dueDate;
vendor: {
    name, address, email, phone;
}
customer: {
    name, address, email;
}
items: [{ description, quantity, unitPrice, total }];
totals: {
    subtotal, tax, total, currency;
}
```

### Contract Schema

```typescript
title, parties: [], effectiveDate, expirationDate
terms: [], obligations: [], payment: {}, termination: {}
```

### Generic Document Schema

```typescript
title, summary, keyPoints: [], people: [], organizations: []
locations: [], dates: [], amounts: []
```

## Manual Testing Checklist

### User Flow Testing

- [ ] Upload PDF document in Gemini mode
- [ ] Verify structured output button appears
- [ ] Click button and verify extraction progress
- [ ] Verify extracted data display
- [ ] Test download functionality
- [ ] Test close/clear functionality
- [ ] Verify button doesn't appear for non-Gemini models
- [ ] Verify button doesn't appear for non-PDF files

### Error Scenarios

- [ ] Upload corrupted PDF
- [ ] Upload very large PDF
- [ ] Upload empty PDF
- [ ] Test with rate-limited AI model
- [ ] Test with network connectivity issues

### Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast verification
- [ ] Focus management

## Resolved Test Implementation

Due to the browser compatibility requirements, tests are implemented with comprehensive mocking strategies:

1. **Global PDF.js Mock**: Added to `vitest.setup.ts` to provide browser-compatible PDF processing simulation
2. **Component Isolation**: Tests focus on component behavior rather than actual PDF processing
3. **Store Mocking**: Complete isolation of Zustand store dependencies
4. **AI SDK Mocking**: Mocked `generateObject` and related functions

## Test Execution

To run tests:

```bash
# Run schema validation tests
bun test structured-output-integration.test.ts

# Run existing util tests
bun test packages/shared/utils/__tests__/utils.test.ts

# Run component tests (now working with pdfjs-dist)
bun test packages/common/components/chat-input/__tests__/structured-output-button.test.tsx
```

## Future Testing Improvements

1. **E2E Testing**: Set up proper E2E testing with real PDF files in browser environment
2. **Performance Tests**: Validate extraction performance with various document sizes
3. **Integration Tests**: Test with actual Gemini API in staging environment
4. **API Tests**: Test AI SDK integration with actual Gemini models (in staging environment)

## Test Files Created

1. `packages/common/hooks/__tests__/use-structured-extraction.test.ts` - Hook unit tests
2. `packages/common/components/chat-input/__tests__/structured-output-button.test.tsx` - Button component tests
3. `packages/common/components/__tests__/structured-data-display.test.tsx` - Display component tests
4. `packages/common/components/chat-input/__tests__/structured-output-integration.test.ts` - Integration tests

All test files include comprehensive coverage of the documented scenarios above.
