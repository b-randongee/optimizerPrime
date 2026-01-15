# API Reference Documentation

> **Purpose**: Store official API documentation fetched BEFORE implementing any integration.

## Why This Exists

This directory enforces the **fetch-first** workflow:
1. User asks you to integrate with external API
2. **FIRST ACTION**: WebFetch official docs and store here
3. Extract key information (methods, models, parameters)
4. THEN write code based on actual documentation
5. Write integration tests against REAL API

**Never implement an API integration without documentation in this directory first.**

## Directory Structure

```
api-refs/
├── README.md                    # This file
├── [service-name].md            # Official docs for each service
└── [service-name]-contract.json # OpenAPI/JSON Schema if available
```

## Documentation Template

Each API reference file should contain:

```markdown
# [Service Name] API Documentation

**Fetched**: [Date]
**Source**: [Official docs URL]
**Last Verified**: [Date]

## Authentication

[How to authenticate - exact format]

## Base URL

[Exact base URL]

## Key Methods

### [Method Name]
- **Exact function/method**: `client.method.name()`
- **Parameters**:
  - `param1` (type): Description
  - `param2` (type, optional): Description
- **Returns**: [Type and structure]
- **Example**:
  ```[language]
  [Exact code from official docs]
  ```

## Model Names / Identifiers

- Exact strings used in API calls
- Version-specific identifiers
- Deprecated vs current names

## Rate Limits

[Limits and retry behavior]

## Error Codes

[Common errors and meanings]

## Notes / Gotchas

[Anything tricky or non-obvious]
```

## Workflow

### When Integrating New API

1. **WebFetch official documentation**
   ```
   WebFetch: https://docs.[service].com/api-reference
   Prompt: "Extract complete API reference including methods, parameters, authentication, and examples"
   ```

2. **Store in this directory**
   - Filename: `[service-name].md`
   - Include source URL and fetch date
   - Extract ALL key information

3. **If OpenAPI/JSON Schema available**
   - Download or fetch schema
   - Store as `[service-name]-contract.json` or `.yaml`
   - Use for type generation if applicable

4. **Create integration test**
   - Write test that calls REAL API
   - Validate actual behavior matches docs
   - Store in project's test directory

5. **Then implement**
   - Use exact method names from docs
   - Use exact model/identifier strings from docs
   - Reference stored docs in code comments

### Preflight Checklist

Before running code that uses external APIs, verify:

- [ ] API documentation stored in `docs/api-refs/[service].md`
- [ ] Exact method names verified
- [ ] Exact model names/identifiers verified
- [ ] Authentication format verified
- [ ] Integration test written against REAL API
- [ ] Integration test passes

## Examples

### Good Documentation

See examples below for properly documented APIs.

### Common Mistakes to Avoid

❌ **Don't do this**:
- Guessing method names: `client.generate()` when docs say `client.create()`
- Guessing model names: `gpt-4` when docs require `gpt-4-turbo-preview`
- Using generic strings: `claude-3-sonnet` when docs specify `claude-3-5-sonnet-20241022`
- Implementing from memory without checking docs
- Writing only mocked tests without testing against real API

✅ **Do this**:
- Fetch official docs first
- Extract exact strings from documentation
- Copy/paste method names to ensure accuracy
- Write integration tests that call real API
- Reference stored docs when implementing

## Maintenance

- Update docs when API versions change
- Mark deprecated methods/models
- Track when docs were last verified
- Re-fetch docs when integration behavior changes unexpectedly
