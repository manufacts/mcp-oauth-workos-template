/**
 * WorkOS AuthKit OAuth MCP Server
 *
 * Demonstrates the OAuth integration with WorkOS AuthKit using mcp-use.
 *
 * Learn more:
 * - WorkOS MCP: https://workos.com/docs/authkit/mcp
 * - WorkOS AuthKit: https://workos.com/docs/authkit
 *
 * Environment variables:
 * - MCP_USE_OAUTH_WORKOS_SUBDOMAIN  (required) — your AuthKit subdomain
 * - WORKOS_API_KEY                  (optional, but needed for direct WorkOS API calls)
 */

import { MCPServer, oauthWorkOSProvider, error, object } from "mcp-use/server";

declare const process: { env: Record<string, string> };

const WORKOS_API_KEY = process.env.WORKOS_API_KEY;

if (!WORKOS_API_KEY) {
  console.warn("Warning: WORKOS_API_KEY not set. API calls will fail.");
}

const server = new MCPServer({
  name: "mcp-oauth-workos",
  version: "1.0.0",
  description: "MCP server with WorkOS AuthKit OAuth authentication",
  // Zero-config — OAuth is fully configured via MCP_USE_OAUTH_* environment variables
  oauth: oauthWorkOSProvider(),
});

/**
 * Returns authenticated user information from the JWT.
 */
server.tool(
  {
    name: "get-user-info",
    description: "Get information about the authenticated user",
  },
  async (_args, ctx) =>
    object({
      userId: ctx.auth.user.userId,
      email: ctx.auth.user.email,
      name: ctx.auth.user.name,
      organizationId: ctx.auth.user.organization_id,
    })
);

/**
 * Returns the user's roles, permissions, and scopes.
 */
server.tool(
  {
    name: "get-user-permissions",
    description: "Get the authenticated user's roles and permissions",
  },
  async (_args, ctx) =>
    object({
      roles: ctx.auth.user.roles || [],
      permissions: ctx.auth.user.permissions || [],
      scopes: ctx.auth.user.scopes || [],
    })
);

/**
 * Demonstrates making an authenticated API call to WorkOS.
 */
server.tool(
  {
    name: "get-workos-user",
    description: "Fetch user profile from WorkOS using the WORKOS_API_KEY",
  },
  async (_args, ctx) => {
    try {
      const res = await fetch(
        `https://api.workos.com/user_management/users/${ctx.auth.user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${WORKOS_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        return error(
          `Failed to fetch user from WorkOS: ${res.status} ${res.statusText}`
        );
      }

      return object(await res.json());
    } catch (err) {
      return error(`Failed to fetch user profile: ${err}`);
    }
  }
);

server.listen().then(() => {
  console.log("WorkOS OAuth MCP Server Running");
});
