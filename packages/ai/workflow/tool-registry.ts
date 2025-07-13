import { UserTier, type UserTierType } from "@repo/shared/constants/user-tiers";

export type ToolTier = UserTierType;

export interface ToolMeta {
    id: string;
    name: string;
    description: string;
    tier: ToolTier;
    activate: (context: any) => void;
    keywords: string[];
    examples: string[];
}

// VTChat tool registry with semantic descriptions
export const TOOL_REGISTRY: ToolMeta[] = [
    {
        id: "web-search",
        name: "Web Search",
        description:
            "Search the internet for current information, news, real-time data, and web pages to cite as sources",
        tier: UserTier.FREE,
        activate: (context) => context.set("webSearch", true),
        keywords: [
            "search",
            "web",
            "internet",
            "google",
            "find",
            "lookup",
            "current",
            "latest",
            "news",
            "today",
            "now",
            "recent",
            "live",
            "realtime",
            "check",
            "verify",
        ],
        examples: [
            "search for latest AI news",
            "find current weather in Tokyo",
            "what's the latest on Tesla stock",
            "look up recent developments in quantum computing",
            "check current crypto prices",
            "find news about SpaceX launch today",
            "what's happening with the election",
            "search for restaurant reviews near me",
        ],
    },
    {
        id: "calculator",
        name: "Math Calculator",
        description:
            "Perform mathematical calculations, solve equations, arithmetic operations, trigonometry, and financial calculations",
        tier: UserTier.FREE,
        activate: (context) => context.set("mathCalculator", true),
        keywords: [
            "calculate",
            "math",
            "compute",
            "solve",
            "equation",
            "formula",
            "arithmetic",
            "add",
            "subtract",
            "multiply",
            "divide",
            "percentage",
            "percent",
            "interest",
            "loan",
            "mortgage",
            "statistics",
            "probability",
            "geometry",
            "trigonometry",
            "logarithm",
        ],
        examples: [
            "calculate 15% of 1000",
            "solve this quadratic equation",
            "what is the compound interest on $5000 at 3% for 5 years",
            "compute the area of a circle with radius 10",
            "calculate mortgage payments for $300k at 4.5%",
            "what's the square root of 144",
            "solve for x: 2x + 5 = 15",
            "calculate standard deviation of these numbers",
        ],
    },
    {
        id: "charts",
        name: "Charts & Visualization",
        description:
            "Generate bar charts, line graphs, pie charts, scatter plots and other data visualizations",
        tier: UserTier.FREE,
        activate: (context) => context.set("charts", true),
        keywords: [
            "chart",
            "graph",
            "visualize",
            "plot",
            "diagram",
            "visual",
            "display",
            "bar",
            "line",
            "pie",
            "scatter",
            "histogram",
            "dashboard",
            "analytics",
        ],
        examples: [
            "create a bar chart of sales data",
            "visualize these quarterly results",
            "make a pie chart of budget allocation",
            "plot this time series data",
            "create a scatter plot of correlation",
            "visualize the survey results",
            "make a line graph of stock prices",
            "create a dashboard for this data",
        ],
    },
    {
        id: "document-processing",
        name: "Document Processing",
        description:
            "Parse and analyze PDF, DOC, DOCX, TXT, MD files to extract text content for Q&A and summarization",
        tier: UserTier.FREE, // Available to all logged-in users
        activate: (context) => context.set("documentProcessing", true),
        keywords: [
            "upload",
            "document",
            "pdf",
            "word",
            "docx",
            "txt",
            "markdown",
            "parse",
            "analyze",
            "summarize",
            "extract",
            "file",
            "contract",
            "resume",
            "report",
        ],
        examples: [
            "analyze this PDF document",
            "summarize this contract",
            "what does this report say",
            "extract key points from this file",
            "parse the uploaded document",
            "review this PDF",
            "what are the main findings",
            "analyze the attached file",
        ],
    },
    {
        id: "structured-output",
        name: "Structured Data Extraction",
        description:
            "Extract structured JSON data, tables, and key-value pairs from documents using advanced parsing",
        tier: UserTier.FREE, // Available to all logged-in users, but requires Gemini models
        activate: (context) => context.set("structuredOutput", true),
        keywords: [
            "extract",
            "structured",
            "table",
            "json",
            "fields",
            "schema",
            "key",
            "value",
            "data",
            "format",
            "parse",
            "invoice",
            "form",
            "database",
        ],
        examples: [
            "extract structured data from this document",
            "convert this to JSON format",
            "extract invoice fields",
            "turn this resume into structured data",
            "create a table from this information",
            "extract key-value pairs",
            "parse form data",
            "structure this information",
        ],
    },
    {
        id: "vision-analysis",
        name: "Image & Visual Analysis",
        description:
            "Analyze images, photos, diagrams, charts, and visual content to extract insights and descriptions",
        tier: UserTier.FREE, // Available to all logged-in users with multimodal models
        activate: (context) => context.set("visionAnalysis", true),
        keywords: [
            "image",
            "photo",
            "picture",
            "diagram",
            "chart",
            "visual",
            "screenshot",
            "analyze",
            "describe",
            "vision",
            "OCR",
            "read",
            "text",
            "graph",
        ],
        examples: [
            "analyze this image",
            "describe this photo",
            "what does this diagram show",
            "read the text in this image",
            "explain this chart",
            "what is in this picture",
            "analyze this screenshot",
            "extract data from this graph",
        ],
    },
];

/**
 * Get tool by ID
 */
export function getToolById(id: string): ToolMeta | undefined {
    return TOOL_REGISTRY.find((tool) => tool.id === id);
}

/**
 * Get available tools for user tier
 */
export function getAvailableTools(userTier: ToolTier = UserTier.FREE): ToolMeta[] {
    if (userTier === UserTier.PLUS) {
        return TOOL_REGISTRY;
    }
    return TOOL_REGISTRY.filter((tool) => tool.tier === UserTier.FREE);
}

/**
 * Check if user has access to a specific tool
 */
export function hasToolAccess(toolId: string, userTier: ToolTier = UserTier.FREE): boolean {
    const tool = getToolById(toolId);
    if (!tool) return false;

    if (tool.tier === UserTier.PLUS && userTier !== UserTier.PLUS) {
        return false;
    }

    return true;
}

/**
 * Get all tool descriptions for embedding generation
 */
export function getAllToolDescriptions(): { id: string; text: string }[] {
    return TOOL_REGISTRY.map((tool) => ({
        id: tool.id,
        text: [tool.description, ...tool.keywords, ...tool.examples].join(" "),
    }));
}
