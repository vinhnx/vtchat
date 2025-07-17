# Implementation Plan

- [x]   1. Create centralized API key mapping service
    - Create new file `packages/ai/services/api-key-mapper.ts` with standardized key mapping logic
    - Define consistent mapping between frontend key names and provider key names
    - Add validation functions for each provider's API key format
    - _Requirements: 1.4, 3.1_

- [x]   2. Fix API key transformation in completion route
    - Modify `apps/web/app/api/completion/route.ts` to use centralized key mapping
    - Ensure `apiKeys` are properly transformed before passing to workflow
    - Add logging to track key transformation process without exposing values
    - _Requirements: 1.3, 3.2_

- [x]   3. Update workflow API key handling
    - Modify `packages/ai/workflow/flow.ts` to properly pass transformed keys
    - Update `generateText` function in `packages/ai/workflow/utils.ts` to use consistent key names
    - Ensure `byokKeys` parameter receives correctly mapped keys
    - _Requirements: 1.3, 3.2_

- [x]   4. Enhance provider instance creation with validation
    - Update `getProviderInstance` function in `packages/ai/providers.ts` to use centralized mapping
    - Add comprehensive validation and error handling for missing/invalid keys
    - Improve error messages to be more specific about which provider key is missing
    - _Requirements: 1.5, 3.3_

- [x]   5. Fix OpenRouter API key handling
    - Verify OpenRouter provider configuration in `packages/ai/providers.ts`
    - Ensure `OPENROUTER_API_KEY` is properly mapped and passed to `createOpenRouter`
    - Test OpenRouter provider instance creation with valid API key
    - _Requirements: 2.1, 2.2_

- [x]   6. Add comprehensive logging for debugging
    - Add debug logging in `getLanguageModel` function to track API key presence
    - Add logging in provider instance creation to track success/failure
    - Ensure all logging is security-conscious and never exposes actual key values
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x]   7. Create unit tests for API key mapping
    - Write tests for the new API key mapping service
    - Test key transformation from frontend format to provider format
    - Test validation functions for each provider
    - _Requirements: 1.4, 1.5_

- [x]   8. Create integration tests for provider authentication
    - Write tests that verify end-to-end API key flow from completion route to provider
    - Test with mock API keys for each provider (OpenAI, Anthropic, OpenRouter)
    - Test error handling when API keys are missing or invalid
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x]   9. Verify OpenRouter request authenticity
    - Test OpenRouter models with valid API key to ensure authentic responses
    - Verify that OpenRouter requests are sent to correct endpoints
    - Ensure no dummy or mock responses are returned
    - _Requirements: 2.3, 2.4_

- [ ]   10. Update error handling and user feedback
    - Improve error messages throughout the provider chain
    - Ensure users get clear feedback when API keys are missing or invalid
    - Add specific guidance for obtaining API keys for each provider
    - _Requirements: 1.5, 2.4, 2.5_

- [x]   11. Verify final all of above. make sure every requirements and acceptance criteria is met. Make sure API provider are correctly send.
