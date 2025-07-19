"use server";

import { auth } from "@repo/shared/lib/auth";

export const submitFeedback = async (feedback: string) => {
    const session = await auth.api.getSession({
        headers: new Headers(),
    });
    const userId = session?.user?.id;

    if (!userId) {
        return { error: "Unauthorized" };
    }

    return feedback;
};
