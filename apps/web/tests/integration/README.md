# Provider Authentication Integration Tests

This directory contains integration tests for the provider authentication system, specifically testing the end-to-end API key flow from the completion route to the AI providers.

## Test Coverage

### API Key Transformation Tests

- **Frontend to Provider Mapping**: Tests that API keys are correctly transformed from frontend format to provider format using the centralized mapper
- **Empty Key Handling**: Verifies that empty or whitespace-only keys are filtered out during transformation
- **No Keys Scenario**: Tests behavior when no API keys are provided

### Provider-Specific Authentication Tests

- **Format Validation**: Tests API key format validation for all supported providers:
    - OpenAI: `sk-[alphanumeric]{20+}`
    - Anthropic: `sk-ant-[alphanumeric_-]{95+}`
    - OpenRouter: `sk-or-v1-[hex]{64}`
    - Gemini: `[alphanumeric_-]{39}`
    - Together: `[hex]{64}`
    - Fireworks: `[alphanumeric]{32+}`
    - XAI: `xai-[alphanumeric]{32+}`
- **Invalid Format Rejection**: Tests that invalid API key formats are properly rejected with meaningful error messages

### Provider Key Mapping Tests

- **Correct Mapping**: Verifies that frontend key names are correctly mapped to provider-expected names
- **Empty Key Filtering**: Tests that empty keys are filtered out during mapping
- **Provider Key Name Resolution**: Tests that correct key names are returned for each provider
- **Unknown Provider Handling**: Tests error handling for unknown providers

### Provider Key Validation Tests

- **Presence and Format**: Tests validation of both API key presence and format
- **Missing Key Detection**: Tests detection of missing API keys with appropriate error messages
- **Invalid Format Detection**: Tests detection of invalid API key formats

### Available Providers Detection Tests

- **Valid Key Detection**: Tests that providers with valid API keys are correctly identified
- **Invalid Key Exclusion**: Tests that providers with invalid keys are excluded
- **Empty Object Handling**: Tests behavior with empty API keys object
- **Mixed Validity**: Tests handling of mixed valid and invalid keys

### API Key Format Validation Tests

- **All Provider Support**: Tests validation for all supported provider key formats
- **Invalid Format Rejection**: Tests rejection of all invalid provider key formats
- **Whitespace Handling**: Tests that whitespace in API keys is properly trimmed

### Error Handling Tests

- **Missing Key Messages**: Tests meaningful error messages for missing API keys
- **Invalid Format Messages**: Tests meaningful error messages for invalid formats
- **Empty String Handling**: Tests handling of empty string API keys

### Integration with Provider System Tests

- **Provider Support**: Tests that all defined providers are supported
- **Consistency**: Tests consistency between provider enum and key mapping
- **Validation Consistency**: Tests that validation methods give consistent results

### Performance and Edge Cases Tests

- **Large Scale**: Tests handling of large numbers of API keys efficiently
- **Special Characters**: Tests handling of special characters in API keys
- **Unicode Characters**: Tests graceful handling of unicode characters

## Requirements Coverage

The tests cover all requirements specified in the task:

### Requirement 1.1 & 1.2 (OpenAI/Anthropic API Key Flow)

- ✅ Tests API key transformation from frontend to provider format
- ✅ Tests validation of OpenAI and Anthropic API key formats
- ✅ Tests error handling for missing/invalid keys

### Requirement 2.1 & 2.2 (OpenRouter Authentication)

- ✅ Tests OpenRouter API key format validation
- ✅ Tests OpenRouter key mapping and transformation
- ✅ Tests error handling for invalid OpenRouter keys

## Test Structure

### Mock Data

The tests use realistic mock API keys that match the expected patterns for each provider:

- Valid keys that pass format validation
- Invalid keys that fail format validation
- Empty keys for testing edge cases

### Test Organization

Tests are organized into logical groups:

1. **API Key Transformation** - Core transformation logic
2. **Provider-Specific Authentication** - Individual provider validation
3. **Provider Key Mapping** - Key name mapping logic
4. **Provider Key Validation** - Combined presence and format validation
5. **Available Providers Detection** - Provider availability logic
6. **API Key Format Validation** - Format validation across all providers
7. **Error Handling** - Error scenarios and messages
8. **Integration with Provider System** - System-wide consistency
9. **Performance and Edge Cases** - Performance and edge case handling

### Mocking Strategy

The tests mock external dependencies to focus on the core authentication logic:

- Logger is mocked to prevent console output during tests
- No external API calls are made
- Tests focus on the transformation and validation logic

## Running the Tests

```bash
# Run all integration tests
npm run test -- apps/web/tests/integration/provider-authentication.test.ts --run

# Run with coverage
npm run test -- apps/web/tests/integration/provider-authentication.test.ts --coverage --run

# Run in watch mode (for development)
npm run test -- apps/web/tests/integration/provider-authentication.test.ts
```

## Test Results

All 33 tests pass, covering:

- ✅ API key transformation and mapping
- ✅ Provider-specific authentication validation
- ✅ Error handling for missing and invalid keys
- ✅ Integration with the provider system
- ✅ Performance and edge case scenarios

The tests verify that the API key authentication system works correctly end-to-end, ensuring that API keys are properly transformed, validated, and passed through the system to the appropriate providers.
