# Tooling Setup Guide

## Overview

VTChat uses a modern development tooling setup optimized for performance and code quality. This guide documents the current configuration and setup process.

## Current Stack

### Code Quality Tools

- **Biome.js**: Primary code formatter and linter
- **oxlint**: Comprehensive linting for additional checks
- **Bun**: Package manager and JavaScript runtime
- **TypeScript**: Strict type checking

### Configuration Files

- `biome.json`: Biome configuration
- `.oxlintrc.json`: oxlint configuration
- `turbo.json`: Turborepo caching configuration
- `package.json`: Scripts and dependencies

## Setup Process

### 1. Biome Integration

Biome.js provides fast, unified formatting and linting:

```bash
# Install Biome
bun add -D @biomejs/biome

# Initialize configuration
bunx @biomejs/biome init
```

Configuration in `biome.json`:

```json
{
    "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
    "files": {
        "ignore": [
            "node_modules/**",
            ".next/**",
            ".turbo/**",
            "dist/**",
            "build/**",
            "coverage/**"
        ],
        "maxSize": 10485760
    },
    "formatter": {
        "enabled": true,
        "indentStyle": "space",
        "indentWidth": 4,
        "lineWidth": 100
    },
    "linter": {
        "enabled": true,
        "rules": {
            "recommended": true
        }
    },
    "javascript": {
        "formatter": {
            "quoteStyle": "single",
            "semicolons": "always"
        }
    },
    "json": {
        "formatter": {
            "enabled": true
        }
    }
}
```

### 2. oxlint Setup

oxlint provides comprehensive linting beyond Biome:

```bash
# Install oxlint
bun add -D oxlint
```

Configuration in `.oxlintrc.json`:

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

### 3. Package Scripts

Added to `package.json`:

```json
{
    "scripts": {
        "biome:format": "biome format --write .",
        "biome:check": "biome check .",
        "biome:lint": "biome lint .",
        "lint": "oxlint",
        "format": "bun run biome:format",
        "check": "bun run biome:check && bun run lint"
    }
}
```

## Usage

### Daily Development

```bash
# Format code
bun run biome:format

# Check formatting and linting
bun run biome:check

# Run comprehensive linting
bun lint

# Run all quality checks
bun run check
```

### Pre-commit Workflow

1. **Format code**: `bun run biome:format`
2. **Check linting**: `bun run biome:check`
3. **Run oxlint**: `bun lint`
4. **Run tests**: `bun test`

## Benefits

### Performance

- **Biome**: 35x faster than Prettier, 25x faster than ESLint
- **oxlint**: Rust-based, extremely fast linting
- **Bun**: Fast package management and script execution

### Code Quality

- **Consistent formatting**: Automatic code style enforcement
- **Comprehensive linting**: Multiple rule sets for better code quality
- **TypeScript integration**: Full type checking support

### Developer Experience

- **Fast feedback**: Instant formatting and linting
- **Unified commands**: Simple script interface
- **IDE integration**: VS Code support for real-time feedback

## Migration Notes

### From Prettier + ESLint

1. **Removed**: Prettier configuration files
2. **Replaced**: ESLint with oxlint for performance
3. **Updated**: VS Code settings for Biome integration
4. **Maintained**: Existing code style preferences

### Configuration Updates

- **File size limits**: Increased to 10MB for large generated files
- **Ignore patterns**: Added build and cache directories
- **Code style**: Maintained existing 4-space indentation, single quotes

## VS Code Integration

Install the Biome extension for VS Code:

```json
{
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "[javascript]": {
        "editor.defaultFormatter": "biomejs.biome"
    },
    "[typescript]": {
        "editor.defaultFormatter": "biomejs.biome"
    },
    "[json]": {
        "editor.defaultFormatter": "biomejs.biome"
    }
}
```

## Troubleshooting

### Common Issues

1. **File size errors**: Increase `maxSize` in `biome.json`
2. **Syntax errors**: Check file encoding and syntax
3. **Performance issues**: Add directories to ignore patterns

### Debug Commands

```bash
# Check Biome configuration
bunx @biomejs/biome explain

# Lint specific files
bunx @biomejs/biome check src/

# Format specific files
bunx @biomejs/biome format src/
```

## Future Enhancements

- **Pre-commit hooks**: Husky integration for automatic checks
- **CI/CD integration**: GitHub Actions for automated quality checks
- **Custom rules**: Project-specific linting rules
- **Performance monitoring**: Track tooling performance metrics

## Conclusion

The current tooling setup provides a fast, reliable development experience with:

- **35x faster formatting** than Prettier
- **25x faster linting** than ESLint
- **Unified configuration** for consistency
- **Excellent IDE integration** for real-time feedback

This setup supports VTChat's commitment to code quality while maintaining developer productivity.
