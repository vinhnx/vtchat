# VTChat Apps SDK Integration

This document describes how to run the VTChat MCP server that powers the OpenAI Apps SDK
integration. The server exposes the `vtchat.analyze` tool and a corresponding UI component so
ChatGPT can render VTChat research briefs inside the client.

## Package overview

The MCP server lives in `apps/vtchat-app` and ships with the following pieces:

- `src/server.ts` – Node HTTP server that implements the Apps SDK Streamable HTTP transport.
- `src/templates/vtchat-conversation.ts` – HTML/JS template rendered inside ChatGPT for structured
  responses.
- `app.json` – Reference manifest that lists the tool, resource template, and connector metadata.

## Environment variables

Set the following variables before launching the server:

- `OPENAI_API_KEY` – Required to call the Responses API and build structured VTChat briefs.
- `VTCHAT_APPS_PORT` – Optional port for the HTTP server (defaults to `4010`).
- `VTCHAT_APPS_MODEL_ID` – Optional model override (`gpt-4.1-mini` is the default).
- `VTCHAT_APPS_ALLOWED_ORIGINS` – Comma-separated allow-list for CORS headers. Leave empty to allow
  all origins during development.

## Installing dependencies

```bash
bun install
```

## Running the MCP server

```bash
bun --filter @vtchat/apps-sdk-server start
```

The server exposes `/mcp` with support for `POST`, `GET`, and `DELETE` so it can accept
Streamable HTTP traffic from ChatGPT and other Apps SDK clients. Logs surface missing configuration
(such as an absent `OPENAI_API_KEY`) and each connected session.

## Testing with MCP Inspector

1. Launch the server locally.
2. Start [MCP Inspector](https://modelcontextprotocol.io/inspector).
3. Connect to `http://localhost:<port>/mcp`.
4. Verify that the `vtchat.analyze` tool appears and that invoking it returns structured content and
   logs.

## Connecting to ChatGPT (developer mode)

1. Deploy the server behind an HTTPS endpoint (Ngrok works for local testing).
2. In ChatGPT, open **Settings → Connectors → Create**.
3. Provide the connector name, description, and the public `/mcp` URL.
4. Enable the connector in a conversation and prompt, for example, “Use VTChat to summarise the
   latest paper on retrieval-augmented generation.”

## Expected behaviour

- The tool responds with JSON structured output backed by the VTChat HTML template.
- `structuredContent` includes summary, key insights, recommended actions, follow-up prompts,
  audience metadata, and timestamps.
- The fallback path guides operators to configure `OPENAI_API_KEY` when missing or misconfigured.

Refer to the OpenAI Apps SDK documentation for additional deployment and metadata guidelines.
