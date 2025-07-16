import { createOpenAI } from "@ai-sdk/openai";

export const moonshot = createOpenAI({
    baseURL: process.env.MOONSHOT_API_BASE_URL || "https://api.moonshot.cn/v1",
    apiKey: process.env.MOONSHOT_API_KEY,
});
