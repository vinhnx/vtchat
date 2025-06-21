# TODO

import { Text } from "@/components/ui/text"

export function TextShineExample() {
return (
<Text variant="shine">
Generating code...
</Text>
)
}
--
https://www.luxeui.com/ui/dropdown-menu
--
import { Card } from "@/components/ui/card"

export function CardRevealedPointerExample() {
return (
<Card variant="revealed-pointer">
<div className="flex flex-col gap-2">
<span className="text-xl font-semibold text-black dark:text-neutral-200">
Luxe
</span>
<span className="text-sm leading-[1.5] text-neutral-500 dark:text-neutral-400">
Explore the new website that simplifies the creation of sophisticated components.
</span>
</div>
</Card>
)
}

--
import { Button } from "@/components/ui/button"

export function ButtonAnimatedBorderExample() {
return (
<Button variant="animated-border">
Button
</Button>
)
}

## use for plus button in sidebar

import { Badge } from "@/components/ui/badge"

export function BadgeAnimatedBorderExample() {
return (
<Badge variant="animated-border">
Badge
</Badge>
)
}

## use for user tier badge

https://next-safe-action.dev/
--`
https://fluid.tw/#installation
--

## https://react-scan.com/

## https://requestindexing.com/

## https://og.new/

## https://unlighthouse.dev/

## https://million.dev/docs

https://page-speed.dev

--
can safely remove LoginBYOKManager and OnboardingManager?
check for reduntdant charts components and package. should use recharts and shadcn/ui
--
--
Preferences is not persisted between page refresh. double check all setings prefs make sure they are saved when changes in settings page
--
table component https://ui.shadcn.com/docs/components/table

## for tools use

[openai only]
https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-speech#generatespeech
generateSpeech()
generateSpeech is an experimental feature.

Generates speech audio from text.

import { experimental_generateSpeech as generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';
import { readFile } from 'fs/promises';

const { audio } = await generateSpeech({
model: openai.speech('tts-1'),
text: 'Hello from the AI SDK!',
});

console.log(audio);

Import

import { experimental_generateSpeech as generateSpeech } from "ai"

API Signature
Parameters
model:
SpeechModelV1
The speech model to use.
text:
string
The text to generate the speech from.
voice?:
string
The voice to use for the speech.
outputFormat?:
string
The output format to use for the speech e.g. "mp3", "wav", etc.
instructions?:
string
Instructions for the speech generation.
speed?:
number
The speed of the speech generation.
providerOptions?:
Record<string, Record<string, JSONValue>>
Additional provider-specific options.
maxRetries?:
number
Maximum number of retries. Default: 2.
abortSignal?:
AbortSignal
An optional abort signal to cancel the call.
headers?:
Record<string, string>
Additional HTTP headers for the request.
Returns
audio:
GeneratedAudioFile
The generated audio.
GeneratedAudioFile
base64:
string
Audio as a base64 encoded string.
uint8Array:
Uint8Array
Audio as a Uint8Array.
mimeType:
string
MIME type of the audio (e.g. "audio/mpeg").
format:
string
Format of the audio (e.g. "mp3").
warnings:
SpeechWarning[]
Warnings from the model provider (e.g. unsupported settings).
responses:
Array<SpeechModelResponseMetadata>
Response metadata from the provider. There may be multiple responses if we made multiple calls to the model.
SpeechModelResponseMetadata
timestamp:
Date
Timestamp for the start of the generated response.
modelId:
string
The ID of the response model that was used to generate the response.
headers?:
Record<string, string>
Response headers.
--
check searches with grok 3 mini and grok 2 vision models?
--
[plus] voice input
--
add weather and stock component sample https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces#generative-user-interfaces
reference chart tools implementation
--
also,
add weather and stock benefits to /plus page, to plus tier benefits section, to creem_io feature, to faq

make sure weather and stock tools are available in plus tier, and not available in free tier.

weather visualization slug: weather_visualization
stock visualization slug: weather_visualization

## all should be using modern shadcn and tailwind ui components, and should be responsive.

https://github.com/e2b-dev/fragments

--
check copy markdown from chat thread message doesn't work

--

seems like all settings preference is not persisted in local storage, so it resets to default on page reload. please fix this issue.

theme settings is not persisted in local storage, so it resets to default on page reload. please fix this issue.

click on theme change button, it should toggle the theme between light and dark mode, and persist the selected theme in local storage so that it remains consistent across page reloads.

--

1. check models-data.json add new models and providers
2. ## also implement BYOK support for those providers.

    https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces#generative-user-interfaces

3. build charts and graphs with the AI SDK UI
   https://ui.shadcn.com/docs/components/chart
4. test with some prompt to triggger show charts and graphs when chatting with AI

--

https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

--

https://fly.io/docs/apps/going-to-production/
https://claude.ai/chat/524e3244-6d68-4f2a-9a74-4a4c281aba99
migrate from railway to fly.io
-> free if use under 5$ a month

--

https://ai-sdk.dev/cookbook/next/chat-with-pdf

--

railway: https://docs.railway.com/reference/production-readiness-checklist

--

<https://docs.creem.io/faq/account-reviews>

==

[]
remember to publish Google Auth
<https://console.cloud.google.com/auth/audience?authuser=6&inv=1&invt=Ab0LuQ&project=psyched-span-463012-h5>

--
[] Reddit marketing cheat codes every startup founder should know: <https://x.natiakourdadze/status/1933939677016228177>

--
[][monet] <https://ai-sdk.dev/docs/guides/multi-modal-chatbot>
--

[][monet] RAG <https://ai-sdk.dev/docs/guides/rag-chatbot>

--

<https://ai-sdk.dev/cookbook/node/web-search-agent#building-a-web-search-tool>

--

## Future

- [ ] Free tier: Continue using local IndexedDB for threads.
- [ ] [PLUS TIER ONLY] Implement full remote thread synchronization with Neon DB.
- [ ] [PLUS TIER ONLY] Sync threads to Neon DB.

--

- [ ] Electron: [https://github.com/electron/electron](https://github.com/electron/electron)

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
