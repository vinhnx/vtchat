'use server';

import type { ApiKeys } from '@repo/common/store';
import type { EmbeddingModel } from '@repo/shared/config/embedding-models';
import { log } from '@repo/shared/logger';
import { z } from 'zod';
import { secureContentForEmbedding } from '@/lib/utils/content-security';
import { generateEmbeddings } from '../ai/embedding';
import { auth } from '../auth-server';
import { db } from '../database';
import { embeddings, resources } from '../database/schema';


// Schema for validating resource input
const createResourceSchema = z.object({
    content: z.string().min(1, 'Content is required'),
});

export type NewResourceParams = z.infer<typeof createResourceSchema>;

export const createResource = async (
    input: NewResourceParams,
    apiKeys: ApiKeys,
    embeddingModel?: EmbeddingModel
) => {
    try {
        // Get the current user
        const session = await auth.api.getSession({
            headers: await import('next/headers').then((m) => m.headers()),
        });

        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        const { content } = createResourceSchema.parse(input);

        // Create the resource
        const [resource] = await db
            .insert(resources)
            .values({
                content,
                userId: session.user.id,
            })
            .returning();

        // Generate embeddings for the content
        const embeddingResults = await generateEmbeddings(content, apiKeys, embeddingModel);

        // Save embeddings to database with secure content
        await db.insert(embeddings).values(
            embeddingResults.map((embedding) => ({
                resourceId: resource.id,
                content: secureContentForEmbedding(embedding.content),
                embedding: embedding.embedding,
            }))
        );

        return 'Resource successfully created and embedded.';
    } catch (error) {
        log.error({ error }, 'Error creating resource');
        return error instanceof Error && error.message.length > 0
            ? error.message
            : 'Error, please try again.';
    }
};
