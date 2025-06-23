'use server';

import { db } from '../database';
import { resources, embeddings } from '../database/schema';
import { generateEmbeddings } from '../ai/embedding';
import { auth } from '../auth-server';
import { z } from 'zod';
import { type EmbeddingModel } from '@repo/shared/config/embedding-models';
import { type ApiKeys } from '@repo/common/store';

// Schema for validating resource input
const createResourceSchema = z.object({
    content: z.string().min(1, 'Content is required'),
});

export type NewResourceParams = z.infer<typeof createResourceSchema>;

export const createResource = async (input: NewResourceParams, apiKeys: ApiKeys, embeddingModel?: EmbeddingModel) => {
    try {
        // Get the current user
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers()),
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
        
        // Save embeddings to database
        await db.insert(embeddings).values(
            embeddingResults.map(embedding => ({
                resourceId: resource.id,
                content: embedding.content,
                embedding: embedding.embedding, // Array should be properly handled by Drizzle
            })),
        );

        return 'Resource successfully created and embedded.';
    } catch (error) {
        console.error('Error creating resource:', error);
        return error instanceof Error && error.message.length > 0
            ? error.message
            : 'Error, please try again.';
    }
};
