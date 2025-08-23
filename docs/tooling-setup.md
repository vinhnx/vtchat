# Tooling Setup Guide

## Overview

VTChat uses a lightweight tooling stack for performance and code quality.

## Current Stack

### Code Quality Tools

- **dprint**: Fast code formatter
- **oxlint**: Type-aware linting
- **Bun**: Package manager and JavaScript runtime
- **TypeScript**: Strict type checking

### Configuration Files

- `dprint.json`: dprint configuration
- `.oxlintrc.json`: oxlint configuration
- `turbo.json`: Turborepo caching configuration
- `package.json`: Scripts and dependencies

## Setup Process

### 1. dprint Integration

```bash
# Install dprint
bun add -D dprint
```

`dprint.json`:

```json
{
    "$schema": "https://dprint.dev/schemas/v0.json",
    "lineWidth": 100,
    "indentWidth": 4,
    "useTabs": false,
    "excludes": ["node_modules", ".next", ".turbo", "dist", "build", "coverage"],
    "plugins": [
        "https://plugins.dprint.dev/typescript-0.95.9.wasm",
        "https://plugins.dprint.dev/json-0.20.0.wasm"
    ],
    "typescript": {
        "quoteStyle": "preferSingle",
        "semiColons": "always"
    }
}
```

### 2. oxlint Setup

```bash
# Install oxlint with type awareness
bun add -D oxlint oxlint-tsgolint
```

`.oxlintrc.json`:

```json
{
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": ["recommended"],
    "rules": {
        "no-unused-vars": "warn",
        "no-console": "off"
    }
}
```

Run `bun run lint:type-aware` to enable type-aware linting.

### 3. Package Scripts

```json
{
    "scripts": {
        "fmt": "dprint fmt",
        "fmt:check": "dprint check",
        "lint": "oxlint",
        "lint:type-aware": "oxlint --type-aware",
        "format": "prettier --write \"**/*.md\"",
        "format:check": "prettier --check \"**/*.md\"",
        "check": "bun run fmt:check && bun run lint"
    }
}
```

## Usage

### Daily Development

```bash
# Format code
bun run fmt

# Check formatting and linting
bun run check

# Run lint only
bun lint
```

### Pre-commit Workflow

1. **Format code**: `bun run fmt`
2. **Check linting**: `bun run check`
3. **Run tests**: `bun test`

## Benefits

- **dprint**: Rust-based, extremely fast formatting
- **oxlint**: Rust-based type-aware linting
- **Bun**: Fast package management and script execution

## VS Code Integration

Install the dprint extension for VS Code:

```json
{
    "editor.defaultFormatter": "dprint.dprint",
    "editor.formatOnSave": true
}
```

## Troubleshooting

- Ensure `dprint.json` and `.oxlintrc.json` exist at repository root.
- Add build directories to `excludes` if needed.

## Conclusion

This tooling setup provides fast, reliable development with consistent formatting and linting.
