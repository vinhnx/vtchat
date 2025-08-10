/**
 * Content Monitoring Utilities
 *
 * Utilities to detect and prevent AI agents from getting stuck
 * on table generation or other problematic content patterns.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { log } from "@repo/shared/logger";
import { isLikelyTableGeneration } from "../config/formatting-guidelines";
var ContentMonitor = /** @class */ (function () {
    function ContentMonitor(options) {
        if (options === void 0) { options = {}; }
        this.contentHistory = [];
        this.lastCheckTime = 0;
        this.options = __assign({ maxTableIndicators: 15, maxRepetitivePatterns: 5, checkInterval: 1000, onStuckDetected: function (content, issue) {
                log.warn("Content generation issue detected", {
                    issue: issue,
                    contentLength: content.length,
                });
            } }, options);
    }
    /**
     * Check if content shows signs of being stuck on table generation
     */
    ContentMonitor.prototype.checkContent = function (content) {
        var now = Date.now();
        // Rate limit checks
        if (now - this.lastCheckTime < this.options.checkInterval) {
            return { isStuck: false };
        }
        this.lastCheckTime = now;
        // Check for table generation issues
        if (isLikelyTableGeneration(content)) {
            var issue = "Excessive table generation detected";
            this.options.onStuckDetected(content, issue);
            return {
                isStuck: true,
                issue: issue,
                suggestion: "Consider using bullet points, lists, or inline formatting instead of tables",
            };
        }
        // Check for repetitive patterns
        var repetitivePattern = this.detectRepetitivePatterns(content);
        if (repetitivePattern) {
            var issue = "Repetitive pattern detected: ".concat(repetitivePattern);
            this.options.onStuckDetected(content, issue);
            return {
                isStuck: true,
                issue: issue,
                suggestion: "Vary content structure and avoid repetitive formatting",
            };
        }
        // Check for stalled generation (same content repeated)
        if (this.isContentStalled(content)) {
            var issue = "Content generation appears stalled";
            this.options.onStuckDetected(content, issue);
            return {
                isStuck: true,
                issue: issue,
                suggestion: "Try a different approach or simplify the content structure",
            };
        }
        // Store content for history tracking
        this.contentHistory.push(content);
        if (this.contentHistory.length > 10) {
            this.contentHistory.shift();
        }
        return { isStuck: false };
    };
    /**
     * Detect repetitive patterns in content
     */
    ContentMonitor.prototype.detectRepetitivePatterns = function (content) {
        var patterns = [
            /(\|[^|\n]*){4,}/g, // Repeated table cells
            /(^-\s+.*\n){6,}/gm, // Too many bullet points in a row
            /(#{1,6}\s+.*\n){5,}/gm, // Too many headings in a row
            /(\*\*[^*]*\*\*\s*){8,}/g, // Too many bold items
        ];
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var matches = content.match(pattern);
            if (matches && matches.length > 0) {
                return matches[0].substring(0, 50) + "...";
            }
        }
        return null;
    };
    /**
     * Check if content generation has stalled
     */
    ContentMonitor.prototype.isContentStalled = function (content) {
        var _this = this;
        if (this.contentHistory.length < 3) {
            return false;
        }
        // Check if the last few content updates are very similar
        var recent = this.contentHistory.slice(-3);
        var similarities = recent.map(function (prev) { return _this.calculateSimilarity(prev, content); });
        // If content is more than 90% similar to recent versions, it might be stalled
        return similarities.some(function (similarity) { return similarity > 0.9; });
    };
    /**
     * Calculate similarity between two strings
     */
    ContentMonitor.prototype.calculateSimilarity = function (str1, str2) {
        var longer = str1.length > str2.length ? str1 : str2;
        var shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) {
            return 1.0;
        }
        var editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    };
    /**
     * Calculate Levenshtein distance between two strings
     */
    ContentMonitor.prototype.levenshteinDistance = function (str1, str2) {
        var matrix = Array(str2.length + 1)
            .fill(null)
            .map(function () { return Array(str1.length + 1).fill(null); });
        for (var i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }
        for (var j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }
        for (var j = 1; j <= str2.length; j++) {
            for (var i = 1; i <= str1.length; i++) {
                var indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    };
    /**
     * Reset the monitor state
     */
    ContentMonitor.prototype.reset = function () {
        this.contentHistory = [];
        this.lastCheckTime = 0;
    };
    return ContentMonitor;
}());
export { ContentMonitor };
/**
 * Quick utility to check if content needs formatting intervention
 */
export function checkContentForIssues(content) {
    var suggestions = [];
    var needsIntervention = false;
    // Check for table issues
    if (isLikelyTableGeneration(content)) {
        needsIntervention = true;
        suggestions.push("Replace large tables with bullet points or inline formatting");
        suggestions.push("Use structured lists instead of complex tables");
    }
    // Check for excessive formatting
    var boldCount = (content.match(/\*\*[^*]+\*\*/g) || []).length;
    if (boldCount > 20) {
        needsIntervention = true;
        suggestions.push("Reduce excessive bold formatting");
    }
    // Check for too many headings
    var headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
    if (headingCount > 10) {
        needsIntervention = true;
        suggestions.push("Consolidate content under fewer headings");
    }
    return { needsIntervention: needsIntervention, suggestions: suggestions };
}
