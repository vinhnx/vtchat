import { createTask } from "@repo/orchestrator";
import { getVTPlusFeatureFromChatMode } from "@repo/shared/utils/access-control";
import { z } from "zod";
import { ModelEnum } from "../../models";
import type { WorkflowContextSchema, WorkflowEventSchema } from "../flow";
import {
    generateObject,
    getHumanizedDate,
    handleError,
    selectAvailableModel,
    sendEvents,
} from "../utils";

const ClarificationResponseSchema = z.object({
    needsClarification: z.boolean(),
    reasoning: z.string().optional(),
    clarifyingQuestion: z
        .object({
            question: z.string(),
            choiceType: z.enum(["multiple", "single"]),
            options: z.array(z.string()).min(1).max(3),
        })
        .optional(),
    refinedQuery: z.string().optional(),
});

export const refineQueryTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: "refine-query",
    execute: async ({ events, context, signal }) => {
        const messages = context?.get("messages") || [];
        const question = context?.get("question") || "";
        const { updateStatus, updateAnswer, updateObject } = sendEvents(events);

        const prompt = `You are a professional research assistant for DEEP RESEARCH - a comprehensive, multi-step analysis workflow.

                CURRENT DATE: ${getHumanizedDate()}

                CONTEXT: You are the first stage of Deep Research, which differs from Pro Search:

                **Deep Research Workflow**: refine-query → planner → web-search → analysis → writer
                - For complex topics requiring comprehensive analysis
                - Multi-angle investigation with strategic planning
                - Synthesis of findings into detailed reports
                - Examples: "impact of AI on future employment", "comprehensive analysis of renewable energy adoption"

                **Pro Search** (not your workflow): direct web-search
                - For quick factual lookups and current information
                - Examples: "current Bitcoin price", "weather in Tokyo today"

                Your task: Determine if the query needs clarification before proceeding with Deep Research.

                CRITICAL INSTRUCTION: BE EXTREMELY AGGRESSIVE about proceeding with Deep Research. Even broad topics can be turned into comprehensive research projects.

                BIAS: 95% of queries should proceed WITHOUT clarification. Only ask for clarification if IMPOSSIBLY vague.

                For well-formed queries (DEFAULT - 95% of cases):
                - Return needsClarification: false
                - Provide a refinedQuery optimized for comprehensive research
                - Transform broad topics into multi-angle research projects
                - Enhance scope, specificity, and research angles

                For impossibly vague queries (EXTREMELY RARE - only when literally no research direction is possible):
                - Return needsClarification: true
                - Provide reasoning explaining the ambiguity
                - Include clarifying questions with 2-3 specific options
                - The choiceType should be single or multiple based on the question

                Examples of Deep Research queries that DON'T need clarification (PROCEED WITH ALL OF THESE):
                - "who is Albert Einstein?" -> comprehensive biography, scientific contributions, historical context, impact on modern physics
                - "explain large language models" → comprehensive analysis of architecture, training, applications, limitations, ethical considerations
                - "artificial intelligence" → multi-angle research on current state, applications, future implications, ethical concerns
                - "climate change" → comprehensive analysis of causes, effects, mitigation strategies, global responses
                - "cryptocurrency" → deep dive into technology, economics, regulation, future prospects
                - "impact of remote work on urban planning and city development"
                - "comprehensive analysis of CRISPR gene editing ethical implications"
                - "economic and social effects of cryptocurrency adoption in developing countries"
                - "climate change mitigation strategies and their effectiveness"
                - "AI safety research progress and remaining challenges"
                - "renewable energy transition challenges in Europe"
                - "machine learning" → comprehensive research on algorithms, applications, challenges, future directions
                - "blockchain technology" → deep analysis of technical foundations, use cases, limitations, future potential

                Examples that DO need clarification (ONLY THESE TYPES - extremely vague with no research direction):
                - "help me with my project" (no topic specified)
                - "research something interesting" (no topic specified)
                - "what should I write about?" (no topic specified)
                - "I need help" (no topic specified)

                Query Enhancement Guidelines for broad topics:
                - Transform single concepts into multi-dimensional research projects
                - Add comprehensive research angles (technical, economic, social, ethical, historical, future implications)
                - Include scope indicators (global perspective, industry analysis, current state and future trends)
                - Suggest comparative and evolutionary elements
                - Add temporal context when relevant (e.g., "recent developments", "2024 trends", "historical evolution")

                EXAMPLES OF QUERY ENHANCEMENT:
                - "explain large language models" → "Comprehensive analysis of large language models: technical architecture, training methodologies, current applications, limitations, ethical considerations, and future implications for society and technology"
                - "artificial intelligence" → "Deep research on artificial intelligence: current state of technology, major applications across industries, societal impacts, ethical considerations, regulatory challenges, and future development trends"
                - "climate change" → "Comprehensive analysis of climate change: scientific evidence, causes and effects, global mitigation strategies, policy responses, economic implications, and future projections"

                If the user has already responded to previous clarifying questions:
                - Return needsClarification: false
                - Provide a refinedQuery incorporating their response

                `;

        const byokKeys = context?.get("apiKeys");

        // Select an appropriate model based on available API keys
        const selectedModel = selectAvailableModel(ModelEnum.GEMINI_2_5_FLASH, byokKeys);

        // Determine VT+ feature based on mode
        const chatMode = context?.get("mode");
        const vtplusFeature = getVTPlusFeatureFromChatMode(chatMode);

        const object = await generateObject({
            prompt,
            model: selectedModel,
            schema: ClarificationResponseSchema,
            messages: messages as any,
            signal,
            byokKeys,
            thinkingMode: context?.get("thinkingMode"),
            userTier: context?.get("userTier"),
            userId: context?.get("userId"),
            feature: vtplusFeature || undefined,
        });

        if (object?.needsClarification) {
            updateAnswer({
                text: object.reasoning,
                finalText: object.reasoning,
                status: "COMPLETED",
            });
            object?.clarifyingQuestion &&
                updateObject({
                    clarifyingQuestion: object?.clarifyingQuestion,
                });

            updateStatus("COMPLETED");
        } else {
            context?.update("question", (_current) => object?.refinedQuery || question);
        }

        return {
            needsClarification: object?.needsClarification,
            refinedQuery: object?.refinedQuery || question,
        };
    },
    onError: handleError,
    route: ({ result }) => {
        if (result?.needsClarification === true) {
            return "end";
        }

        return "planner";
    },
});
