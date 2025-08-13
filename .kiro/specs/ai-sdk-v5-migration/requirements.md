# AI SDK v4 to v5 Migration Requirements

## Introduction

This document outlines the requirements for migrating VTChat from AI SDK v4 patterns to full AI SDK v5 compliance. While the project is already using AI SDK v5.0.11, there are numerous v4 patterns, deprecated APIs, and legacy code structures that need to be updated to leverage v5's new capabilities and ensure future compatibility.

## Requirements

### Requirement 1: Core API Migration

**User Story:** As a developer, I want to use AI SDK v5's updated core APIs so that the codebase follows current best practices and avoids deprecated patterns.

#### Acceptance Criteria

1. WHEN using generateText or streamText THEN the system SHALL use `maxOutputTokens` instead of `maxTokens`
2. WHEN working with messages THEN the system SHALL use `ModelMessage` instead of `CoreMessage`
3. WHEN converting messages THEN the system SHALL use `convertToModelMessages` instead of `convertToCoreMessages`
4. WHEN handling tool definitions THEN the system SHALL use `inputSchema` instead of `parameters`
5. WHEN accessing tool properties THEN the system SHALL use `input/output` instead of `args/result`
6. WHEN using provider metadata THEN the system SHALL use `providerOptions` instead of `providerMetadata` for inputs
7. WHEN handling media types THEN the system SHALL use `mediaType` instead of `mimeType`

### Requirement 2: Streaming Architecture Update

**User Story:** As a developer, I want to use AI SDK v5's new streaming architecture so that the application can handle concurrent streaming and improved real-time UX.

#### Acceptance Criteria

1. WHEN processing stream chunks THEN the system SHALL handle start/delta/end patterns with unique IDs
2. WHEN streaming text THEN the system SHALL use `text-start`, `text-delta`, `text-end` instead of single `text` chunks
3. WHEN streaming reasoning THEN the system SHALL use `reasoning-start`, `reasoning-delta`, `reasoning-end` patterns
4. WHEN streaming tool inputs THEN the system SHALL handle `tool-input-start`, `tool-input-delta`, `tool-input-end` events
5. WHEN handling finish events THEN the system SHALL use `finish-step` instead of `step-finish`
6. WHEN accessing usage data THEN the system SHALL use `totalUsage` for aggregate data and `usage` for step-specific data

### Requirement 3: Tool System Modernization

**User Story:** As a developer, I want to use AI SDK v5's enhanced tool system so that tool handling is more robust and type-safe.

#### Acceptance Criteria

1. WHEN defining tools THEN the system SHALL use `inputSchema` instead of `parameters`
2. WHEN handling tool results THEN the system SHALL use `toModelOutput` instead of `experimental_toToolResultContent`
3. WHEN processing tool calls THEN the system SHALL handle dynamic tools with proper type narrowing
4. WHEN streaming tool calls THEN the system SHALL handle the new granular states (`input-streaming`, `input-available`, `output-available`, `output-error`)
5. WHEN working with tool parts THEN the system SHALL use typed naming (`tool-${toolName}`) instead of generic types

### Requirement 4: Message and Type System Update

**User Story:** As a developer, I want to use AI SDK v5's updated message and type system so that message handling is consistent and future-proof.

#### Acceptance Criteria

1. WHEN working with UI messages THEN the system SHALL use `UIMessage` instead of `Message`
2. WHEN handling message content THEN the system SHALL use `parts` array instead of `content` string
3. WHEN processing file parts THEN the system SHALL use `.url` and `.mediaType` instead of `.data` and `.mimeType`
4. WHEN handling reasoning THEN the system SHALL use reasoning parts with `text` property instead of `reasoning` property
5. WHEN working with message IDs THEN the system SHALL use `generateMessageId` in `toUIMessageStreamResponse` instead of `experimental_generateMessageId` in `streamText`

### Requirement 5: Provider Configuration Updates

**User Story:** As a developer, I want to use AI SDK v5's updated provider configurations so that all AI providers work correctly with the latest features.

#### Acceptance Criteria

1. WHEN using OpenAI models THEN the system SHALL use structured outputs by default without explicit configuration
2. WHEN using Google models THEN the system SHALL use provider-defined tools for search grounding instead of `useSearchGrounding`
3. WHEN using Anthropic models THEN the system SHALL use updated reasoning configuration
4. WHEN configuring providers THEN the system SHALL use camelCase for provider options instead of snake_case
5. WHEN handling temperature THEN the system SHALL explicitly set temperature values instead of relying on defaults

### Requirement 6: Error Handling and Response Updates

**User Story:** As a developer, I want to use AI SDK v5's improved error handling so that errors are properly caught and user-friendly messages are displayed.

#### Acceptance Criteria

1. WHEN handling stream responses THEN the system SHALL use `toUIMessageStreamResponse` instead of `toDataStreamResponse`
2. WHEN processing errors THEN the system SHALL use `onError` instead of `getErrorMessage`
3. WHEN accessing provider responses THEN the system SHALL use `response` instead of `rawResponse`
4. WHEN handling step control THEN the system SHALL use `stopWhen` conditions instead of `maxSteps`
5. WHEN working with ID generation THEN the system SHALL provide `size` argument to `createIdGenerator`

### Requirement 7: Reasoning System Enhancement

**User Story:** As a developer, I want to use AI SDK v5's enhanced reasoning capabilities so that thinking mode and reasoning features work optimally.

#### Acceptance Criteria

1. WHEN accessing reasoning text THEN the system SHALL use `reasoningText` instead of `reasoning` for multi-step generations
2. WHEN handling reasoning details THEN the system SHALL use updated property names in generateText results
3. WHEN configuring reasoning THEN the system SHALL use provider-specific reasoning configurations
4. WHEN processing reasoning parts THEN the system SHALL use `text` property instead of `reasoning` property
5. WHEN streaming reasoning THEN the system SHALL handle start/delta/end patterns properly

### Requirement 8: Workflow Integration Updates

**User Story:** As a developer, I want the workflow system to use AI SDK v5 patterns so that all AI operations are consistent and maintainable.

#### Acceptance Criteria

1. WHEN the workflow calls generateText THEN it SHALL use v5 parameter names and patterns
2. WHEN processing workflow streams THEN it SHALL handle v5 streaming patterns
3. WHEN handling workflow errors THEN it SHALL use v5 error handling patterns
4. WHEN managing workflow tools THEN it SHALL use v5 tool definitions and handling
5. WHEN processing workflow reasoning THEN it SHALL use v5 reasoning patterns

### Requirement 9: Package Structure Alignment

**User Story:** As a developer, I want to use the correct AI SDK v5 package imports so that the application uses the intended package structure.

#### Acceptance Criteria

1. WHEN importing React hooks THEN the system SHALL use `@ai-sdk/react` instead of `ai/react`
2. WHEN importing RSC utilities THEN the system SHALL use `@ai-sdk/rsc` instead of `ai/rsc`
3. WHEN importing provider types THEN the system SHALL use `@ai-sdk/provider` for `LanguageModelV2`
4. WHEN importing UI utilities THEN the system SHALL use `ai` package instead of `@ai-sdk/ui-utils`
5. WHEN using adapters THEN the system SHALL use separate packages for LangChain and LlamaIndex

### Requirement 10: Codemod Application and Validation

**User Story:** As a developer, I want to apply AI SDK v5 codemods and validate the migration so that all patterns are correctly updated.

#### Acceptance Criteria

1. WHEN running codemods THEN the system SHALL apply all relevant v5 transformations
2. WHEN validating migration THEN the system SHALL ensure no v4 patterns remain
3. WHEN testing functionality THEN the system SHALL verify all AI features work correctly
4. WHEN checking types THEN the system SHALL ensure TypeScript compilation succeeds
5. WHEN running tests THEN the system SHALL pass all existing test suites
