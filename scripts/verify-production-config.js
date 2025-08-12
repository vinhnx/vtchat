#!/usr/bin/env bun

/**
 * Production Configuration Verification Script
 * Verifies all critical production environment configurations for VT Chat
 */

import { log } from '@repo/shared/logger';
import { existsSync } from 'node:fs';

const CONFIG_VERIFICATION = {
    environment: {
        name: 'Environment Variables',
        checks: [
            { name: 'BETTER_AUTH_SECRET', required: true, type: 'secret' },
            { name: 'BETTER_AUTH_URL', required: true, type: 'url' },
            { name: 'BETTER_AUTH_ENV', required: true, expected: 'production' },
            { name: 'DATABASE_URL', required: true, type: 'url' },
            { name: 'NEXT_PUBLIC_APP_URL', required: true, type: 'url' },
            { name: 'NEXT_PUBLIC_BASE_URL', required: true, type: 'url' },
            { name: 'BASE_URL', required: true, type: 'url' },
            { name: 'NODE_ENV', required: true, expected: 'production' },
        ],
    },
    ai: {
        name: 'AI Service Configuration',
        checks: [
            { name: 'OPENAI_API_KEY', required: false, type: 'secret' },
            { name: 'ANTHROPIC_API_KEY', required: false, type: 'secret' },
            { name: 'GEMINI_API_KEY', required: false, type: 'secret' },
            { name: 'FIREWORKS_API_KEY', required: false, type: 'secret' },
            { name: 'JINA_API_KEY', required: false, type: 'secret' },
        ],
    },
    payment: {
        name: 'Payment Integration',
        checks: [
            { name: 'CREEM_API_KEY', required: false, type: 'secret' },
            { name: 'CREEM_PRODUCT_ID', required: false, type: 'string' },
            { name: 'CREEM_ENVIRONMENT', required: false, expected: 'production' },
            { name: 'CREEM_WEBHOOK_SECRET', required: false, type: 'secret' },
        ],
    },
    oauth: {
        name: 'OAuth Configuration',
        checks: [
            { name: 'GITHUB_CLIENT_ID', required: false, type: 'string' },
            { name: 'GITHUB_CLIENT_SECRET', required: false, type: 'secret' },
            { name: 'GOOGLE_CLIENT_ID', required: false, type: 'string' },
            { name: 'GOOGLE_CLIENT_SECRET', required: false, type: 'secret' },
        ],
    },
    monitoring: {
        name: 'Monitoring & Analytics',
        checks: [
            { name: 'NEXT_PUBLIC_HOTJAR_SITE_ID', required: false, type: 'string' },
            { name: 'NEXT_PUBLIC_HOTJAR_VERSION', required: false, type: 'string' },
            { name: 'LOG_LEVEL', required: false, type: 'string' },
        ],
    },
};

class ProductionVerifier {
    constructor() {
        this.results = {};
        this.errors = [];
        this.warnings = [];
    }

    checkEnvironmentVariable(name, config) {
        const value = process.env[name];
        const result = {
            name,
            value: value ? (config.type === 'secret' ? '[HIDDEN]' : value) : null,
            status: 'missing',
            message: '',
            required: config.required,
        };

        if (value) {
            if (config.expected && value !== config.expected) {
                result.status = 'warning';
                result.message = `Expected '${config.expected}', got '${value}'`;
                this.warnings.push(`${name} has unexpected value: ${value}`);
            } else if (config.type === 'url' && !this.isValidUrl(value)) {
                result.status = 'error';
                result.message = 'Invalid URL format';
                this.errors.push(`${name} has invalid URL format: ${value}`);
            } else if (config.type === 'secret' && value.length < 8) {
                result.status = 'warning';
                result.message = 'Secret appears too short';
                this.warnings.push(`${name} appears to be too short for a secure secret`);
            } else {
                result.status = 'success';
                result.message = 'Valid';
            }
        } else {
            result.status = config.required ? 'error' : 'warning';
            result.message = config.required
                ? 'Required variable missing'
                : 'Optional variable not set';
            if (config.required) {
                this.errors.push(`${name} is required but not set`);
            } else {
                this.warnings.push(`${name} is optional but not set`);
            }
        }

        return result;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            log.debug({ error: error.message }, 'URL validation failed');
            return false;
        }
    }

    async checkDatabaseConnection() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return {
                status: 'error',
                message: 'DATABASE_URL not set',
            };
        }

        try {
            // Try to connect to database
            const { drizzle } = await import('@/lib/database');
            // Simple query to test connection
            await drizzle.execute('SELECT 1');
            return {
                status: 'success',
                message: 'Database connection successful',
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Database connection failed: ${error.message}`,
            };
        }
    }

    async checkCreemConnection() {
        const apiKey = process.env.CREEM_API_KEY;
        if (!apiKey) {
            return {
                status: 'warning',
                message: 'Creem API key not configured (payment disabled)',
            };
        }

        try {
            // Test Creem API connection
            const response = await fetch('https://api.creem.io/v1/health', {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                return {
                    status: 'success',
                    message: 'Creem API connection successful',
                };
            }
            return {
                status: 'error',
                message: `Creem API returned: ${response.status}`,
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Creem API connection failed: ${error.message}`,
            };
        }
    }

    checkFlyConfiguration() {
        const flyConfig = {
            productionFile: existsSync('fly.production.toml'),
            developmentFile: existsSync('fly.toml'),
            healthEndpoint: existsSync('apps/web/app/api/health/route.ts'),
        };

        const issues = [];
        if (!flyConfig.productionFile) {
            issues.push('fly.production.toml missing');
        }
        if (!flyConfig.healthEndpoint) {
            issues.push('Health check endpoint missing');
        }

        return {
            status: issues.length === 0 ? 'success' : 'error',
            message: issues.length === 0
                ? 'Fly.io configuration valid'
                : `Issues: ${issues.join(', ')}`,
            details: flyConfig,
        };
    }

    async verifyAll() {
        console.log('🔍 Verifying Production Configuration...\n');
        log.info('Starting production configuration verification');

        // Check environment variables
        for (const [category, config] of Object.entries(CONFIG_VERIFICATION)) {
            this.results[category] = {
                name: config.name,
                checks: config.checks.map((check) =>
                    this.checkEnvironmentVariable(check.name, check)
                ),
            };
        }
        log.info('Environment variables checked');

        // Check external connections
        console.log('🔌 Testing External Connections...\n');
        log.info('Testing external connections');

        this.results.database = await this.checkDatabaseConnection();
        this.results.creem = await this.checkCreemConnection();
        this.results.fly = this.checkFlyConfiguration();
        log.info('External connections tested');

        return this.generateReport();
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'unknown',
            status: this.errors.length === 0 ? 'ready' : 'not-ready',
            summary: {
                errors: this.errors.length,
                warnings: this.warnings.length,
                total_checks: Object.values(this.results).reduce((acc, result) => {
                    return acc + (result.checks ? result.checks.length : 1);
                }, 0),
            },
            results: this.results,
            errors: this.errors,
            warnings: this.warnings,
        };

        this.printReport(report);
        log.info(
            {
                status: report.status,
                errors: report.summary.errors,
                warnings: report.summary.warnings,
                totalChecks: report.summary.total_checks,
            },
            'Production configuration verification completed',
        );
        return report;
    }

    printReport(report) {
        console.log('# 🚀 Production Configuration Verification Report\n');
        console.log(`**Generated:** ${report.timestamp}`);
        console.log(`**Environment:** ${report.environment}`);
        console.log(`**Status:** ${report.status === 'ready' ? '✅ READY' : '❌ NOT READY'}\n`);

        console.log('## Summary\n');
        console.log(`- **Errors:** ${report.summary.errors}`);
        console.log(`- **Warnings:** ${report.summary.warnings}`);
        console.log(`- **Total Checks:** ${report.summary.total_checks}\n`);

        // Environment Variables
        for (const [category, result] of Object.entries(this.results)) {
            if (result.checks) {
                console.log(`## ${result.name}\n`);
                for (const check of result.checks) {
                    const icon = check.status === 'success'
                        ? '✅'
                        : check.status === 'error'
                        ? '❌'
                        : '⚠️';
                    const req = check.required ? '(Required)' : '(Optional)';
                    console.log(`${icon} **${check.name}** ${req}: ${check.message}`);
                }
                console.log('');
            } else {
                // External connections
                const icon = result.status === 'success'
                    ? '✅'
                    : result.status === 'error'
                    ? '❌'
                    : '⚠️';
                console.log(
                    `## ${category.charAt(0).toUpperCase() + category.slice(1)} Connection\n`,
                );
                console.log(`${icon} **Status**: ${result.message}\n`);
            }
        }

        if (report.errors.length > 0) {
            console.log('## ❌ Critical Issues\n');
            report.errors.forEach((error) => console.log(`- ${error}`));
            console.log('');
        }

        if (report.warnings.length > 0) {
            console.log('## ⚠️ Warnings\n');
            report.warnings.forEach((warning) => console.log(`- ${warning}`));
            console.log('');
        }

        console.log('## Next Steps\n');
        if (report.status === 'ready') {
            console.log('✅ Configuration is ready for production deployment!');
        } else {
            console.log('❌ Fix critical issues before deploying to production.');
            console.log('- Set all required environment variables');
            console.log('- Verify database connectivity');
            console.log('- Test external API connections');
        }
    }
}

// Run verification if script is executed directly
if (import.meta.main) {
    const verifier = new ProductionVerifier();
    const report = await verifier.verifyAll();

    // Exit with error code if not ready
    if (report.status !== 'ready') {
        process.exit(1);
    }
}

export { ProductionVerifier };
