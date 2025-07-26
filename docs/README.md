# VT (VTChat) Documentation

## 📋 Overview

VT is a production-ready, privacy-focused AI chat application with security and comprehensive AI capabilities. This documentation provides complete guides for deployment, development, and feature implementation.

## 🚀 Quick Start

### For Users

- **Live Application**: [vtchat.io.vn](https://vtchat.io.vn)
- **Features**: [Complete Feature List](FEATURES.md)
- **Help Center**: [help-center/](help-center/)

### For Developers

- **Architecture**: [System Architecture Overview](ARCHITECTURE.md)
- **Development Guidelines**: [../AGENT.md](../AGENT.md)
- **Local Setup**: [local-development-setup.md](local-development-setup.md)

### For Deployment

- **Production Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Production Checklist**: [production-deployment-checklist.md](production-deployment-checklist.md)
- **Fly.io Guide**: [fly-deployment-guide.md](fly-deployment-guide.md)

## 📚 Core Documentation

### 🎯 Production Ready

- **[Features Overview](FEATURES.md)** - Complete feature list and capabilities
- **[Architecture](ARCHITECTURE.md)** - System design and technology stack
- **[Security Guide](SECURITY.md)** - Comprehensive security implementation
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Final Release Notes](FINAL-RELEASE-NOTES.md)** - v1.0 production achievements

### 🔧 Development

- **[Database Setup](DATABASE_SETUP.md)** - Database configuration and migrations
- **[Local Development](local-development-setup.md)** - Development environment setup
- **[Testing Setup](vitest-testing-setup.md)** - Comprehensive testing framework
- **[Performance Report](production-readiness-report.md)** - Production readiness metrics

### 🛡️ Security & Privacy

- **[Arcjet Security](guides/arcjet-security.md)** - Application security implementation
- **[Logging Best Practices](guides/logging-best-practices.md)** - Structured logging with PII redaction
- **[Privacy Monitoring](privacy-monitoring.md)** - Privacy-safe analytics approach

### 💳 Subscription & Payment

- **[Subscription System](subscription-system.md)** - Plan management and feature gating
- **[Creem.io Webhook Setup](CREEM_WEBHOOK_SETUP.md)** - Payment webhook configuration
- **[OAuth Setup](OAUTH_SETUP.md)** - Authentication provider configuration

## 🎨 UI & Experience

### Design System

- **[Shadcn UI Migration](shadcn-ui-migration-completion.md)** - Complete design system integration
- **[Theming Update](shadcn-theming-update.md)** - Global theming implementation
- **[UI Audit Report](ui-audit-report.md)** - User interface improvements

### Features

- **[Reasoning Mode](reasoning-mode-implementation.md)** - AI reasoning capabilities
- **[Document Upload](document-upload-feature.md)** - File processing features
- **[Structured Output](structured-output-implementation-summary.md)** - JSON extraction capabilities

## 🧪 Testing & Quality

### Testing Framework

- **[Vitest Setup](vitest-testing-setup.md)** - Modern testing configuration
- **[Testing Strategies](testing/)** - Feature-specific testing approaches
- **[Performance Testing](testing/rag-feature-testing.md)** - Performance validation

### Quality Assurance

- **Production Readiness**: 95% complete with comprehensive quality checks
- **Zero TypeScript Errors**: Full type safety maintained
- **Performance Optimized**: 87% faster compilation, optimized bundle size

## 🚀 Production Status

### ✅ Production Ready Features

- **Complete AI Integration**: Multi-provider support with reasoning mode
- **Security Hardened**: Arcjet protection with Better Auth integration
- **Payment Processing**: Creem.io integration with customer portal
- **Performance Optimized**: 87% faster builds, optimized database queries
- **Mobile Responsive**: Complete Shadcn UI integration

### 📊 Performance Metrics

| Metric            | Before   | After | Improvement   |
| ----------------- | -------- | ----- | ------------- |
| Bundle Size       | 456kB    | 436kB | -4.4%         |
| Compilation Speed | 24s      | 3s    | -87%          |
| Auth Performance  | Baseline | +87%  | 87% faster    |
| Database Queries  | Baseline | +75%  | 70-80% faster |

## 🎯 Key Features

### Free Tier (VT_BASE)

- Access to a suite of 9 free AI models, including 5 from the Gemini family (2.5 Flash Lite, 2.5 Flash, 2.5 Pro) and 4 from OpenRouter.
- Advanced calculator with mathematical functions
- Local-first privacy with IndexedDB storage
- security protection
- Basic chat functionality

### Premium Tier (VT_PLUS - $10/month)

- All free features included
- **Reasoning Mode**: AI thinking process transparency
- **Dark Theme**: Premium theming experience
- **Web Search**: Real-time information grounding
- **Document Upload**: PDF/DOC/DOCX processing up to 10MB
- **Structured Extraction**: AI-powered JSON data extraction
- **Personal AI Assistant (RAG)**: Build and query your own personal knowledge base.

## 🏗️ Architecture Highlights

### Modern Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19.0.0, TypeScript, Tailwind CSS, Shadcn UI
- **State**: Zustand + React Query for optimal state management
- **Backend**: Bun runtime, Neon PostgreSQL, Drizzle ORM
- **Auth**: Better Auth with 87% performance improvement
- **Security**: Arcjet protection (rate limiting, bot detection, WAF)
- **Deployment**: Fly.io with Singapore region optimization

### Privacy-First Design

- **Local Storage**: All chat data in browser IndexedDB, never on servers
- **Zero Persistence**: Conversations never leave user's device
- **Thread Isolation**: Complete data separation between users
- **GDPR Compliant**: Privacy-by-design architecture

## 📖 Guides

### Implementation Guides

- **[Arcjet Security](guides/arcjet-security.md)** - Comprehensive security setup
- **[Logging Best Practices](guides/logging-best-practices.md)** - Structured logging with Pino
- **[Premium Components](guides/premium-components.md)** - VT+ exclusive features

### Operational Guides

- **[Production Monitoring](production-monitoring-setup.md)** - Error tracking and metrics
- **[DNS Configuration](dns-configuration-guide.md)** - Domain setup guide
- **[Fly.io Optimization](fly-optimization-guide.md)** - Performance tuning

## 🔗 External Resources

### Development Tools

- **[Bun Documentation](https://bun.sh/docs)** - JavaScript runtime and package manager
- **[Turborepo Guide](https://turbo.build/repo/docs)** - Monorepo management
- **[Next.js 15 Docs](https://nextjs.org/docs)** - App Router and React Server Components

### Integrations

- **[Better Auth](https://better-auth.com)** - Modern authentication
- **[Arcjet](https://arcjet.com)** - Application security platform
- **[Creem.io](https://creem.io)** - Payment processing
- **[Neon](https://neon.tech)** - Serverless PostgreSQL

## 📞 Support

### For Users

- **Help Center**: [help-center/](help-center/) - User guides and FAQ
- **Privacy Policy**: Privacy-first approach documentation
- **Feature Requests**: Feedback and improvement suggestions

### For Developers

- **Development Guidelines**: [../AGENT.md](../AGENT.md)
- **Issue Tracking**: GitHub issues and pull requests
- **Security Reports**: Responsible disclosure process

---

**Status**: ✅ Production Ready | **Version**: v1.0 | **Last Updated**: June 30, 2025

VT (VTChat) represents a complete, production-ready AI chat application that prioritizes user privacy while delivering cutting-edge AI capabilities through an intuitive, modern interface.
