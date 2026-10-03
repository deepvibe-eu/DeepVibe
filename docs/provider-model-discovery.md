# Provider Model Discovery Specification

## Overview
Allows users to discover available models from OpenAI-compatible endpoints (e.g., Ollama) by fetching the model list from the provider's `/models` endpoint, instead of manually typing model IDs.

## Product Rule
- Users editing an OpenAI-compatible provider can click "Load models" to fetch available model IDs from the provider's API endpoint
- The fetched models are presented in a select/datalist for easy selection
- The selected model ID populates the model ID field

## Status Owner
- **App Layer**: CLI bootstrap handles provider discovery via RPC
- **Service Layer**: Provider facade services expose listModels capability
- **UI Layer**: Model provider settings UI provides the discovery workflow

## Interface

### RPC Protocol
- **Method**: `providerListModels`
- **Params Schema**:
  ```typescript
  {
    workspace: ZCodeWorkspaceRef,
    providerId: string
  }
  ```
- **Result Schema**:
  ```typescript
  {
    models: readonly { id: string; displayName?: string }[]
  }
  ```

### HTTP Request
- **Endpoint**: GET `{provider.config.api.baseUrl}/models`
- **Auth**: 
  - Send `Authorization: Bearer <apiKey>` when `provider.config.access.type` is an api-key type and a key exists
  - No auth header when access type is `"none"` (local, no key)
- **Response Parsing** (tolerate multiple formats):
  - `{ data: [{ id, ... }] }` - OpenAI format
  - `{ models: [...] }` - Ollama format  
  - `{ models: [{ name|model }] }` - Alternative format

### Error Handling
- Throw clear error on non-2xx response with status + short body
- Sort and deduplicate model IDs

## Acceptance Scenarios

1. **Ollama with no auth** - User has a local Ollama instance with `access.type: "none"`, clicks "Load models", receives model list without Authorization header
2. **OpenAI-compatible with API key** - User has a custom provider with `access.type: "api-key"`, clicks "Load models", receives model list with Bearer token
3. **Invalid endpoint** - User clicks "Load models" on a non-existent endpoint, receives clear error message
4. **Empty model list** - Provider returns empty list, UI shows empty state
5. **Duplicate models** - Provider returns duplicates, UI shows unique models only

## Implementation Path

### Protocol Layer (packages/shared)
- Add `zcodeProviderListModelsParamsSchema` and `zcodeProviderListModelsResultSchema`
- Add `providerListModels` method key

### CLI Dispatch (apps/zcode-cli/bootstrap)
- Add case in server.ts
- Add handler in workspace-model-runtime.ts
- Add method in app/types.ts and session-facade.ts

### Model Adapter (apps/zcode-cli/adapters)
- Add `listModels` method in model-execution.ts
- Perform HTTP GET with appropriate auth headers

### Service Layer (packages/services)
- Add `listModels` in IProviderSettingsService and implementation
- Wire in node.ts
- Add in IZCodeAgentService interface and zcodeAgentService.ts

### UI Layer (packages/ui)
- Add `listModels` hook in useModelProviders.ts
- Add "Load models" affordance in ProviderCardSections.tsx
- Add i18n keys (en-US, de-DE)
