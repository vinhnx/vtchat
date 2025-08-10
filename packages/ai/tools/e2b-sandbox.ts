import { Sandbox } from '@e2b/code-interpreter';
import { log } from '@repo/shared/logger';

// TODO: Add rate limiting and user access control

export async function createSandbox() {
    try {
        const sandbox = await Sandbox.create({
            template: 'base',
            apiKey: process.env.E2B_API_KEY,
        });
        return sandbox;
    } catch (error) {
        log.error({ error }, 'Failed to create e2b sandbox');
        throw new Error('Failed to create e2b sandbox');
    }
}

export async function executeCodeInSandbox(sandbox: Sandbox, code: string) {
    try {
        const { stdout, stderr, error } = await sandbox.notebook.execCell(code);

        if (error) {
            throw error;
        }

        return { stdout, stderr };
    } catch (error) {
        log.error({ error }, 'Failed to execute code in e2b sandbox');
        throw new Error('Failed to execute code in e2b sandbox');
    }
}

export async function releaseSandbox(sandbox: Sandbox) {
    try {
        await sandbox.close();
    } catch (error) {
        log.error({ error }, 'Failed to release e2b sandbox');
        // Ignore errors on close
    }
}
