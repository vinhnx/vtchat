import { log } from "@repo/shared/logger";
/**
 * Database queries for account linking using Neon MCP
 * Provides accurate account linking status from the database
 */

// Note: This would use Neon MCP in production, but for now we'll use direct database queries
// since MCP integration needs to be properly configured with the Neon endpoint

export interface LinkedAccount {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Get all linked accounts for a user from the database
 * This ensures we have the most up-to-date account linking information
 */
export async function getLinkedAccountsFromDB(_userId: string): Promise<LinkedAccount[]> {
    try {
        // For now, we'll use the Better Auth API to get linked accounts
        // In production, this would use Neon MCP to query the accounts table directly

        const response = await fetch("/api/auth/list-accounts", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            log.warn({ status: response.status }, "Failed to fetch linked accounts from API");
            return [];
        }

        const data = await response.json();
        return data.accounts || [];
    } catch (error) {
        log.error({ error }, "Error fetching linked accounts from database");
        return [];
    }
}

/**
 * Check if a specific OAuth provider is linked for a user
 */
export async function isProviderLinked(userId: string, providerId: string): Promise<boolean> {
    try {
        const linkedAccounts = await getLinkedAccountsFromDB(userId);
        return linkedAccounts.some((account) => account.providerId === providerId);
    } catch (error) {
        log.error({ error, providerId }, "Error checking if provider is linked");
        return false;
    }
}

/**
 * Get the account ID for a specific provider (if linked)
 */
export async function getAccountIdForProvider(
    userId: string,
    providerId: string,
): Promise<string | null> {
    try {
        const linkedAccounts = await getLinkedAccountsFromDB(userId);
        const account = linkedAccounts.find((acc) => acc.providerId === providerId);
        return account?.accountId || null;
    } catch (error) {
        log.error({ error, providerId }, "Error getting account ID for provider");
        return null;
    }
}

/**
 * Neon MCP Implementation Example
 *
 * This shows how to use Neon MCP for direct database queries.
 * The MCP (Model Context Protocol) provides real-time database access.
 */

/**
 * Example function using Neon MCP to query linked accounts directly
 * This would be used in a server environment with proper MCP configuration
 */
export async function getLinkedAccountsFromNeonMCP(userId: string): Promise<LinkedAccount[]> {
    // This is an example of how Neon MCP would be used
    // In practice, you would configure Neon MCP in your environment

    const query = `
        SELECT 
            id,
            account_id as "accountId",
            provider_id as "providerId", 
            user_id as "userId",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM accounts 
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;

    try {
        // This would use the Neon MCP connection to execute the query
        // Example pseudo-code:
        // const result = await neonMCP.query(query, [userId]);
        // return result.rows;

        log.info({ query, userId }, "[Neon MCP] Query would be executed");

        // Fallback to API call for now
        return await getLinkedAccountsFromDB(userId);
    } catch (error) {
        log.error({ error }, "[Neon MCP] Query failed");
        throw error;
    }
}

/**
 * Example: Check if provider is linked using Neon MCP
 */
export async function isProviderLinkedMCP(userId: string, providerId: string): Promise<boolean> {
    const query = `
        SELECT EXISTS(
            SELECT 1 FROM accounts 
            WHERE user_id = $1 AND provider_id = $2
        ) as "exists";
    `;

    try {
        // This would use Neon MCP to execute the query
        log.info({ query, userId, providerId }, "[Neon MCP] Existence check query");

        // Fallback to current implementation
        return await isProviderLinked(userId, providerId);
    } catch (error) {
        log.error({ error }, "[Neon MCP] Existence check failed");
        return false;
    }
}

/**
 * Configuration example for Neon MCP in Claude Desktop or similar
 * This would go in claude_desktop_config.json:
 *
 * {
 *   "mcpServers": {
 *     "neon": {
 *       "command": "npx",
 *       "args": ["-y", "@neondatabase/mcp-server"],
 *       "env": {
 *         "DATABASE_URL": "postgresql://username:password@host/database"
 *       }
 *     }
 *   }
 * }
 */
