import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
type AcpProcessAdapterClass = typeof import('../process-adapter').AcpProcessAdapter;

class MockChildProcess extends EventEmitter {
    stdin: PassThrough;
    stdout: PassThrough;
    stderr: PassThrough;
    pid: number;

    constructor() {
        super();
        this.stdin = new PassThrough();
        this.stdout = new PassThrough();
        this.stderr = new PassThrough();
        this.pid = 4242;
    }

    kill = vi.fn(() => true);
}

const mockSpawn = vi.fn<typeof import('node:child_process')['spawn']>();

let AcpProcessAdapter: AcpProcessAdapterClass;

beforeAll(async () => {
    ({ AcpProcessAdapter } = await import('../process-adapter'));
});

describe('AcpProcessAdapter', () => {
    let process: MockChildProcess;

    beforeEach(() => {
        vi.useFakeTimers();
        process = new MockChildProcess();
        mockSpawn.mockReturnValue(process as unknown as ChildProcessWithoutNullStreams);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('starts the process when handling the first request', async () => {
        const adapter = new AcpProcessAdapter({
            command: 'codex-acp',
            spawn: mockSpawn,
        });

        const requestPromise = adapter.request('initialize');
        await vi.advanceTimersByTimeAsync(60);

        expect(mockSpawn).toHaveBeenCalledTimes(1);
        expect((adapter as unknown as { process: MockChildProcess | null }).process).toBe(process);

        process.emit('close', 0, null);

        await expect(requestPromise).rejects.toThrow('ACP process stdin is not available');
    });

    it('formats requests using JSON-RPC envelopes', async () => {
        const adapter = new AcpProcessAdapter({
            command: 'codex-acp',
            spawn: mockSpawn,
        });

        await adapter.start();
        await vi.advanceTimersByTimeAsync(60);
        expect(mockSpawn).toHaveBeenCalledTimes(1);
        expect((adapter as unknown as { process: MockChildProcess | null }).process).toBe(process);
        mockSpawn.mockClear();

        const writeSpy = vi.spyOn(process.stdin, 'write');

        const requestPromise = adapter.request('initialize', { foo: 'bar' });
        await Promise.resolve();
        expect(mockSpawn).not.toHaveBeenCalled();

        expect(writeSpy).toHaveBeenCalledTimes(1);
        const payload = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: { foo: 'bar' },
        });
        const message = writeSpy.mock.calls[0][0];
        expect(message.toString()).toBe(`Content-Length: ${Buffer.byteLength(payload)}\r\n\r\n${payload}`);

        const response = JSON.stringify({ jsonrpc: '2.0', id: 1, result: { ok: true } });
        process.stdout.write(`Content-Length: ${Buffer.byteLength(response)}\r\n\r\n${response}`);
        const result = await requestPromise;
        expect(result).toEqual({ ok: true });
    });

    it('rejects when the process reports an error', async () => {
        const adapter = new AcpProcessAdapter({
            command: 'codex-acp',
            spawn: mockSpawn,
        });

        await adapter.start();
        await vi.advanceTimersByTimeAsync(60);
        expect(mockSpawn).toHaveBeenCalledTimes(1);
        expect((adapter as unknown as { process: MockChildProcess | null }).process).toBe(process);
        mockSpawn.mockClear();

        const requestPromise = adapter.request('initialize');
        await Promise.resolve();
        expect(mockSpawn).not.toHaveBeenCalled();

        const response = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            error: { message: 'something went wrong' },
        });
        process.stdout.write(`Content-Length: ${Buffer.byteLength(response)}\r\n\r\n${response}`);

        await expect(requestPromise).rejects.toThrow('something went wrong');
    });

    it('emits notifications when receiving messages without ids', async () => {
        const adapter = new AcpProcessAdapter({
            command: 'codex-acp',
            spawn: mockSpawn,
        });

        await adapter.start();
        await vi.advanceTimersByTimeAsync(60);
        expect(mockSpawn).toHaveBeenCalledTimes(1);
        expect((adapter as unknown as { process: MockChildProcess | null }).process).toBe(process);
        mockSpawn.mockClear();

        const notificationSpy = vi.fn();
        adapter.onNotification = notificationSpy;

        const requestPromise = adapter.request('initialize');
        await Promise.resolve();
        expect(mockSpawn).not.toHaveBeenCalled();

        const result = JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} });
        process.stdout.write(`Content-Length: ${Buffer.byteLength(result)}\r\n\r\n${result}`);
        await requestPromise;

        const notification = JSON.stringify({
            jsonrpc: '2.0',
            method: 'session/update',
            params: { value: 1 },
        });
        process.stdout.write(
            `Content-Length: ${Buffer.byteLength(notification)}\r\n\r\n${notification}`,
        );

        expect(notificationSpy).toHaveBeenCalledWith({
            method: 'session/update',
            params: { value: 1 },
        });
    });
});
