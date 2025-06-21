# TODO

https://www.better-auth.com/docs/plugins/one-tap
--

--
https://fly.io/docs/apps/going-to-production/

--
https://claude.ai/chat/524e3244-6d68-4f2a-9a74-4a4c281aba99
migrate from railway to fly.io
-> free if use under 5$ a month
--

--
https://www.better-auth.com/docs/plugins/multi-session
--
https://www.better-auth.com/docs/plugins/captcha
--

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

--

## <https://docs.railway.com/reference/production-readiness-checklist>

--

[] <https://docs.creem.io/faq/account-reviews>

==

migrate tailwind 4 https://tailwindcss.com/docs/upgrade-guide

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
