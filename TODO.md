# TODO


--
ok go! -> https://vtchat.io.vn/

--

update /about page from out documents

--
make sure '/chat' rout -> redirect to '/' (keep /chat/{threadid} intact)
--

can make sure compile '/' route by default ?to speed up page loading
--

12:26:28 ❯ ./scripts/analyze-home-compilation.js
🔍 Analyzing home route compilation bottlenecks...

📊 Running bundle analyzer...

✅ Bundle analysis complete - check the opened browser tab

📈 Generating webpack stats...
❌ Webpack stats generation failed

📦 Analyzing dependencies...
   Root dependencies: 26 deps, 26 devDeps
   Web app dependencies: 34 deps, 14 devDeps

💾 Checking node_modules size...
   node_modules size: 2.3G      node_modules

🎯 Recommendations to improve compilation speed:
   1. Check bundle analyzer for large dependencies
   2. Consider using next.config.js modularizeImports
   3. Add more packages to optimizePackageImports
   4. Use dynamic imports for heavy components
   5. Exclude project from antivirus real-time scanning
   6. Use SSD storage for faster I/O
   7. Consider using Turbopack for faster builds

📋 Analysis complete!

--
✅ Investigation tools created

Key findings from the 60.1s compilation issue:

Root cause: The @repo/common/components barrel import is loading the entire component library
Dynamic imports help but: The barrel export still gets processed during compilation
Webpack optimizations: Added but limited impact due to heavy dependency tree
Immediate solutions applied:

Enhanced webpack optimizations: Disabled expensive optimization passes in dev mode
Analysis tools: Created scripts/analyze-home-compilation.js to identify bottlenecks
Filesystem optimizations: Enhanced caching and snapshot handling
Next steps to further reduce compilation time:

# Run the analysis script to identify the exact bottleneck
./scripts/analyze-home-compilation.js

# Then consider these optimizations:
# 1. Use webpack-bundle-analyzer to see what's taking space
# 2. Split @repo/common/components into smaller modules
# 3. Use modularizeImports in next.config.js
# 4. Consider using swc instead of webpack for transpilation
Expected impact:

Current: 60.1s compilation time
After barrel optimization: Should drop to ~5-10s
With full optimization: Target <3s compilation time
The 60.1s is primarily due to the monorepo component library being processed as one large bundle. Breaking this down will provide the biggest performance gain.

--
check
https://nextjs.org/docs/ for optimization guide

--
https://nextjs.org/docs/app/guides/memory-usage
--
http://localhost:3000/404

fix 404 page footer alignment and remove card border
;
--
{ region: 'local', pathname: '/about' } '[Traffic] Request'
 ○ Compiling /about ...
 ✓ Compiled /about in 6.7s
 ⨯ ./apps/web/app/about/page.tsx:9:14
Ecmascript file had an error
   7 | import { generateMetadata as genMeta } from '../../lib/seo/metadata-utils';
   8 |
>  9 | export const metadata = genMeta({
     |              ^^^^^^^^
  10 |     title: 'About VT',
  11 |     description: 'Learn about VT - Your privacy-focused AI chat platform',
  12 |     pathname: '/about',

You are attempting to export "metadata" from a component marked with "use client", which is disallowed. Either remove the export, or the "use client" directive. Read more: https://nextjs.org/docs/app/api-reference/directives/use-client




 ○ Compiling /_error ...
 ✓ Compiled /_error in 1148ms
 GET /about 500 in 8344ms


--
react 19?
--
user can combine multiple tools toether
--
fix google indexing report
URL
Last crawled
https://vtchat.io.vn/

info
Page with redirect
These pages aren't indexed or served on Google
https://support.google.com/webmasters/answer/7440203#page_with_redirect
--

check for tools call, (for example, if user call WEB SEARCH tool:
1. if user is using free model (GEMINI_2_5_FLASH_LITE) AND doesn't have GEMINI API KEY -> use free gemini model API key for them and count as 1 daily free gemini model usage
2. if user is using free model (GEMINI_2_5_FLASH_LITE) AND has GEMINI API KEY -> use their gemini api key and DON't count -> remember has BYOK -> unlimited usage
3. currently observe: if user is using free model (GEMINI_2_5_FLASH_LITE) AND doesn't have GEMINI API KEY -> the chat thread show-> "Something went wrong while processing your request. Please try again." this is too vauge -> show proper error message instead based on the above rules
--

check and try to encourage GEMINI_2_5_FLASH_LITE to use function calling. currently it doesn't work with chart tool, so we need to fix it
--
offer more free gemini model -> use 300$ account gemini api key
--
https://console.groq.com/docs/ai-sdk -> offer free
--
https://nextjs.org/docs/app/guides/upgrading/version-15
--
tailwind v4
--
https://better-auth.farmui.com/

--

https://github.com/Kinfe123/better-auth-mcp

--

replace arcjet w  https://github.com/Kinfe123/better-auth-isbot

--
research and optimize app performance

--

https://react-scan.com/

--
try to do promotion again. good luck!
--
for models tier: keep these models VT+ exlusive
Claude 4 Sonnet, Claude 4 Opus
GPT-4.1, O3, O3 Mini, O4 Mini, O1 Mini, O1 Preview
Gemini 2.5 Pro
DeepSeek R1
Grok 3
--

Tier revamp -> review carefully and update all related VT+ features and codebase and update to new tier revamp requirements

--
Tier revamp:
+ Plus tier: keep PRO_SEARCH, DEEP_RESEARCH, RAG (packages/shared/config/vt-plus-features.ts)
+ Free tier:
a. open all chat input tools for all tier users (only for logged in users only)
b. add theses feature slugs to free tier: DARK_THEME, THINKING_MODE_TOGGLE, STRUCTURED_OUTPUT, THINKING_MODE, DOCUMENT_PARSING, REASONING_CHAIN, GEMINI_EXPLICIT_CACHING, CHART_VISUALIZATION

Note that
-> plus tier has all features from free tier
-> research whole app and codebase and update this tier revamp new requirements
-> update tiers benefits, plus page, faqs, terms, privacy, etc. and README
-> update subscription logic
-> update subscription store
-> update gated VT+ features checking
-> update settings page
-> use subagent if needed

--
https://github.com/e2b-dev/fragments

--

https://ai-sdk.dev/docs/advanced/rendering-ui-with-language-models
==
https://ai-sdk.dev/docs/advanced/multiple-streamables
--
https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
--
https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering
--
https://ai-sdk.dev/docs/ai-sdk-core/testing

==
v5 improve openai response api support
https://ai-sdk.dev/docs/guides/openai-responses

--
[check ai sdk compatible ver] improve Anthropic support
https://ai-sdk.dev/providers/ai-sdk-providers/anthropic

--
--

Future plan
+ improve openai response api support https://ai-sdk.dev/docs/guides/openai-responses
+ improve Anthropic support https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
+ [done] improve Claude 4 support https://ai-sdk.dev/docs/guides/claude-4
+ Adding username/password login option https://www.better-auth.com/docs/plugins/username
+ forgot password
+ update profile
+ verify email
+ otp email
+ magic link
+ https://supermemory.ai/docs/memory-api/overview
+ mcp
+ localization

--

Good luck!
