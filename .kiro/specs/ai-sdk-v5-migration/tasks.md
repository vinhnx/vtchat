# AI SDK v4 to v5 Migration Implementation Plan

## Phase 1: Foundation and Core API Migration

-
  1. [x] Apply AI SDK v5 codemods for automated transformations
  - Run `npx @ai-sdk/codemod v5` to apply all v5 codemods
  - Verify codemod results and fix any remaining issues
  - Test TypeScript compilation after codemod application
  - _Requirements: 10.1, 10.2_

- [x] 1.1 Update package dependencies to ensure v5 compatibility
  - Update `@ai-sdk/openai` to v2.0+ in `apps/web/package.json`
  - Add `@ai-sdk/react` package for React hooks
  - Add `@ai-sdk/rsc` package for RSC utilities if needed
  - Update `zod` to v3.25.0+ for v5 compatibility
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 1.2 Migrate core AI utilities in workflow utils
  - Update `packages/ai/workflow/utils.ts` to use `maxOutputTokens` instead of `maxTokens`
  - Replace `CoreMessage` with `ModelMessage` imports and usage
  - Update `convertToCoreMessages` to `convertToModelMessages`
  - Replace `providerMetadata` with `providerOptions` for input parameters
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [ ] 1.3 Update tool definitions throughout the codebase
  - Replace `parameters` with `inputSchema` in all tool definitions in `packages/ai/tools/`
  - Update tool property access from `args/result` to `input/output`
  - Replace `experimental_toToolResultContent` with `toModelOutput`
  - Add proper type narrowing for dynamic tools
  - _Requirements: 1.4, 1.5, 3.1, 3.2_

- [ ] 1.4 Update media type handling across the application
  - Replace `mimeType` with `mediaType` in all file handling code
  - Update file part structures to use v5 patterns
  - Test file upload and processing functionality
  - _Requirements: 1.7_

## Phase 2: Streaming Architecture Migration

-
  2. [ ] Update streaming patterns to use v5 architecture
  - Modify `generateTextWithGeminiSearch` in `packages/ai/workflow/utils.ts` to handle start/delta/end patterns
  - Update stream chunk processing to use unique IDs
  - Replace single `text` chunks with `text-start`, `text-delta`, `text-end` pattern
  - Update reasoning streaming to use `reasoning-start`, `reasoning-delta`, `reasoning-end`
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.1 Implement tool input streaming support
  - Add handling for `tool-input-start`, `tool-input-delta`, `tool-input-end` events
  - Update tool call processing to handle streaming inputs
  - Test tool streaming functionality with complex inputs
  - _Requirements: 2.4_

- [ ] 2.2 Update finish event handling
  - Replace `step-finish` with `finish-step` in stream processing
  - Update usage data access to use `totalUsage` for aggregate and `usage` for step-specific
  - Update finish event callbacks throughout the workflow system
  - _Requirements: 2.5, 2.6_

- [ ] 2.3 Migrate streaming response handlers
  - Update API routes to use `toUIMessageStreamResponse` instead of `toDataStreamResponse`
  - Replace `getErrorMessage` with `onError` in streaming responses
  - Update stream protocol to use Server-Sent Events
  - Test streaming API endpoints with new response format
  - _Requirements: 6.1, 6.2_

## Phase 3: Tool System Modernization

-
  3. [ ] Update tool system to use v5 patterns
  - Migrate all tool definitions in `packages/ai/tools/` to use `inputSchema`
  - Update tool result handling to use `toModelOutput` pattern
  - Implement proper error handling for tool execution failures
  - _Requirements: 3.1, 3.2_

- [ ] 3.1 Implement dynamic tool support
  - Add support for tools with unknown types at development time
  - Implement proper type narrowing with `dynamic` flag checking
  - Update tool call iteration to handle both static and dynamic tools
  - Test MCP tools without schemas
  - _Requirements: 3.3_

- [ ] 3.2 Update tool streaming states
  - Replace generic tool states with granular states (`input-streaming`, `input-available`, `output-available`, `output-error`)
  - Update UI components to handle new tool states
  - Test tool execution with streaming inputs and error scenarios
  - _Requirements: 3.4_

- [ ] 3.3 Migrate tool part types in UI
  - Update UI message parts to use typed naming (`tool-${toolName}`) instead of generic types
  - Update React components to handle specific tool part types
  - Test tool result rendering in UI components
  - _Requirements: 3.5_

## Phase 4: Message and Type System Migration

-
  4. [ ] Migrate message system to v5 patterns
  - Replace `Message` type with `UIMessage` throughout the application
  - Update message content from string to parts array structure
  - Migrate reasoning handling to use parts with `text` property
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 4.1 Update file part handling
  - Replace `.data` and `.mimeType` with `.url` and `.mediaType` in file parts
  - Update file rendering components to use new structure
  - Test file upload and display functionality
  - _Requirements: 4.3_

- [ ] 4.2 Migrate message ID generation
  - Move `experimental_generateMessageId` from `streamText` to `toUIMessageStreamResponse`
  - Update message persistence to use v5 patterns
  - Test message ID generation and persistence
  - _Requirements: 4.5_

- [ ] 4.3 Update message persistence patterns
  - Replace helper functions like `appendResponseMessages` with v5 `toUIMessageStreamResponse`
  - Update database message storage to handle UIMessage format
  - Implement proper message history handling with parts arrays
  - Test message persistence and retrieval
  - _Requirements: 4.1, 4.2_

## Phase 5: Provider Configuration Updates

-
  5. [ ] Update provider configurations to v5 standards
  - Remove `compatibility` option from OpenAI provider (now default strict)
  - Enable structured outputs by default for supported OpenAI models
  - Update Google provider to use provider-defined tools instead of `useSearchGrounding`
  - _Requirements: 5.1, 5.2_

- [ ] 5.1 Update provider options formatting
  - Convert all provider options from snake_case to camelCase
  - Update Anthropic reasoning configuration to use v5 patterns
  - Test all provider configurations with new format
  - _Requirements: 5.4_

- [ ] 5.2 Remove deprecated provider features
  - Remove `useLegacyFunctionCalls` option from OpenAI models
  - Remove `simulateStreaming` option (replace with middleware if needed)
  - Update temperature handling to be explicit instead of relying on defaults
  - _Requirements: 5.5_

- [ ] 5.3 Update Google search grounding implementation
  - Replace `useSearchGrounding` with Google provider-defined search tool
  - Update search result handling to use new tool pattern
  - Test web search functionality with new provider tool
  - _Requirements: 5.2_

## Phase 6: Error Handling and Response Updates

-
  6. [ ] Modernize error handling patterns
  - Update streaming error handling to use `onError` instead of `getErrorMessage`
  - Implement proper error sanitization to prevent information leakage
  - Update provider response access from `rawResponse` to `response`
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6.1 Implement step control migration
  - Replace `maxSteps` with `stopWhen` conditions in multi-step operations
  - Implement proper step control logic with condition checking
  - Test multi-step workflows with new control patterns
  - _Requirements: 6.4_

- [ ] 6.2 Update ID generation patterns
  - Update `createIdGenerator` calls to include required `size` argument
  - Test ID generation consistency across the application
  - _Requirements: 6.5_

## Phase 7: Reasoning System Enhancement

-
  7. [ ] Update reasoning system to use v5 patterns
  - Replace `reasoning` with `reasoningText` for multi-step generations
  - Update reasoning details property names in generateText results
  - Configure provider-specific reasoning settings
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7.1 Update reasoning part handling
  - Replace `reasoning` property with `text` property in reasoning parts
  - Update reasoning streaming to handle start/delta/end patterns
  - Test thinking mode functionality with new patterns
  - _Requirements: 7.4, 7.5_

## Phase 8: Workflow Integration Updates

-
  8. [ ] Update workflow system to use v5 patterns
  - Modify workflow tasks in `packages/ai/workflow/tasks/` to use v5 generateText patterns
  - Update workflow streaming to handle v5 streaming patterns
  - Update workflow error handling to use v5 error patterns
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8.1 Update workflow tool management
  - Migrate workflow tools to use v5 tool definitions and handling
  - Update tool result processing in workflow context
  - Test complete workflow execution with v5 patterns
  - _Requirements: 8.4_

- [ ] 8.2 Update workflow reasoning integration
  - Migrate workflow reasoning processing to use v5 reasoning patterns
  - Update reasoning display and handling in workflow UI
  - Test reasoning mode in workflow execution
  - _Requirements: 8.5_

## Phase 9: Package Structure Alignment

-
  9. [ ] Align imports with v5 package structure
  - Update React hook imports to use `@ai-sdk/react` instead of `ai/react`
  - Update RSC utility imports to use `@ai-sdk/rsc` instead of `ai/rsc`
  - Update provider type imports to use `@ai-sdk/provider` for `LanguageModelV2`
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9.1 Update UI utility imports
  - Move UI utility imports from `@ai-sdk/ui-utils` to `ai` package
  - Update adapter imports to use separate packages for LangChain and LlamaIndex
  - Test all import changes and resolve any missing dependencies
  - _Requirements: 9.4, 9.5_

## Phase 10: Testing and Validation

-
  10. [ ] Comprehensive testing of migrated functionality
  - Run all existing test suites to ensure no regressions
  - Add specific tests for v5 patterns and functionality
  - Perform end-to-end testing of all AI features
  - _Requirements: 10.3, 10.4_

- [ ] 10.1 Performance testing and optimization
  - Benchmark streaming performance with v5 patterns
  - Test memory usage with new message structures
  - Optimize any performance regressions found
  - _Requirements: 10.3_

- [ ] 10.2 TypeScript compilation validation
  - Ensure all TypeScript compilation succeeds without errors
  - Fix any type issues introduced by migration
  - Update type definitions as needed for v5 patterns
  - _Requirements: 10.4_

- [ ] 10.3 Integration testing
  - Test all AI provider integrations with v5 configurations
  - Test workflow system end-to-end with v5 patterns
  - Test UI components with new message and streaming patterns
  - _Requirements: 10.5_

## Phase 11: Documentation and Cleanup

-
  11. [ ] Update documentation and clean up deprecated code
  - Remove all v4 patterns and deprecated code
  - Update code comments and documentation to reflect v5 patterns
  - Update README and setup instructions if needed
  - Create migration notes for future reference

- [ ] 11.1 Final validation and deployment preparation
  - Perform final comprehensive testing
  - Validate all requirements have been met
  - Prepare deployment plan for production rollout
  - Create rollback plan in case of issues
