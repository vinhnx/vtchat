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
import { createContext, createTypedEventEmitter, WorkflowBuilder, } from "@repo/orchestrator";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/logger";
import { analysisTask, completionTask, geminiWebSearchTask, modeRoutingTask, plannerTask, refineQueryTask, reflectorTask, suggestionsTask, writerTask, } from "./tasks";
export var runWorkflow = function (_a) {
    var mode = _a.mode, question = _a.question, threadId = _a.threadId, threadItemId = _a.threadItemId, messages = _a.messages, _b = _a.config, config = _b === void 0 ? {} : _b, signal = _a.signal, _c = _a.webSearch, webSearch = _c === void 0 ? false : _c, _d = _a.mathCalculator, mathCalculator = _d === void 0 ? false : _d, _e = _a.charts, charts = _e === void 0 ? false : _e, _f = _a.codeSandbox, codeSandbox = _f === void 0 ? false : _f, _g = _a.showSuggestions, showSuggestions = _g === void 0 ? false : _g, onFinish = _a.onFinish, customInstructions = _a.customInstructions, gl = _a.gl, apiKeys = _a.apiKeys, thinkingMode = _a.thinkingMode, _h = _a.userTier, userTier = _h === void 0 ? UserTier.FREE : _h, userId = _a.userId;
    log.info("🔥 runWorkflow called with params:", {
        webSearch: webSearch,
        mathCalculator: mathCalculator,
        charts: charts,
    });
    // Set default values for config
    var workflowConfig = __assign({ maxIterations: 2, timeoutMs: 480000 }, config);
    // Create typed event emitter with the proper type
    var events = createTypedEventEmitter({
        steps: {},
        toolCalls: [],
        toolResults: [],
        answer: {
            text: "",
            status: "PENDING",
        },
        sources: [],
        suggestions: [],
        object: {},
        error: {
            error: "",
            status: "PENDING",
        },
        status: "PENDING",
    });
    log.info("🌟 Workflow context created with:", {
        webSearch: webSearch,
        mathCalculator: mathCalculator,
        charts: charts,
    });
    var context = createContext({
        question: question,
        mode: mode,
        webSearch: webSearch,
        mathCalculator: mathCalculator,
        charts: charts, // Charts now available to all users
        codeSandbox: codeSandbox, // Sandbox feature
        codeSandbox: false, // Sandbox is disabled by default
        search_queries: [],
        messages: messages,
        goals: [],
        queries: [],
        steps: [],
        gl: gl,
        customInstructions: customInstructions,
        sources: [],
        summaries: [],
        answer: undefined,
        threadId: threadId,
        threadItemId: threadItemId,
        showSuggestions: showSuggestions,
        onFinish: onFinish,
        apiKeys: apiKeys,
        thinkingMode: thinkingMode,
        userTier: userTier,
        userId: userId,
    });
    // Use the typed builder
    var builder = new WorkflowBuilder(threadId, {
        initialEventState: events.getAllState(),
        events: events,
        context: context,
        config: workflowConfig,
        signal: signal,
    });
    builder.addTasks([
        plannerTask,
        geminiWebSearchTask,
        reflectorTask,
        analysisTask,
        writerTask,
        refineQueryTask,
        modeRoutingTask,
        completionTask,
        suggestionsTask,
    ]);
    return builder.build();
};
