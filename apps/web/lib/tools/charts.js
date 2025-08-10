var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { tool } from "ai";
import { z } from "zod";
var chartDataSchema = z.object({
    name: z.string().describe("Data point label"),
    value: z.number().describe("Data point value"),
});
var multiSeriesDataSchema = z.object({
    name: z.string().describe("Data point label"),
    series1: z.number().describe("First series value"),
    series2: z.number().optional().describe("Second series value"),
    series3: z.number().optional().describe("Third series value"),
});
export var chartTools = function (config) {
    var _a;
    var tools = {
        barChart: tool({
            description: "Create a bar chart with data points. Useful for comparing categorical data or showing distributions.",
            parameters: z.object({
                title: z.string().describe("Chart title"),
                data: z.array(chartDataSchema).describe("Array of data points with name and value"),
                xAxisLabel: z.string().optional().describe("X-axis label"),
                yAxisLabel: z.string().optional().describe("Y-axis label"),
                color: z.string().optional().describe("Chart color theme (blue, red, green, etc.)"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var title = _b.title, data = _b.data, xAxisLabel = _b.xAxisLabel, yAxisLabel = _b.yAxisLabel, _c = _b.color, color = _c === void 0 ? "blue" : _c;
                return __generator(this, function (_d) {
                    return [2 /*return*/, {
                            type: "barChart",
                            title: title,
                            data: data,
                            xAxisLabel: xAxisLabel,
                            yAxisLabel: yAxisLabel,
                            color: color,
                        }];
                });
            }); },
        }),
        lineChart: tool({
            description: "Create a line chart to show trends over time or continuous data. Perfect for time series data.",
            parameters: z.object({
                title: z.string().describe("Chart title"),
                data: z
                    .array(multiSeriesDataSchema)
                    .describe("Array of data points with name and values"),
                xAxisLabel: z.string().optional().describe("X-axis label"),
                yAxisLabel: z.string().optional().describe("Y-axis label"),
                series1Name: z.string().optional().describe("Name for first data series"),
                series2Name: z.string().optional().describe("Name for second data series"),
                series3Name: z.string().optional().describe("Name for third data series"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var title = _b.title, data = _b.data, xAxisLabel = _b.xAxisLabel, yAxisLabel = _b.yAxisLabel, _c = _b.series1Name, series1Name = _c === void 0 ? "Series 1" : _c, series2Name = _b.series2Name, series3Name = _b.series3Name;
                return __generator(this, function (_d) {
                    return [2 /*return*/, {
                            type: "lineChart",
                            title: title,
                            data: data,
                            xAxisLabel: xAxisLabel,
                            yAxisLabel: yAxisLabel,
                            series1Name: series1Name,
                            series2Name: series2Name,
                            series3Name: series3Name,
                        }];
                });
            }); },
        }),
        areaChart: tool({
            description: "Create an area chart to show cumulative totals over time or to emphasize the magnitude of change.",
            parameters: z.object({
                title: z.string().describe("Chart title"),
                data: z
                    .array(multiSeriesDataSchema)
                    .describe("Array of data points with name and values"),
                xAxisLabel: z.string().optional().describe("X-axis label"),
                yAxisLabel: z.string().optional().describe("Y-axis label"),
                series1Name: z.string().optional().describe("Name for first data series"),
                series2Name: z.string().optional().describe("Name for second data series"),
                stacked: z.boolean().optional().describe("Whether to stack the areas"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var title = _b.title, data = _b.data, xAxisLabel = _b.xAxisLabel, yAxisLabel = _b.yAxisLabel, _c = _b.series1Name, series1Name = _c === void 0 ? "Series 1" : _c, series2Name = _b.series2Name, _d = _b.stacked, stacked = _d === void 0 ? false : _d;
                return __generator(this, function (_e) {
                    return [2 /*return*/, {
                            type: "areaChart",
                            title: title,
                            data: data,
                            xAxisLabel: xAxisLabel,
                            yAxisLabel: yAxisLabel,
                            series1Name: series1Name,
                            series2Name: series2Name,
                            stacked: stacked,
                        }];
                });
            }); },
        }),
        pieChart: tool({
            description: "Create a pie chart to show proportions and percentages of a whole. Great for showing distribution of categories.",
            parameters: z.object({
                title: z.string().describe("Chart title"),
                data: z.array(chartDataSchema).describe("Array of data points with name and value"),
                showLabels: z.boolean().optional().describe("Whether to show data labels"),
                showLegend: z.boolean().optional().describe("Whether to show legend"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var title = _b.title, data = _b.data, _c = _b.showLabels, showLabels = _c === void 0 ? true : _c, _d = _b.showLegend, showLegend = _d === void 0 ? true : _d;
                return __generator(this, function (_e) {
                    return [2 /*return*/, {
                            type: "pieChart",
                            title: title,
                            data: data,
                            showLabels: showLabels,
                            showLegend: showLegend,
                        }];
                });
            }); },
        }),
        radarChart: tool({
            description: "Create a radar/spider chart to show multivariate data. Perfect for comparing multiple categories or metrics.",
            parameters: z.object({
                title: z.string().describe("Chart title"),
                data: z
                    .array(z.object({
                    category: z.string().describe("Category name"),
                    value: z.number().describe("Value for this category"),
                    fullMark: z
                        .number()
                        .optional()
                        .describe("Maximum possible value for this category"),
                }))
                    .describe("Array of categories with their values"),
                maxValue: z.number().optional().describe("Maximum value for scaling"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var title = _b.title, data = _b.data, maxValue = _b.maxValue;
                return __generator(this, function (_c) {
                    return [2 /*return*/, {
                            type: "radarChart",
                            title: title,
                            data: data,
                            maxValue: maxValue,
                        }];
                });
            }); },
        }),
    };
    // Filter out excluded tools
    for (var toolName in tools) {
        if ((_a = config === null || config === void 0 ? void 0 : config.excludeTools) === null || _a === void 0 ? void 0 : _a.includes(toolName)) {
            delete tools[toolName];
        }
    }
    return tools;
};
// Helper function to generate sample data
export var generateSampleData = {
    sales: function () { return [
        { name: "Jan", value: 4000 },
        { name: "Feb", value: 3000 },
        { name: "Mar", value: 5000 },
        { name: "Apr", value: 4500 },
        { name: "May", value: 6000 },
        { name: "Jun", value: 5500 },
    ]; },
    multiSeries: function () { return [
        { name: "Jan", series1: 4000, series2: 2400 },
        { name: "Feb", series1: 3000, series2: 1398 },
        { name: "Mar", series1: 5000, series2: 9800 },
        { name: "Apr", series1: 4500, series2: 3908 },
        { name: "May", series1: 6000, series2: 4800 },
        { name: "Jun", series1: 5500, series2: 3800 },
    ]; },
    distribution: function () { return [
        { name: "Desktop", value: 45 },
        { name: "Mobile", value: 35 },
        { name: "Tablet", value: 20 },
    ]; },
    performance: function () { return [
        { category: "Speed", value: 85, fullMark: 100 },
        { category: "Reliability", value: 90, fullMark: 100 },
        { category: "Usability", value: 78, fullMark: 100 },
        { category: "Security", value: 95, fullMark: 100 },
        { category: "Scalability", value: 82, fullMark: 100 },
    ]; },
};
