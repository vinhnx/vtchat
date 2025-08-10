#!/usr/bin/env node

/**
 * Comprehensive test script for the database maintenance system
 * Tests service worker, database optimizations, and maintenance endpoints
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const { log } = require("@repo/shared/logger");

const BASE_URL = process.env.BASE_URL || "https://vtchat.io.vn";
const TEST_TIMEOUT = 30000; // 30 seconds per test

// ANSI color codes for output


function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: "GET",
            timeout: TEST_TIMEOUT,
            headers: {
                "User-Agent": "Maintenance-System-Test",
                ...options.headers,
            },
            ...options,
        };

        const req = https.request(url, requestOptions, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        json: null,
                    };

                    // Try to parse JSON if content-type suggests it
                    if (res.headers["content-type"]?.includes("application/json")) {
                        response.json = JSON.parse(data);
                    }

                    resolve(response);
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        json: null,
                        parseError: error.message,
                    });
                }
            });
        });

        req.on("error", reject);
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timeout"));
        });

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

// Test suite definitions
const tests = [
    {
        name: "Health Check",
        description: "Verify application health endpoint",
        async run() {
            const response = await makeRequest(`${BASE_URL}/api/health`);

            if (response.statusCode !== 200) {
                throw new Error(`Health check failed with status ${response.statusCode}`);
            }

            const health = response.json;
            if (!health || !health.healthy) {
                throw new Error("Application reports unhealthy status");
            }

            return { status: health, timestamp: health.timestamp };
        },
    },

    {
        name: "Service Worker Registration",
        description: "Check if service worker is properly served",
        async run() {
            const response = await makeRequest(`${BASE_URL}/sw.js`);

            if (response.statusCode !== 200) {
                throw new Error(`Service worker not accessible: ${response.statusCode}`);
            }

            if (!response.data.includes("self.addEventListener")) {
                throw new Error("Service worker does not contain expected event listeners");
            }

            return {
                size: response.data.length,
                hasInstallListener: response.data.includes("install"),
                hasFetchListener: response.data.includes("fetch"),
                hasActivateListener: response.data.includes("activate"),
            };
        },
    },

    {
        name: "Database Maintenance Endpoint",
        description: "Test database maintenance API endpoint",
        async run() {
            const cronSecret = process.env.CRON_SECRET_TOKEN;
            if (!cronSecret) {
                throw new Error("CRON_SECRET_TOKEN not available for testing");
            }

            const response = await makeRequest(`${BASE_URL}/api/cron/database-maintenance`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${cronSecret}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.statusCode !== 200) {
                throw new Error(`Maintenance endpoint failed: ${response.statusCode}`);
            }

            const result = response.json;
            if (!result || !result.success) {
                throw new Error("Maintenance endpoint did not report success");
            }

            return {
                duration: result.duration,
                operations: result.operations?.length || 0,
                health: result.health,
            };
        },
    },

    {
        name: "Metrics Collection",
        description: "Test metrics collection endpoint",
        async run() {
            const testMetrics = {
                timestamp: new Date().toISOString(),
                maintenance_type: "hourly",
                status: "success",
                duration_ms: 5000,
                attempt: 1,
                error: null,
                environment: "test",
            };

            const response = await makeRequest(`${BASE_URL}/api/metrics/database-maintenance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testMetrics),
            });

            if (response.statusCode !== 200) {
                throw new Error(`Metrics endpoint failed: ${response.statusCode}`);
            }

            const result = response.json;
            if (!result || !result.success) {
                throw new Error("Metrics endpoint did not accept test data");
            }

            return { stored: result.stored, count: result.metrics_count };
        },
    },

    {
        name: "Metrics Retrieval",
        description: "Test metrics retrieval and dashboard data",
        async run() {
            const response = await makeRequest(
                `${BASE_URL}/api/admin/database-maintenance-dashboard?hours=1`,
            );

            if (response.statusCode !== 200) {
                throw new Error(`Dashboard endpoint failed: ${response.statusCode}`);
            }

            const result = response.json;
            if (!result || !result.success) {
                throw new Error("Dashboard endpoint did not return success");
            }

            const dashboard = result.dashboard;
            return {
                health_status: dashboard.overview.health_status,
                total_runs: dashboard.overview.total_runs,
                success_rate: dashboard.overview.success_rate,
                alerts_count: dashboard.alerts.length,
            };
        },
    },

    {
        name: "Authentication Check",
        description: "Verify authentication system is working",
        async run() {
            const response = await makeRequest(`${BASE_URL}/api/auth/session`);

            // Should return 401 or proper session data structure
            if (response.statusCode !== 401 && response.statusCode !== 200) {
                throw new Error(`Unexpected auth response: ${response.statusCode}`);
            }

            return {
                accessible: true,
                requires_auth: response.statusCode === 401,
                has_session: response.statusCode === 200,
            };
        },
    },

    {
        name: "Static Assets",
        description: "Check if critical static assets are served properly",
        async run() {
            const assets = ["/_next/static/chunks/pages/_app.js", "/favicon.ico"];

            const results = {};

            for (const asset of assets) {
                try {
                    const response = await makeRequest(`${BASE_URL}${asset}`);
                    results[asset] = {
                        status: response.statusCode,
                        size: response.data.length,
                        cacheable: !!response.headers["cache-control"],
                    };
                } catch (error) {
                    results[asset] = { error: error.message };
                }
            }

            return results;
        },
    },
];

// Test runner
async function runTests() {
    log.info("🚀 Starting Database Maintenance System Test Suite");
    log.info(`📍 Testing against: ${BASE_URL}`);
    log.info("");

    const results = {
        total: tests.length,
        passed: 0,
        failed: 0,
        details: [],
    };

    for (const test of tests) {
        const startTime = Date.now();
        log.info(`⏳ Running: ${test.name}`);

        try {
            const result = await test.run();
            const duration = Date.now() - startTime;

            log.info(`✅ ${test.name} - Passed (${duration}ms)`);
            if (result && Object.keys(result).length > 0) {
                log.info(`   📊 ${JSON.stringify(result)}`);
            }

            results.passed++;
            results.details.push({
                name: test.name,
                status: "passed",
                duration,
                result,
            });
        } catch (error) {
            const duration = Date.now() - startTime;

            log.error(`❌ ${test.name} - Failed (${duration}ms)`);
            log.error(`   💥 ${error.message}`);

            results.failed++;
            results.details.push({
                name: test.name,
                status: "failed",
                duration,
                error: error.message,
            });
        }

    log.info("");
    }

    // Summary
    log.info("");

    // Summary
    log.info("📋 Test Summary");
    log.info(`✅ Passed: ${results.passed}/${results.total}`);
    log.info(`❌ Failed: ${results.failed}/${results.total}`);
    log.info(`⏱️  Total Duration: ${results.details.reduce((sum, t) => sum + t.duration, 0)}ms`);

    // Write detailed results to file
    const reportPath = path.join(__dirname, "..", "maintenance-test-results.json");
    fs.writeFileSync(
        reportPath,
        JSON.stringify(
            {
                timestamp: new Date().toISOString(),
                base_url: BASE_URL,
                ...results,
            },
            null,
            2,
        ),
    );

    log.info(`📄 Detailed results saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Error handling
process.on("unhandledRejection", (reason, _promise) => {
    log.error(`💥 Unhandled Promise Rejection: ${reason}`);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    log.error(`💥 Uncaught Exception: ${error.message}`);
    process.exit(1);
});

// Run the tests
if (require.main === module) {
    runTests();
}

module.exports = { runTests, tests };
