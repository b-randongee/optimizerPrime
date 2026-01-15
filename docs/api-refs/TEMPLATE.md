# [Service Name] API Documentation

**Fetched**: [YYYY-MM-DD]
**Source**: [Official documentation URL]
**Last Verified**: [YYYY-MM-DD]
**Version**: [API version if applicable]

---

## Authentication

**Method**: [API key / OAuth2 / Bearer token / etc.]

**Format**:
```
[Exact authentication header format]
Example: Authorization: Bearer sk-xxxxx
```

**Obtaining credentials**: [Where to get API keys]

---

## Base URL

```
[Exact base URL]
```

**Environments**:
- Production: [URL]
- Staging: [URL] (if applicable)
- Sandbox: [URL] (if applicable)

---

## Key Methods / Endpoints

### [Method/Endpoint Name 1]

**Exact function call**: `client.module.method_name()`
**HTTP Method**: [GET/POST/PUT/DELETE]
**Endpoint**: `/path/to/endpoint`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `param1` | string | Yes | Description of parameter |
| `param2` | integer | No | Description with default value |

**Request Example** (from official docs):
```[language]
[Exact code example from official documentation]
```

**Response Format**:
```json
{
  "field1": "type and description",
  "field2": "type and description"
}
```

**Response Example** (from official docs):
```json
[Actual response example from official docs]
```

### [Method/Endpoint Name 2]

[Repeat structure above]

---

## Model Names / Identifiers

**Available models** (exact strings to use in API calls):
- `model-name-v1-exact-string` - Description
- `model-name-v2-exact-string` - Description

**⚠️ Critical**: Use EXACT strings as documented. Even minor differences will fail:
- ✅ Correct: `claude-3-5-sonnet-20241022`
- ❌ Wrong: `claude-3.5-sonnet` or `claude-sonnet-3.5`

**Deprecated models**:
- `old-model-name` - Deprecated as of [date], use `new-model-name` instead

---

## Rate Limits

**Limits**:
- Requests per minute: [number]
- Requests per day: [number]
- Tokens per minute: [number] (if applicable)

**Rate limit headers**:
```
X-RateLimit-Limit: [header name and meaning]
X-RateLimit-Remaining: [header name and meaning]
```

**Retry behavior**:
- 429 status code → [retry after N seconds]
- Exponential backoff recommended: [formula]

---

## Error Codes

| Status Code | Error Type | Meaning | Solution |
|-------------|------------|---------|----------|
| 400 | Bad Request | [Description] | [How to fix] |
| 401 | Unauthorized | [Description] | [How to fix] |
| 404 | Not Found | [Description] | [How to fix] |
| 429 | Rate Limited | [Description] | [How to fix] |
| 500 | Server Error | [Description] | [How to fix] |

**Error response format**:
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable message"
  }
}
```

---

## Request/Response Examples

### Complete Working Example

```[language]
[Full working code example from official docs that can be copy-pasted]
```

### Common Use Cases

**Use case 1**: [Description]
```[language]
[Code example]
```

**Use case 2**: [Description]
```[language]
[Code example]
```

---

## Notes / Gotchas

- [Important thing #1 that's not obvious from method names]
- [Gotcha #2 that could cause issues]
- [Quirk #3 about API behavior]

**Common mistakes**:
- ❌ [Common mistake]: [Why it fails]
- ✅ [Correct approach]: [Why it works]

---

## SDK Information

**Official SDKs**:
- Python: `pip install [package-name]` - [Docs URL]
- Node.js: `npm install [package-name]` - [Docs URL]
- [Other languages]

**SDK vs REST API differences**:
- [Any important differences in how SDK wraps the API]

---

## Testing Considerations

**Sandbox/Test Environment**:
- Available: [Yes/No]
- Test API keys: [How to obtain]
- Differences from production: [Any behavioral differences]

**Integration Test Checklist**:
- [ ] Test with real API credentials (not mocked)
- [ ] Test authentication
- [ ] Test basic method call
- [ ] Test error handling (invalid input)
- [ ] Test rate limiting behavior
- [ ] Verify response format matches documentation

---

## Additional Resources

- Official documentation: [URL]
- API reference: [URL]
- Code examples: [URL]
- Community/Support: [URL]
- Status page: [URL]

---

## Change Log

| Date | Change | Notes |
|------|--------|-------|
| [YYYY-MM-DD] | Initial documentation | Fetched from official source |
| [YYYY-MM-DD] | Updated model names | Added new models |
