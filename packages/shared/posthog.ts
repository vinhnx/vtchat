import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';

// Only initialize PostHog if the API key is available
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const client = apiKey
    ? new PostHog(apiKey, {
          host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      })
    : null;

export enum EVENT_TYPES {
    WORKFLOW_SUMMARY = 'workflow_summary',
}

export type PostHogEvent = {
    event: EVENT_TYPES;
    userId: string;
    properties: Record<string, any>;
};

export const posthog = {
    capture: (event: PostHogEvent) => {
        // Only capture if PostHog client is available
        if (client) {
            client.capture({
                distinctId: event?.userId || uuidv4(),
                event: event.event,
                properties: event.properties,
            });
        } else {
            console.log('PostHog not configured, skipping event capture:', event.event);
        }
    },
    flush: () => {
        // Only flush if PostHog client is available
        if (client) {
            client.flush();
        }
    },
};
