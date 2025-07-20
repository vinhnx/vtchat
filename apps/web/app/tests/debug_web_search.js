// Debug script to test web search functionality
import { log } from '@repo/shared/logger';
import { generateObject } from 'ai';
import { getLanguageModel } from '../../packages/ai/providers.ts';
import { ModelEnum } from '../../packages/ai/models.ts';
import { z } from 'zod';

async function testGenerateObject() {
    try {
        log.info({}, 'Testing generateObject with Gemini...');
        
        const model = getLanguageModel(ModelEnum.GEMINI_2_5_PRO);
        log.info({ hasModel: !!model }, 'Model created');
        
        const schema = z.object({
            reasoning: z.string(),
            queries: z.array(z.string()),
        });
        
        const result = await generateObject({
            model,
            schema,
            prompt: 'Generate 2 search queries about TypeScript benefits',
        });
        
        log.info({ result }, 'Result');
    } catch (error) {
        log.error({ error }, 'Error in generateObject');
        log.error({ stack: error.stack }, 'Error stack');
    }
}

testGenerateObject();
