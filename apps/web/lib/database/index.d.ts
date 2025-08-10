import * as schema from "./schema";
export declare const db: import("drizzle-orm/neon-http").NeonHttpDatabase<typeof schema> & {
    $client: import("@neondatabase/serverless").NeonQueryFunction<false, false>;
};
export declare const testConnection: () => Promise<boolean>;
export declare const withDatabaseErrorHandling: <T>(operation: () => Promise<T>, operationName?: string) => Promise<T>;
//# sourceMappingURL=index.d.ts.map