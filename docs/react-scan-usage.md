# React Scan Usage

React Scan is a performance monitoring tool that helps identify slow renders and unnecessary re-renders in React applications.

## Quick Start

### Run with React Scan enabled (from project root)

```bash
bun run dev:scan
```

### Run with React Scan enabled (from apps/web)

```bash
bun run dev:scan
```

### Manual environment variable

```bash
REACT_SCAN_ENABLED=true bun run dev
```

## Configuration

React Scan is configured via environment variables:

- `REACT_SCAN_ENABLED=true` - Enable React Scan (required to run)
- `REACT_SCAN_LOG=true` - Enable console logging for detailed diagnostics
- `REACT_SCAN_SLOW_THRESHOLD=20` - Set threshold for slow render detection (default: 10ms)

## External CLI Tool

You can also use the React Scan CLI tool to scan a running application:

```bash
bunx react-scan localhost:3000
```

## Safety Features

- Only runs in development mode (`NODE_ENV === 'development'`)
- Disabled on all deployment platforms automatically
- Requires explicit opt-in via `REACT_SCAN_ENABLED=true`
- Multiple environment checks prevent accidental production activation

## Performance Impact

React Scan adds minimal overhead but can affect performance when:

- Logging is enabled (`REACT_SCAN_LOG=true`)
- Tracking unnecessary renders
- Many components are rendering simultaneously

Use it only when actively debugging performance issues.
