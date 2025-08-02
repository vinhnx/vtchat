# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

--

ai sdk v5 https://vercel.com/blog/ai-sdk-5

--

improve deep research and pro search system to display agregated results from multiple sources from footer summarized content in bullet lists, each display title and link of source

--

https://ai-sdk.dev/docs/reference/ai-sdk-core/smooth-stream

--

don't count normal 'web search' tool same as pro search "PS" quota

--
The initial loading time is quite high - it takes around 2-3 seconds to display the first content, and occasionally, it gets stuck if there’s an authentication error.

I’ve noticed that there’s a forced noSSR, which performs all checks before rendering. From what I understand, the initial screen only includes the chat and the left sidebar. We could consider lazy loading the left sidebar content, as displaying the main screen within milliseconds would significantly enhance the user experience.

--

integrate text-to-speech

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
