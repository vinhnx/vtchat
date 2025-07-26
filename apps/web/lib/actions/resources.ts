"use server";

import { log } from "@repo/shared/logger";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "../auth-server";
import { db } from "../database";
import { resources } from "../database/schema";

// Schema for validating resource input
const createResourceSchema = z.object({
    content: z.string().min(1, "Content is required"),
});

export type NewResourceParams = z.infer<typeof createResourceSchema>;

export const createResource = async (input: NewResourceParams) => {
    try {
        // Get the current user
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const { content } = createResourceSchema.parse(input);

        // Create the resource
        await db.insert(resources).values({
            content,
            userId: session.user.id,
        });

        return "Resource successfully created.";
    } catch (error) {
        log.error({ error }, "Error creating resource");
        return error instanceof Error && error.message.length > 0
            ? error.message
            : "Error, please try again.";
    }
};
