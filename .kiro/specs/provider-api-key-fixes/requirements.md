# Requirements Document

## Introduction

This feature addresses critical issues with AI provider integrations where API keys are not being properly transmitted, causing model responses to fail. The system currently has two main problems: OpenAI/Anthropic providers are not receiving the "apiKeys" field properly, resulting in no model response, and OpenRouter is sending dummy api/completion requests instead of proper API calls.

## Requirements

### Requirement 1

**User Story:** As a user with BYOK (Bring Your Own Key) API credentials, I want OpenAI and Anthropic providers to receive my API keys correctly, so that I can get proper model responses instead of failures.

#### Acceptance Criteria

1. WHEN a user provides OpenAI API key in the apiKeys field THEN the OpenAI provider SHALL receive and use the correct API key for authentication
2. WHEN a user provides Anthropic API key in the apiKeys field THEN the Anthropic provider SHALL receive and use the correct API key for authentication
3. WHEN apiKeys are passed from the completion route THEN they SHALL be properly transformed and passed to getLanguageModel as byokKeys
4. WHEN getLanguageModel receives byokKeys THEN it SHALL correctly map the key names to the expected provider key format
5. WHEN API key mapping fails THEN the system SHALL provide clear error messages indicating which provider key is missing

### Requirement 2

**User Story:** As a user trying to use OpenRouter models, I want the system to send proper API requests to OpenRouter, so that I receive actual model responses instead of dummy completion data.

#### Acceptance Criteria

1. WHEN a user selects an OpenRouter model THEN the system SHALL send authentic API requests to OpenRouter's completion endpoint
2. WHEN OpenRouter API key is provided THEN it SHALL be properly formatted and included in the request headers
3. WHEN OpenRouter responds THEN the system SHALL process and return the actual model response content
4. WHEN OpenRouter requests fail THEN the system SHALL provide meaningful error messages instead of dummy responses
5. IF OpenRouter is unavailable THEN the system SHALL return proper error status codes rather than fake completion data

### Requirement 3

**User Story:** As a developer debugging provider issues, I want comprehensive logging of API key handling, so that I can identify where the key transmission is failing.

#### Acceptance Criteria

1. WHEN apiKeys are received in the completion route THEN the system SHALL log the presence and key names (without values) for debugging
2. WHEN byokKeys are passed to getLanguageModel THEN the system SHALL log the transformation and mapping process
3. WHEN provider instances are created THEN the system SHALL log whether API keys were successfully received
4. WHEN API key validation fails THEN the system SHALL log the specific validation failure reason
5. WHEN debugging is enabled THEN the system SHALL provide detailed logs without exposing actual API key values
