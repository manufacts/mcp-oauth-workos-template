# MCP OAuth — WorkOS AuthKit

<p>
  <a href="https://github.com/mcp-use/mcp-use">Built with <b>mcp-use</b></a>
  &nbsp;
  <a href="https://github.com/mcp-use/mcp-use">
    <img src="https://img.shields.io/github/stars/mcp-use/mcp-use?style=social" alt="mcp-use stars">
  </a>
</p>

A production-ready MCP server template authenticating users via **WorkOS AuthKit**. Implements bearer token authentication with Dynamic Client Registration for zero-config MCP client integration. Supports organizations out of the box.

## Features

- **OAuth 2.0 with Dynamic Client Registration** — MCP clients self-register, no pre-config required
- **JWT verification** — JWKS-based verification using WorkOS's public keys
- **Bearer token authentication** — verified WorkOS access tokens on every MCP request
- **Multi-tenant support** — organization-scoped authentication via `organization_id`
- **Zero server-side OAuth code** — clients talk to WorkOS directly; your server only verifies

## What is WorkOS AuthKit?

WorkOS AuthKit is a complete authentication solution that handles user authentication (email/password, SSO, social), session management, OAuth 2.0 server, and Dynamic Client Registration. For MCP, AuthKit is your authorization server — your MCP server just verifies the tokens it issues.

## Prerequisites

- **Node.js 20+** (22 recommended)
- **pnpm 10+**
- A **WorkOS account** — sign up at [workos.com](https://workos.com)
- An **AuthKit project** — follow the [AuthKit Quickstart](https://workos.com/docs/authkit/quickstart) to set one up

## Setup

### 1. Get your WorkOS credentials

From the [WorkOS Dashboard](https://dashboard.workos.com):

1. Note your **AuthKit subdomain** under **Connect** → **Configuration** (e.g. `imaginative-palm-54-staging.authkit.app`)
2. Copy your **API key** from the **API Keys** tab (starts with `sk_test_` or `sk_live_`)

### 2. Enable Dynamic Client Registration

> **REQUIRED.** Without DCR, MCP clients cannot register and OAuth will fail with CORS errors.

In the WorkOS Dashboard:

1. Go to **Connect** → **Configuration**
2. Enable **Dynamic Client Registration**
3. Save your changes

### 3. Configure environment variables

```bash
cp .env.example .env
```

```bash
MCP_USE_OAUTH_WORKOS_SUBDOMAIN=your-subdomain.authkit.app
WORKOS_API_KEY=sk_test_...
```

### 4. Install and run

```bash
pnpm install
pnpm dev
```

The server starts on port **3000** with the inspector at <http://localhost:3000/inspector>.

## Try it out

1. Open <http://localhost:3000/inspector>
2. Connect to `http://localhost:3000/mcp`
3. Sign in via WorkOS (you'll be redirected to your AuthKit subdomain)
4. Call the available tools

## Available tools

| Tool                   | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `get-user-info`        | Returns user id, email, name, and organization id (from JWT)             |
| `get-user-permissions` | Returns roles, permissions, and scopes (from JWT)                        |
| `get-workos-user`      | Fetches the full user profile from WorkOS using `WORKOS_API_KEY`         |

## How the OAuth flow works

WorkOS handles all OAuth operations directly with the MCP client. Your server only publishes resource metadata and verifies bearer tokens.

```
MCP Client ──(1) MCP request without token ─▶ MCP Server ──▶ 401 + WWW-Authenticate
MCP Client ──(2) GET /.well-known/oauth-protected-resource ─▶ MCP Server (points at WorkOS)
MCP Client ──(3) GET /.well-known/oauth-authorization-server ─▶ WorkOS
MCP Client ──(4) Dynamic Client Registration ─▶ WorkOS
MCP Client ──(5) PKCE authorization + token exchange ─▶ WorkOS
MCP Client ──(6) MCP request + Bearer <jwt> ─▶ MCP Server (verifies via WorkOS JWKS)
```

The provider auto-configures all WorkOS endpoints from your subdomain:

- Issuer: `https://{subdomain}`
- Authorization: `https://{subdomain}/oauth2/authorize`
- Token: `https://{subdomain}/oauth2/token`
- JWKS: `https://{subdomain}/oauth2/jwks`

## Multi-tenant applications

WorkOS AuthKit supports organizations natively. The `organization_id` claim is exposed via `ctx.auth.user.organization_id` — use it to scope data per-tenant in your tools.

## Deploy

```bash
npx mcp-use deploy
```

Production checklist:

1. Use a **production** API key (`sk_live_...`)
2. Always run over HTTPS
3. Rotate API keys regularly
4. Monitor authentication logs in the WorkOS Dashboard

## Troubleshooting

- **CORS errors during registration** — Dynamic Client Registration is not enabled. Toggle it on in WorkOS Dashboard → Connect → Configuration.
- **All tool calls return 401** — confirm `MCP_USE_OAUTH_WORKOS_SUBDOMAIN` is the **full** AuthKit domain (e.g. `my-company.authkit.app`, not just `my-company`); confirm `WORKOS_API_KEY` is valid.
- **JWT verification fails** — double-check the subdomain matches your AuthKit instance exactly; tokens typically expire after 1 hour.
- **OAuth metadata not found** — verify `http://localhost:3000/.well-known/oauth-protected-resource` returns JSON.

## Learn more

- [WorkOS AuthKit Documentation](https://workos.com/docs/authkit)
- [WorkOS MCP Integration Guide](https://workos.com/docs/authkit/mcp)
- [mcp-use docs](https://mcp-use.com/docs)
- [MCP Authorization spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [RFC 7591 — Dynamic Client Registration](https://tools.ietf.org/html/rfc7591)

## License

MIT
