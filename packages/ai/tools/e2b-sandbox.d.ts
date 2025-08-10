import { Sandbox } from '@e2b/code-interpreter';
export declare function createSandbox(): Promise<Sandbox>;
export declare function executeCodeInSandbox(sandbox: Sandbox, code: string): Promise<{
    stdout: any;
    stderr: any;
}>;
export declare function releaseSandbox(sandbox: Sandbox): Promise<void>;
//# sourceMappingURL=e2b-sandbox.d.ts.map