import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
/* eslint-disable no-console */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { OpenAI } from 'openai';
import type { ResponseOutput, ResponseOutputContent } from 'openai/resources/responses';
import { z } from 'zod';
import { VTCHAT_CONVERSATION_TEMPLATE } from './templates/vtchat-conversation';

type SessionContext = {
    server: McpServer;
    transport: StreamableHTTPServerTransport;
};

type AnalysisPayload = {
    prompt: string;
    context?: string;
    audience?: string;
};

type StructuredAnalysis = {
    summary: string;
    insights: string[];
    actionItems: string[];
    followUps: string[];
    audience: string;
    generatedAt: string;
};

type ToolResult = {
    content: { type: 'text'; text: string; }[];
    structuredContent: StructuredAnalysis;
    _meta: Record<string, unknown>;
};

const port = parseInt(process.env.VTCHAT_APPS_PORT ?? '4010', 10);
const modelId = process.env.VTCHAT_APPS_MODEL_ID ?? 'gpt-4.1-mini';
const allowedOrigins = (process.env.VTCHAT_APPS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const sessions = new Map<string, SessionContext>();

const schemaDefinition = {
    name: 'vtchat_analysis',
    schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
            summary: { type: 'string', description: 'High-level synthesis of the findings.' },
            key_findings: {
                type: 'array',
                description: 'Key insights and evidence the user should know.',
                items: { type: 'string' },
            },
            action_items: {
                type: 'array',
                description: 'Concrete next steps or recommendations.',
                items: { type: 'string' },
            },
            follow_up_questions: {
                type: 'array',
                description: 'Follow-up prompts to deepen the investigation.',
                items: { type: 'string' },
            },
        },
        required: ['summary', 'key_findings', 'action_items', 'follow_up_questions'],
    },
} as const;

const trimList = (items: string[], limit = 6): string[] => {
    return items.filter(item => item.trim().length > 0).slice(0, limit);
};

const formatFallback = (payload: AnalysisPayload, reason: string): ToolResult => {
    const audience = payload.audience?.trim().length ? payload.audience.trim() : 'General';
    const summary = [
        'VTChat could not reach the reasoning models because the OpenAI API key is missing or',
        'invalid.',
        'Set the OPENAI_API_KEY environment variable and restart the server.',
    ].join(' ');

    return {
        content: [
            {
                type: 'text',
                text: `${summary}\n\n${reason}`,
            },
        ],
        structuredContent: {
            summary,
            insights: ['Configure OPENAI_API_KEY to unlock VTChat analysis.'],
            actionItems: ['Provide a valid API key and redeploy the MCP server.'],
            followUps: ['After configuring the key, ask VTChat to rerun this request.'],
            audience,
            generatedAt: new Date().toISOString(),
        },
        _meta: {
            audience,
            model: modelId,
            reason,
        },
    };
};

const extractJsonText = (output: ResponseOutput | undefined): string | null => {
    if (!output?.content) {
        return null;
    }

    for (const entry of output.content as ResponseOutputContent[]) {
        if (entry.type === 'output_text' && 'text' in entry) {
            return entry.text;
        }

        if (entry.type === 'text' && 'text' in entry) {
            return entry.text;
        }

        if (entry.type === 'json_schema' && 'json' in entry) {
            return JSON.stringify(entry.json);
        }

        if (entry.type === 'tool_result' && 'result' in entry) {
            return JSON.stringify(entry.result);
        }
    }

    return null;
};

const callOpenAI = async (payload: AnalysisPayload): Promise<ToolResult> => {
    if (!process.env.OPENAI_API_KEY) {
        return formatFallback(payload, 'OPENAI_API_KEY is not defined.');
    }

    const promptSections = [
        `Primary request:\n${payload.prompt.trim()}`,
    ];

    if (payload.context?.trim()) {
        promptSections.push(`Additional context:\n${payload.context.trim()}`);
    }

    if (payload.audience?.trim()) {
        promptSections.push(`Audience: ${payload.audience.trim()}`);
    }

    promptSections.push(
        [
            'Return a JSON object that summarizes the topic with summary and key findings,',
            'plus action items and follow-up questions.',
        ].join(' '),
    );

    try {
        const response = await openai.responses.create({
            model: modelId,
            input: [
                {
                    role: 'system',
                    content: [
                        'You are VTChat, an orchestrator that produces structured research briefs.',
                        'Always produce concise, factual, and actionable outputs.',
                    ].join(' '),
                },
                { role: 'user', content: promptSections.join('\n\n') },
            ],
            response_format: { type: 'json_schema', json_schema: schemaDefinition },
        });

        const block = response.output?.[0];
        const jsonText = extractJsonText(block) ?? response.output_text ?? '';
        const parsed = JSON.parse(jsonText) as {
            summary: string;
            key_findings: string[];
            action_items: string[];
            follow_up_questions: string[];
        };

        const audience = payload.audience?.trim().length ? payload.audience.trim() : 'General';
        const structuredContent: StructuredAnalysis = {
            summary: parsed.summary,
            insights: trimList(parsed.key_findings),
            actionItems: trimList(parsed.action_items),
            followUps: trimList(parsed.follow_up_questions),
            audience,
            generatedAt: new Date().toISOString(),
        };

        const messageLines = [
            `Summary:\n${structuredContent.summary}`,
            '',
            'Key insights:',
            ...structuredContent.insights.map(item => `• ${item}`),
            '',
            'Recommended actions:',
            ...structuredContent.actionItems.map(item => `• ${item}`),
            '',
            'Follow-up prompts:',
            ...structuredContent.followUps.map(item => `• ${item}`),
        ];

        return {
            content: [
                {
                    type: 'text',
                    text: messageLines.join('\n'),
                },
            ],
            structuredContent,
            _meta: {
                audience,
                model: modelId,
            },
        };
    } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error calling OpenAI.';
        return formatFallback(payload, reason);
    }
};

const createVtchatServer = (): McpServer => {
    const server = new McpServer(
        {
            name: 'vtchat-app-server',
            version: '1.0.0',
            icons: [
                {
                    src: 'https://vtchat.io.vn/icons/app-icon.png',
                    sizes: ['512x512'],
                    mimeType: 'image/png',
                },
            ],
            websiteUrl: 'https://vtchat.io.vn',
        },
        {
            capabilities: {
                logging: {},
                tools: {},
                resources: {},
            },
            instructions: [
                'Use the vtchat.analyze tool whenever a user requests research, synthesis,',
                'or structured insights.',
                'Always rely on the tool output instead of answering directly.',
            ].join(' '),
        },
    );

    server.registerResource(
        'vtchat-conversation-template',
        'ui://widget/vtchat-conversation.html',
        {
            title: 'VTChat insight viewer',
            description: 'Displays VTChat research briefs with structured insights.',
            mimeType: 'text/html+skybridge',
        },
        async () => ({
            contents: [
                {
                    uri: 'ui://widget/vtchat-conversation.html',
                    mimeType: 'text/html+skybridge',
                    text: VTCHAT_CONVERSATION_TEMPLATE,
                },
            ],
        }),
    );

    const inputSchema = z.object({
        prompt: z.string().min(1).describe('Primary user question or task for VTChat'),
        context: z.string().optional().describe('Optional background details or source notes'),
        audience: z.string().optional().describe('Intended audience for tone and framing'),
    });

    server.registerTool(
        'vtchat.analyze',
        {
            title: 'VTChat Deep Analysis',
            description: 'Generates structured VTChat research briefs for complex questions.',
            inputSchema,
            _meta: {
                'openai/outputTemplate': 'ui://widget/vtchat-conversation.html',
                'openai/toolInvocation/invoking': 'Synthesizing VTChat insights…',
                'openai/toolInvocation/invoked': 'VTChat analysis ready',
                'openai/securitySchemes': [],
                'openai/widgetAccessible': true,
            },
        },
        async (input) => {
            const payload: AnalysisPayload = {
                prompt: input.prompt,
                context: input.context,
                audience: input.audience,
            };

            return callOpenAI(payload);
        },
    );

    return server;
};

const resolveOrigin = (req: IncomingMessage): string | undefined => {
    const originHeader = req.headers.origin;
    if (!originHeader) {
        return allowedOrigins.length === 0 ? '*' : allowedOrigins[0];
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(originHeader)) {
        return originHeader;
    }

    return undefined;
};

const applyCors = (req: IncomingMessage, res: ServerResponse): void => {
    const origin = resolveOrigin(req);
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
};

const sendJson = (
    req: IncomingMessage,
    res: ServerResponse,
    status: number,
    payload: unknown,
): void => {
    applyCors(req, res);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
};

const readBody = async (req: IncomingMessage): Promise<unknown> => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }

    if (chunks.length === 0) {
        return undefined;
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw.trim()) {
        return undefined;
    }

    return JSON.parse(raw);
};

const handlePost = async (
    req: IncomingMessage,
    res: ServerResponse,
    body: unknown,
): Promise<void> => {
    const sessionIdHeader = req.headers['mcp-session-id'];
    const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

    if (sessionId && sessions.has(sessionId)) {
        const context = sessions.get(sessionId);
        if (context) {
            applyCors(req, res);
            await context.transport.handleRequest(req, res, body);
            return;
        }
    }

    if (!isInitializeRequest(body)) {
        sendJson(req, res, 400, {
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Initialization required before issuing tool calls.',
            },
            id: null,
        });
        return;
    }

    const server = createVtchatServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
            sessions.set(newSessionId, { server, transport });
        },
    });

    transport.onclose = () => {
        const activeId = transport.sessionId;
        if (activeId) {
            sessions.delete(activeId);
        }
    };

    transport.onerror = (error) => {
        const activeId = transport.sessionId;
        if (activeId) {
            sessions.delete(activeId);
        }
        console.error('MCP transport error', error);
    };

    await server.connect(transport);
    applyCors(req, res);
    await transport.handleRequest(req, res, body);
};

const handleGetOrDelete = async (
    method: 'GET' | 'DELETE',
    req: IncomingMessage,
    res: ServerResponse,
): Promise<void> => {
    const sessionIdHeader = req.headers['mcp-session-id'];
    const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

    if (!sessionId || !sessions.has(sessionId)) {
        sendJson(req, res, 400, {
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Invalid or missing MCP session id.',
            },
            id: null,
        });
        return;
    }

    const context = sessions.get(sessionId);
    if (!context) {
        sendJson(req, res, 404, {
            jsonrpc: '2.0',
            error: {
                code: -32004,
                message: 'Session not found.',
            },
            id: null,
        });
        return;
    }

    applyCors(req, res);
    await context.transport.handleRequest(req, res);
};

const server = createServer(async (req, res) => {
    try {
        if (!req.url) {
            sendJson(req, res, 404, { message: 'Not Found' });
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
        if (url.pathname !== '/mcp') {
            sendJson(req, res, 404, { message: 'Route not found' });
            return;
        }

        if (req.method === 'OPTIONS') {
            applyCors(req, res);
            res.statusCode = 204;
            res.end();
            return;
        }

        if (req.method === 'POST') {
            const body = await readBody(req);
            await handlePost(req, res, body);
            return;
        }

        if (req.method === 'GET' || req.method === 'DELETE') {
            await handleGetOrDelete(req.method, req, res);
            return;
        }

        sendJson(req, res, 405, { message: 'Method not allowed' });
    } catch (error) {
        console.error('Unhandled server error', error);
        sendJson(req, res, 500, {
            jsonrpc: '2.0',
            error: {
                code: -32603,
                message: 'Internal server error',
            },
            id: null,
        });
    }
});

server.listen(port, () => {
    console.log(`VTChat Apps SDK server listening on port ${port}`);
});
