import { type ChildProcessWithoutNullStreams, spawn as defaultSpawn } from 'node:child_process';
import type { Readable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { z, type ZodTypeAny } from 'zod';
import type { AcpLogger, AcpProcessOptions, AcpRequestParams } from './types';

const JSONRPC_VERSION = '2.0';
const HEADER_SEPARATOR = '\r\n\r\n';
const HEADER_REGEX = /Content-Length:\s*(\d+)/i;
const FALLBACK_RESULT_SCHEMA = z.object({}).passthrough();

const defaultLogger: Required<AcpLogger> = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

export class AcpProcessAdapter {
    private readonly options: AcpProcessOptions;
    private readonly logger: Required<AcpLogger>;
    private process: ChildProcessWithoutNullStreams | null = null;
    private buffer = '';
    private nextId = 1;
    private pending = new Map<number, {
        resolve: (value: unknown) => void;
        reject: (reason: Error) => void;
        schema: ZodTypeAny;
    }>();

    onNotification?: (message: { method: string; params?: AcpRequestParams; }) => void;
    onClose?: (code: number | null, signal: NodeJS.Signals | null) => void;
    onError?: (error: Error) => void;

    constructor(options: AcpProcessOptions) {
        this.options = options;
        this.logger = {
            ...defaultLogger,
            ...options.logger,
        };
    }

    get stderr(): Readable | null {
        return this.process?.stderr ?? null;
    }

    get pid(): number | null {
        return this.process?.pid ?? null;
    }

    async start(): Promise<void> {
        if (this.process) {
            this.logger.debug?.('ACP process already started', { pid: this.process.pid });
            return;
        }

        const env = this.prepareEnv(this.options.env);
        this.logger.info?.('Starting ACP process', {
            command: this.options.command,
            args: this.options.args,
            cwd: this.options.cwd,
        });

        const spawnFn = this.options.spawn ?? defaultSpawn;

        const child = spawnFn(this.options.command, this.options.args ?? [], {
            cwd: this.options.cwd,
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        this.process = child;
        child.on('spawn', () => {
            this.logger.debug?.('ACP process spawned', { pid: child.pid });
        });

        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk: string) => {
            this.buffer += chunk;
            this.parseBuffer();
        });

        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk: string) => {
            this.logger.warn?.('ACP process stderr output', { chunk });
        });

        child.on('error', (error) => {
            this.logger.error?.('ACP process error', { message: error.message });
            this.onError?.(error instanceof Error ? error : new Error(String(error)));
            this.rejectAll(error instanceof Error ? error : new Error(String(error)));
        });

        child.on('close', (code, signal) => {
            this.logger.warn?.('ACP process closed', { code, signal });
            this.process = null;
            this.rejectAll(new Error('ACP process closed'));
            this.onClose?.(code, signal);
        });

        // Give the process a brief moment to start to avoid race conditions with immediate requests.
        await delay(50);
    }

    async stop(): Promise<void> {
        if (!this.process) {
            return;
        }

        this.logger.info?.('Stopping ACP process', { pid: this.process.pid });
        this.process.kill();
        this.process = null;
        this.buffer = '';
        this.pending.clear();
    }

    async request<T = unknown>(
        method: string,
        params?: AcpRequestParams,
        schema: ZodTypeAny = FALLBACK_RESULT_SCHEMA,
    ): Promise<T> {
        await this.ensureStarted();

        const id = this.nextId++;
        const payload = JSON.stringify({
            jsonrpc: JSONRPC_VERSION,
            id,
            method,
            params: params ?? {},
        });

        const message = this.formatMessage(payload);

        this.logger.debug?.('Sending ACP request', { id, method });

        return new Promise<T>((resolve, reject) => {
            if (!this.process?.stdin) {
                reject(new Error('ACP process stdin is not available'));
                return;
            }

            this.pending.set(id, { resolve, reject, schema });

            this.process.stdin.write(message, (error) => {
                if (error) {
                    this.logger.error?.('Failed to write ACP request', { message: error.message });
                    this.pending.delete(id);
                    reject(error);
                }
            });
        });
    }

    async notify(method: string, params?: AcpRequestParams): Promise<void> {
        await this.ensureStarted();

        const payload = JSON.stringify({
            jsonrpc: JSONRPC_VERSION,
            method,
            params: params ?? {},
        });

        const message = this.formatMessage(payload);

        this.logger.debug?.('Sending ACP notification', { method });

        return new Promise<void>((resolve, reject) => {
            if (!this.process?.stdin) {
                reject(new Error('ACP process stdin is not available'));
                return;
            }

            this.process.stdin.write(message, (error) => {
                if (error) {
                    this.logger.error?.('Failed to write ACP notification', {
                        message: error.message,
                    });
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private prepareEnv(env: Record<string, string> | undefined) {
        if (!env) {
            return process.env as Record<string, string>;
        }

        const sanitized: Record<string, string> = { ...process.env } as Record<string, string>;
        for (const [key, value] of Object.entries(env)) {
            sanitized[key] = value;
        }
        return sanitized;
    }

    private async ensureStarted() {
        if (!this.process) {
            await this.start();
        }
    }

    private formatMessage(payload: string) {
        const contentLength = Buffer.byteLength(payload, 'utf8');
        return `Content-Length: ${contentLength}\r\n\r\n${payload}`;
    }

    private parseBuffer() {
        while (this.buffer.length > 0) {
            const headerEnd = this.buffer.indexOf(HEADER_SEPARATOR);
            if (headerEnd === -1) {
                // Try newline-delimited JSON as a fallback
                const newlineIndex = this.buffer.indexOf('\n');
                if (newlineIndex === -1) {
                    break;
                }
                const line = this.buffer.slice(0, newlineIndex).trim();
                this.buffer = this.buffer.slice(newlineIndex + 1);
                if (line.length === 0) {
                    continue;
                }
                this.safeHandleMessage(line);
                continue;
            }

            const header = this.buffer.slice(0, headerEnd);
            const lengthMatch = header.match(HEADER_REGEX);

            if (!lengthMatch) {
                // Unable to parse length, drop the header and continue
                this.logger.warn?.('Unable to parse Content-Length header', { header });
                this.buffer = this.buffer.slice(headerEnd + HEADER_SEPARATOR.length);
                continue;
            }

            const contentLength = Number.parseInt(lengthMatch[1], 10);
            const bodyStart = headerEnd + HEADER_SEPARATOR.length;
            const bodyEnd = bodyStart + contentLength;

            if (this.buffer.length < bodyEnd) {
                // Wait for more data
                break;
            }

            const body = this.buffer.slice(bodyStart, bodyEnd);
            this.buffer = this.buffer.slice(bodyEnd);
            this.safeHandleMessage(body);
        }
    }

    private safeHandleMessage(payload: string) {
        try {
            const message = JSON.parse(payload);
            this.handleMessage(message);
        } catch (error) {
            this.logger.error?.('Failed to parse ACP message', {
                payload,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    private handleMessage(message: any) {
        if (message?.id !== undefined) {
            this.handleResponse(message);
            return;
        }

        if (message?.method) {
            this.logger.debug?.('Received ACP notification', { method: message.method });
            this.onNotification?.({ method: message.method, params: message.params });
            return;
        }

        this.logger.warn?.('Received unhandled ACP message', { message });
    }

    private handleResponse(message: any) {
        const id = Number(message.id);
        const pending = this.pending.get(id);
        if (!pending) {
            this.logger.warn?.('Received response for unknown request', { id });
            return;
        }

        this.pending.delete(id);

        if (message.error) {
            const errorMessage = message.error.message ?? 'Unknown ACP error';
            this.logger.error?.('ACP request error', { id, error: errorMessage });
            pending.reject(new Error(errorMessage));
            return;
        }

        try {
            const parsed = pending.schema.parse(message.result ?? {});
            pending.resolve(parsed);
        } catch (error) {
            this.logger.error?.('Failed to validate ACP response', {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            pending.reject(error instanceof Error ? error : new Error(String(error)));
        }
    }

    private rejectAll(error: Error) {
        for (const pending of this.pending.values()) {
            pending.reject(error);
        }
        this.pending.clear();
    }
}
