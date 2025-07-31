# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

-

integrate text-to-speech

--

fix pdf extract/image extract failed

19:53:19.567 Uncaught (in promise) TypeError: can't access property "includes", args.site.enabledFeatures is undefined
isFeatureBroken <anonymous code>:980
updateFeaturesInner <anonymous code>:9240
updateFeaturesInner <anonymous code>:9239
<anonymous code>:980:143

--

🎯 Root Cause Analysis:
The "Optimized subscription check failed" errors are likely caused by:

Missing Default Subscriptions: Most users (96/97) don't have subscription records
Subscription Query Logic: The app might be expecting all users to have subscription records
Caching Issues: Subscription checks might be timing out due to cache misses
💡 Recommended Fixes:
Create default subscription records for users without them
Optimize subscription check logic to handle missing records gracefully
Add better error handling for subscription lookup failures

--

fix web search still doesn't work on production vtchat.io.vn

--

Greetings,

As a bug bounty hunter and web security researcher, my main objective is to protect the internet from cyberattacks. I specialize in identifying and reporting bugs on websites, providing comprehensive vulnerability assessment reports that detail the identified issues. During my recent research efforts, I came across your website, vtchat.io.vn.

Vulnerability: Missing DMARC Record

DMARC (Domain-based Message Authentication, Reporting, and Conformance) is an email authentication protocol designed to help domain owners protect their domains from unauthorized use, specifically email spoofing. Its implementation aims to defend against business email compromise attacks, phishing emails, email scams, and other cyber threats. A DMARC record includes a policy that determines how unauthenticated or forged emails should be handled. The absence of this record creates an opportunity for attackers to exploit the domain name. On your website, I discovered a similar issue where anyone can send emails from your domain (hello@vtchat.io.vn) to other users.

Proof of Concept:

By using the following DMARC record, I successfully sent a manipulated email to my own address, making it appear as if it originated from your contact form on hello@vtchat.io.vn.

Screenshot Proof-of-Concept attached.
image.png
image.png
Impact:

This phishing technique can be highly effective, allowing attackers to send forged emails from your domain and impersonate your company's official representatives. They can manipulate victims into providing sensitive information, including money or credentials. Extensive research studies highlight the critical importance of implementing DMARC and SPF protocols to mitigate such risks.

Fix:

To address this issue, I recommend implementing a DMARC record for your domain. This will help prevent unauthorized use of your domain for email spoofing. If you need further assistance or have any additional questions, please feel free to reach out. I'm here to help.

I would also like to mention that I am looking forward to the possibility of a bug bounty reward for this responsible disclosure. Once this matter is addressed and resolved, I hope to report any additional bugs that I may come across.

Thank you and regards,
Ivanna

--

fix admin/terminaml stats doesn't work any more?
GET
https://vtchat.io.vn/api/admin/analytics

"Failed to fetch analytics"

--

fix and improve login page frame animation too flashing

--

smoothStream()

smoothStream is a utility function that creates a TransformStream for the streamText transform option to smooth out text streaming by buffering and releasing complete words with configurable delays. This creates a more natural reading experience when streaming text responses.

import { smoothStream, streamText } from 'ai';

const result = streamText({
model,
prompt,
experimental_transform: smoothStream({
delayInMs: 20, // optional: defaults to 10ms
chunking: 'line', // optional: defaults to 'word'
}),
});

Import

import { smoothStream } from "ai"

API Signature
Parameters
delayInMs?:
number | null
The delay in milliseconds between outputting each chunk. Defaults to 10ms. Set to `null` to disable delays.
chunking?:
"word" | "line" | RegExp | (buffer: string) => string | undefined | null
Controls how the text is chunked for streaming. Use "word" to stream word by word (default), "line" to stream line by line, or provide a custom callback or RegExp pattern for custom chunking.
Word chunking caveats with non-latin languages

The word based chunking does not work well with the following languages that do not delimit words with spaces:

For these languages we recommend using a custom regex, like the following:

    Chinese - /[\u4E00-\u9FFF]|\S+\s+/
    Japanese - /[\u3040-\u309F\u30A0-\u30FF]|\S+\s+/

For these languages you could pass your own language aware chunking function:

    Vietnamese
    Thai
    Javanese (Aksara Jawa)

Regex based chunking

To use regex based chunking, pass a RegExp to the chunking option.

// To split on underscores:
smoothStream({
chunking: /\_+/,
});

// Also can do it like this, same behavior
smoothStream({
chunking: /[^_]\*\_/,
});

Custom callback chunking

To use a custom callback for chunking, pass a function to the chunking option.

smoothStream({
chunking: text => {
const findString = 'some string';
const index = text.indexOf(findString);

    if (index === -1) {
      return null;
    }

    return text.slice(0, index) + findString;

},
});

Returns

Returns a TransformStream that:

    Buffers incoming text chunks
    Releases text when the chunking pattern is encountered
    Adds configurable delays between chunks for smooth output
    Passes through non-text chunks (like step-finish events) immediately

https://ai-sdk.dev/docs/reference/ai-sdk-core/smooth-stream#smoothstream
