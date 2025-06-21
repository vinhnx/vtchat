# TODO

## update all section components in setting page pane sections to use card shadcn components

https://claude.ai/chat/524e3244-6d68-4f2a-9a74-4a4c281aba99
migrate from railway to fly.io
--
implement mobile version responsive design

fix :Mobile version is coming soon.
Please use a desktop browser."
--
https://ui.shadcn.com/blocks#sidebar-07

--
https://ui.shadcn.com/blocks#login-04

--

IMPORTANT: fix shadcn button variant migrate to shadcn button in #codebase

--
CSS Variables

<div className="bg-background text-foreground" />

To use CSS variables for theming set tailwind.cssVariables to true in your components.json file.
components.json

{
"style": "default",
"rsc": true,
"tailwind": {
"config": "",
"css": "app/globals.css",
"baseColor": "neutral",
"cssVariables": true
},
"aliases": {
"components": "@/components",
"utils": "@/lib/utils",
"ui": "@/components/ui",
"lib": "@/lib",
"hooks": "@/hooks"
},
"iconLibrary": "lucide"
}

Utility classes

<div className="bg-zinc-950 dark:bg-white" />

To use utility classes for theming set tailwind.cssVariables to false in your components.json file.
components.json

{
"style": "default",
"rsc": true,
"tailwind": {
"config": "",
"css": "app/globals.css",
"baseColor": "neutral",
"cssVariables": false
},
"aliases": {
"components": "@/components",
"utils": "@/lib/utils",
"ui": "@/components/ui",
"lib": "@/lib",
"hooks": "@/hooks"
},
"iconLibrary": "lucide"
}

Convention

We use a simple background and foreground convention for colors. The background variable is used for the background color of the component and the foreground variable is used for the text color.

The background suffix is omitted when the variable is used for the background color of the component.

Given the following CSS variables:

--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);

The background color of the following component will be var(--primary) and the foreground color will be var(--primary-foreground).

<div className="bg-primary text-primary-foreground">Hello</div>

List of variables

Here's the list of variables available for customization:
app/globals.css

:root {
--radius: 0.625rem;
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);
--secondary-foreground: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
--chart-1: oklch(0.646 0.222 41.116);
--chart-2: oklch(0.6 0.118 184.704);
--chart-3: oklch(0.398 0.07 227.392);
--chart-4: oklch(0.828 0.189 84.429);
--chart-5: oklch(0.769 0.188 70.08);
--sidebar: oklch(0.985 0 0);
--sidebar-foreground: oklch(0.145 0 0);
--sidebar-primary: oklch(0.205 0 0);
--sidebar-primary-foreground: oklch(0.985 0 0);
--sidebar-accent: oklch(0.97 0 0);
--sidebar-accent-foreground: oklch(0.205 0 0);
--sidebar-border: oklch(0.922 0 0);
--sidebar-ring: oklch(0.708 0 0);
}

.dark {
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--card: oklch(0.205 0 0);
--card-foreground: oklch(0.985 0 0);
--popover: oklch(0.269 0 0);
--popover-foreground: oklch(0.985 0 0);
--primary: oklch(0.922 0 0);
--primary-foreground: oklch(0.205 0 0);
--secondary: oklch(0.269 0 0);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.269 0 0);
--muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.371 0 0);
--accent-foreground: oklch(0.985 0 0);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.556 0 0);
--chart-1: oklch(0.488 0.243 264.376);
--chart-2: oklch(0.696 0.17 162.48);
--chart-3: oklch(0.769 0.188 70.08);
--chart-4: oklch(0.627 0.265 303.9);
--chart-5: oklch(0.645 0.246 16.439);
--sidebar: oklch(0.205 0 0);
--sidebar-foreground: oklch(0.985 0 0);
--sidebar-primary: oklch(0.488 0.243 264.376);
--sidebar-primary-foreground: oklch(0.985 0 0);
--sidebar-accent: oklch(0.269 0 0);
--sidebar-accent-foreground: oklch(0.985 0 0);
--sidebar-border: oklch(1 0 0 / 10%);
--sidebar-ring: oklch(0.439 0 0);
}

Adding new colors

To add new colors, you need to add them to your CSS file and to your tailwind.config.js file.
app/globals.css

:root {
--warning: oklch(0.84 0.16 84);
--warning-foreground: oklch(0.28 0.07 46);
}

.dark {
--warning: oklch(0.41 0.11 46);
--warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
--color-warning: var(--warning);
--color-warning-foreground: var(--warning-foreground);
}

You can now use the warning utility class in your components.

<div className="bg-warning text-warning-foreground" />

also, update css to use stone theme shadcn
https://ui.shadcn.com/docs/theming#stone

--
remove icons in VT+ Features and Subscription settings page

-

[] explore full Anthropic capablity
<https://ai-sdk.dev/providers/ai-sdk-providers/anthropic>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#computer-use>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#bash-tool>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#text-editor-tool>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#computer-tool>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#pdf-support>

--

[] <https://ai-sdk.dev/cookbook/node/retrieval-augmented-generation>

--

## [pro] <https://ai-sdk.dev/cookbook/next/chat-with-pdf>

## <https://docs.railway.com/reference/production-readiness-checklist>

--

[] <https://docs.creem.io/faq/account-reviews>

--

[] remove FREE_TIER_DAILY_LIMIT key and KV Redis Upstash depedeny completly
[] remove credit tracking (FREE_TIER_DAILY_LIMIT)
[] check if any impact?
use context7
--
remove card component in Subscription and VT+ Features setting page
--
[] open free chat for logged in user -> use vtchat gemini key
[] free: if use pre-defined key: 9 per day
[] plus: if use pre-defined key: 30 per day
[] -> if has gemini in byok -> unlimited
==

better auth: build Account Linking in settting profile -> use existing github and google links. allow user link between those 2.

use neon context7 mcp if needed. guide:

Account linking enables users to associate multiple authentication methods with a single account. With Better Auth, users can connect additional social sign-ons or OAuth providers to their existing accounts if the provider confirms the user's email as verified.

If account linking is disabled, no accounts can be linked, regardless of the provider or email verification status.
auth.ts

export const auth = betterAuth({
account: {
accountLinking: {
enabled: true,
}
},
});

Forced Linking

You can specify a list of "trusted providers." When a user logs in using a trusted provider, their account will be automatically linked even if the provider doesn’t confirm the email verification status. Use this with caution as it may increase the risk of account takeover.
auth.ts

export const auth = betterAuth({
account: {
accountLinking: {
enabled: true,
trustedProviders: ["google", "github"]
}
},
});

Manually Linking Accounts

Users already signed in can manually link their account to additional social providers or credential-based accounts.

    Linking Social Accounts: Use the linkSocial method on the client to link a social provider to the user's account.

await authClient.linkSocial({
provider: "google", // Provider to link
callbackURL: "/callback" // Callback URL after linking completes
});

You can also request specific scopes when linking a social account, which can be different from the scopes used during the initial authentication:

await authClient.linkSocial({
provider: "google",
callbackURL: "/callback",
scopes: ["https://www.googleapis.com/auth/drive.readonly"] // Request additional scopes
});

If you want your users to be able to link a social account with a different email address than the user, or if you want to use a provider that does not return email addresses, you will need to enable this in the account linking settings.
auth.ts

export const auth = betterAuth({
account: {
accountLinking: {
allowDifferentEmails: true
}
},
});

Linking Credential-Based Accounts: To link a credential-based account (e.g., email and password), users can initiate a "forgot password" flow, or you can call the setPassword method on the server.

    await auth.api.setPassword({
        headers: /* headers containing the user's session token */,
        password: /* new password */
    });

setPassword can't be called from the client for security reasons.
Account Unlinking

You can unlink a user account by providing a providerId.

await authClient.unlinkAccount({
providerId: "google"
});

// Unlink a specific account
await authClient.unlinkAccount({
providerId: "google",
accountId: "123"
});

If the account doesn't exist, it will throw an error. Additionally, if the user only has one account, the unlinking process will fail to prevent account lockout unless allowUnlinkingAll is set to true.
auth.ts

export const auth = betterAuth({
account: {
accountLinking: {
allowUnlinkingAll: true
}
},
});

--

migrate tailwind 4 https://tailwindcss.com/docs/upgrade-guide

--

when reasoning -> open "steps" reasoning panel

also render thought reasoning output realtime in markdown

rename "Steps" to "Thinking Steps" add model name to the top of the panel

--

[]
remember to publish Google Auth
<https://console.cloud.google.com/auth/audience?authuser=6&inv=1&invt=Ab0LuQ&project=psyched-span-463012-h5>

--

## [] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/reverify>

## [] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/profile-image>

## [] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/legal-consent>

[] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/app-invite>

--
[] build waitlist ?
<https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/waitlist>

================================================
FILE: packages/plugins/waitlist/README.md
================================================

# Waitlist Plugin for [Better Auth](https://github.com/better-auth/better-auth)

This plugin allows you to add a waitlist to your application.

## Installation

```bash
npm install @better-auth-kit/waitlist
```

## Usage

```ts
import { waitlist } from '@better-auth-kit/waitlist';

export const auth = betterAuth({
    plugins: [
        waitlist({
            enabled: true,
        }),
    ],
});
```

## Documentation

Read our documentation at [better-auth-kit.com](https://better-auth-kit.com/docs/plugins/waitlist).

## What does it do?

When enabled, the plugin will add a waitlist to your application.
All users would not be able to signup, instead they must be added to the waitlist.

Once the waitlist reaches a requirement, the user will be able to signup.

## License

[MIT](LICENSE)

================================================
FILE: packages/plugins/waitlist/build-dev.ts
================================================
import { buildDev } from "@better-auth-kit/internal-build";
import { config } from "./build";

buildDev(config);

================================================
FILE: packages/plugins/waitlist/build.ts
================================================
import { build, type Config } from "@better-auth-kit/internal-build";

export const config: Config = {
enableDts: true,
};
build(config);

================================================
FILE: packages/plugins/waitlist/LICENSE
================================================
Copyright 2025 - present, ping-maxwell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

================================================
FILE: packages/plugins/waitlist/package.json
================================================
{
"name": "@better-auth-kit/waitlist",
"version": "0.0.6",
"description": "A plugin for better-auth that allows you to add a waitlist to your application.",
"type": "module",
"repository": {
"type": "git",
"url": "https://github.com/ping-maxwell/better-auth-kit"
},
"exports": {
".": {
"default": "./dist/index.js",
"types": "./dist/index.d.ts"
}
},
"scripts": {
"dev": "bun build-dev.ts",
"build": "bun build.ts"
},
"keywords": ["better-auth", "waitlist", "plugin"],
"author": "ping-maxwell",
"license": "MIT",
"devDependencies": {
"@better-auth-kit/internal-build": "workspace:\*"
},
"peerDependencies": {
"better-auth": "^1.2.1"
},
"dependencies": {
"zod": "^3.24.2"
},
"publishConfig": {
"access": "public"
}
}

================================================
FILE: packages/plugins/waitlist/tsconfig.json
================================================
{
"compilerOptions": {
// Enable latest features
"lib": ["ESNext", "DOM"],
"target": "ESNext",
"module": "ESNext",
"moduleDetection": "force",
"jsx": "react-jsx",
"allowJs": true,

    	// Bundler mode
    	"moduleResolution": "bundler",
    	"verbatimModuleSyntax": true,
    	"declaration": true,

    	// Best practices
    	"strict": true,
    	"skipLibCheck": true,
    	"noFallthroughCasesInSwitch": true,

    	// Some stricter flags (disabled by default)
    	"noUnusedLocals": false,
    	"noUnusedParameters": false,
    	"noPropertyAccessFromIndexSignature": false
    },
    "include": ["./src/*"],
    "exclude": ["dist", "build.ts"]

}

================================================
FILE: packages/plugins/waitlist/.gitignore
================================================
.DS_Store
.env
.env.local
node_modules
dist

================================================
FILE: packages/plugins/waitlist/.npmignore
================================================
build-dev.ts
build.ts
.turbo
src

================================================
FILE: packages/plugins/waitlist/src/client.ts
================================================
import type { BetterAuthClientPlugin } from "better-auth";
import type { waitlist } from ".";

export const waitlistClient = () => {
return {
id: "waitlist",
$InferServerPlugin: {} as ReturnType<typeof waitlist>,
} satisfies BetterAuthClientPlugin;
};

================================================
FILE: packages/plugins/waitlist/src/index.ts
================================================
import {
generateId,
type AuthContext,
type BetterAuthPlugin,
} from "better-auth";
import { z, type ZodRawShape, type ZodTypeAny } from "zod";
import type { WaitlistOptions } from "./types";
import { schema, type WaitlistUser } from "./schema";
import { createAuthEndpoint } from "better-auth/api";
import {
mergeSchema,
type FieldAttribute,
type InferFieldsInput,
} from "better-auth/db";
export _ from "./types";
export _ from "./client";
export \* from "./schema";

export const ERROR_CODES = {
MAX_PARTICIPANTS_REACHED: "Maximum waitlist participants reached",
USER_EXISTS: "User already exists in the waitlist",
} as const;

export const waitlist = (options?: WaitlistOptions) => {
const opts = {
enabled: options?.enabled ?? false,
maximumWaitlistParticipants: options?.maximumWaitlistParticipants ?? null,
schema: options?.schema,
waitlistEndConfig: options?.waitlistEndConfig ?? {
event: "max-signups-reached",
onWaitlistEnd() {},
},
additionalFields: options?.additionalFields ?? {},
} satisfies WaitlistOptions;

    const merged_schema = mergeSchema(schema, opts.schema);
    merged_schema.waitlist.fields = {
    	...merged_schema.waitlist.fields,
    	...opts.additionalFields,
    };

    type WaitlistUserModified = WaitlistUser &
    	InferFieldsInput<typeof opts.additionalFields>;

    const model = Object.keys(merged_schema)[0] as string;

    return {
    	id: "waitlist",
    	schema: merged_schema,
    	$ERROR_CODES: ERROR_CODES,
    	endpoints: {
    		addWaitlistUser: createAuthEndpoint(
    			"/waitlist/add-user",
    			{
    				method: "POST",
    				body: convertAdditionalFieldsToZodSchema({
    					...opts.additionalFields,
    					email: { type: "string", required: true },
    					name: { type: "string", required: true },
    				}) as never as z.ZodType<Omit<WaitlistUser, "id" | "joinedAt">>,
    			},
    			async (ctx) => {
    				const { email, name, ...everythingElse } = ctx.body as {
    					email: string;
    					name: string;
    				} & Record<string, any>;

    				const found = await ctx.context.adapter.findOne<WaitlistUserModified>(
    					{
    						model: model,
    						where: [
    							{
    								field: "email",
    								value: email,
    								operator: "eq",
    							},
    						],
    					},
    				);

    				if (found) {
    					throw ctx.error("FORBIDDEN", {
    						message: ERROR_CODES.USER_EXISTS,
    					});
    				}

    				let count: number | null = null;

    				if (opts.maximumWaitlistParticipants) {
    					count = await ctx.context.adapter.count({
    						model: model,
    					});

    					if (count >= opts.maximumWaitlistParticipants) {
    						throw ctx.error("FORBIDDEN", {
    							message: ERROR_CODES.MAX_PARTICIPANTS_REACHED,
    						});
    					}
    				}

    				if (
    					opts.waitlistEndConfig.event === "max-signups-reached" &&
    					opts.maximumWaitlistParticipants !== null
    				) {
    					if (count === null) {
    						count = await ctx.context.adapter.count({
    							model: model,
    						});
    					}
    					if (count >= opts.maximumWaitlistParticipants) {
    						opts.waitlistEndConfig.onWaitlistEnd();
    					}
    				} else if (opts.waitlistEndConfig.event === "date-reached") {
    					if (new Date() > opts.waitlistEndConfig.date) {
    						opts.waitlistEndConfig.onWaitlistEnd();
    					}
    				}

    				const res = await ctx.context.adapter.create<WaitlistUserModified>({
    					model: model,
    					data: {
    						email,
    						name,
    						id: generateId(),
    						joinedAt: new Date(),
    						...everythingElse,
    					},
    				});

    				return ctx.json(res);
    			},
    		),
    		// removeWaitlistUser: createAuthEndpoint(
    		//   "/waitlist/remove-user",
    		//   {
    		//     method: "POST",
    		//     body: z.object({
    		//       email: z.string().email(),
    		//     }),
    		//   },
    		//   async (ctx) => {
    		//     const { email } = ctx.request.body;

    		//     const res = await ctx.context.adapter.delete({
    		//       model: model,
    		//       where: [{ field: "email", value: email, operator: "eq" }],
    		//     });

    		//     return ctx.json(res);
    		//   },
    		// ),
    	},
    } satisfies BetterAuthPlugin;

};

function convertAdditionalFieldsToZodSchema(
additionalFields: Record<string, FieldAttribute>,
) {
const additionalFieldsZodSchema: ZodRawShape = {};
for (const [key, value] of Object.entries(additionalFields)) {
let res: ZodTypeAny;

    	if (value.type === "string") {
    		res = z.string();
    	} else if (value.type === "number") {
    		res = z.number();
    	} else if (value.type === "boolean") {
    		res = z.boolean();
    	} else if (value.type === "date") {
    		res = z.date();
    	} else if (value.type === "string[]") {
    		res = z.array(z.string());
    	} else {
    		res = z.array(z.number());
    	}

    	if (!value.required) {
    		res = res.optional();
    	}

    	additionalFieldsZodSchema[key] = res;
    }
    return z.object(additionalFieldsZodSchema);

}

================================================
FILE: packages/plugins/waitlist/src/schema.ts
================================================
import type { AuthPluginSchema } from "better-auth";

export const schema = {
waitlist: {
fields: {
email: {
type: "string",
required: true,
input: true,
unique: true,
},
joinedAt: {
type: "date",
required: true,
input: false,
defaultValue: new Date(),
},
},
},
} satisfies AuthPluginSchema;

export type WaitlistUser = {
id: string;
email: string;
name: string;
joinedAt: Date;
};

================================================
FILE: packages/plugins/waitlist/src/types.ts
================================================
import type { InferOptionSchema, User } from "better-auth";
import type { schema, WaitlistUser } from "./schema";
import type { FieldAttribute } from "better-auth/db";

interface WaitlistEndConfig_base {
event: "max-signups-reached" | "date-reached" | "trigger-only";
onWaitlistEnd: () => void;
}

interface WaitlistEndConfig\*maxSignups extends WaitlistEndConfig_base {
/\*\*

- The waitlist will end once your `maximumWaitlistParticipants` count is reached.
  \_
  _ Note: If you do not set a `maximumWaitlistParticipants` value, then the count will never be reached, therefore the waitlist can only end if you call the `trigger` function.
  _
  _ Note: The `trigger` function will still work.
  _/
  event: "max-signups-reached";
  }

interface WaitlistEndConfig\*date extends WaitlistEndConfig_base {
/\*\*

- When the given `date` value has reached, the waitlist ends.
  \_
  _ Note: This won't work if you're running Better Auth in a serverless enviroment.
  _
  _ The `trigger` function will still work.
  _/
  event: "date-reached";
  /\*\*
  _ The date which the waitlist ends.
  _/
  date: Date;
  }

interface WaitlistEndConfig\*trigger extends WaitlistEndConfig_base {
/\*\*

- The only way to end the waitlist is for you to call the `trigger` function.
  \_/
  event: "trigger-only";
  }

export type WaitlistEndConfig =
| WaitlistEndConfig_maxSignups
| WaitlistEndConfig_date
| WaitlistEndConfig_trigger;

interface WaitlistOptions\*base {
/\*\*

- The maximum number of users that can be added to the waitlist.
  _ If null, there is no limit. \*
  _ @default null
  _/
  maximumWaitlistParticipants?: number | null;
  /\*\*
  _ schema for the waitlist plugin. Use this to rename fields.
  _/
  schema?: InferOptionSchema<typeof schema>;
  /\*\*
  _ Extend the `waitlist` schema with additional fields.
  _/
  additionalFields?: Record<string, FieldAttribute>;
  /\*\*
  _ Wether to disable sign in & sign ups while the waitlist is active.
  \_
  _ @default false
  _/
  disableSignInAndSignUp?: boolean;
  }

interface WaitlistOptions\*enabled extends WaitlistOptions_base {
/\*\*

- Whether the waitlist is enabled.
  \_
  _ @default false
  _/
  enabled: true;
  /\*\*
  _ The configuration for when the waitlist ends.
  _/
  waitlistEndConfig: WaitlistEndConfig;
  }

interface WaitlistOptions\*disabled extends WaitlistOptions_base {
/\*\*

- Whether the waitlist is enabled.
  \_
  _ @default false
  _/
  enabled: false;
  /\*\*
  _ The configuration for when the waitlist ends.
  _/
  waitlistEndConfig?: WaitlistEndConfig;
  }

export type WaitlistOptions =
| WaitlistOptions_enabled
| WaitlistOptions_disabled;

-->
build waitlist landing page

---

--
[] Reddit marketing cheat codes every startup founder should know: <https://x.natiakourdadze/status/1933939677016228177>

--
[][monet] <https://ai-sdk.dev/docs/guides/multi-modal-chatbot>
--

[][monet] RAG <https://ai-sdk.dev/docs/guides/rag-chatbot>

--
[] <https://ai-sdk.dev/cookbook/node/web-search-agent#building-a-web-search-tool>

--
[] support openai full
[] <https://ai-sdk.dev/providers/ai-sdk-providers/openai>
[][monet] OpenAI web search - <https://ai-sdk.dev/providers/ai-sdk-providers/openai#web-search>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#audio-input>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#reasoning-summaries>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#reasoning-summaries>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#image-models>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#image-models>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#speech-models>
--

[] Gemini
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#image-outputs>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#explicit-caching>
--

- [] <https://resend.com/docs/introduction>

## Authentication (Better Auth Integration & Enhancements)

- [ ] Implement Email Verification: [https://www.better-auth.com/docs/authentication/email-password#email-verification](https://www.better-auth.com/docs/authentication/email-password#email-verification)
- [ ] Implement 2FA: [https://www.better-auth.com/docs/plugins/2fa](https://www.better-auth.com/docs/plugins/2fa)
- [ ] Implement Email OTP: [https://www.better-auth.com/docs/plugins/email-otp](https://www.better-auth.com/docs/plugins/email-otp)

## Thread Management (Account-based & Neon Sync)

- [ ] Free tier: Continue using local IndexedDB for threads.
- [ ] [PLUS TIER ONLY] Implement full remote thread synchronization with Neon DB.
- [ ] [PLUS TIER ONLY] Sync threads to Neon DB.

--

- [ ] Desktop Application - Electron: [https://github.com/electron/electron](https://github.com/electron/electron)

--

Domain:

-> vtchat.io.vn

- [ ] Domain Name Research (vtai.io.vn, vtchat.io.vn) - _Consider moving detailed notes to a separate research document._
    - Whois VN: [https://whois.inet.vn/whois?domain=vtchat.io.vn](https://whois.inet.vn/whois?domain=vtchat.io.vn)
    - VinaHost: [https://secure.vinahost.vn/ac/cart.php?a=confdomains](https://secure.vinahost.vn/ac/cart.php?a=confdomains)
    - <https://www.matbao.net/ten-mien/ket-qua-kiem-tra-ten-mien.html?tenmien=vtchat.io.vn#top_search>

--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

--

Before final production deployment, ensure all environment variables are set correctly for production, including API keys, database URLs, and any other sensitive information.

- [ ] Finalize production environment configuration:
- [ ] Ensure all environment variables are set correctly for production, including API keys, database URLs, and any other sensitive information.
- [ ] Test the production deployment thoroughly to ensure all features work as expected.
- [ ] Set up monitoring and logging for the production environment to catch any issues early
- [ ] Document the production deployment process for future reference.
- [ ] Create a final checklist for production deployment, including:
    - [ ] Environment variable verification
    - [ ] Database connection checks
    - [ ] API key validation
    - [ ] Feature testing
    - [ ] Monitoring setup
- [ ] Review and finalize the production deployment documentation, ensuring it is clear and comprehensive for future deployments.
- [ ] Conduct a final review of the codebase to ensure all changes are committed and pushed to the main branch.
- [ ] Prepare a final release note summarizing the changes, features, and fixes included in the production deployment.
- [ ] Schedule a final deployment date and time, ensuring all team members are aware and available for any last-minute issues that may arise.

--

Write a final report and update readme, documentation, and any other relevant materials to reflect the current state of the project.

--

Good luck!
