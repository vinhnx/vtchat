export type AcpClientInfo = {
    name: string;
    version: string;
};

export type AcpProcessOptions = {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    client?: AcpClientInfo;
    protocolVersion?: string;
    logger?: AcpLogger;
    spawn?: typeof import('node:child_process')['spawn'];
};

export type AcpLogger = {
    debug?: (message: string, data?: Record<string, unknown>) => void;
    info?: (message: string, data?: Record<string, unknown>) => void;
    warn?: (message: string, data?: Record<string, unknown>) => void;
    error?: (message: string, data?: Record<string, unknown>) => void;
};

export type AcpMethodMap = {
    initialize: string;
    authenticate: string;
    newSession: string;
    loadSession: string;
    prompt: string;
    cancel: string;
    setSessionMode: string;
    setSessionModel: string;
};

export type AcpRequestParams = Record<string, unknown> | undefined;
