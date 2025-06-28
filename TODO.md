# TODO

https://app.vemetric.com/public/snappify.com?t=24hrs
--
accessibility test https://x.com/pqoqubbw/status/1938636823892303947?s=46&t=PpYJInz2WcSN_fhoxWJwRQ
--
fix background color for user button container in side menu

remove sidebar border and background color

decorate /chat contentainer with dark/white background color

--
https://github.com/intern3-chat/intern3-chat/blob/main/src/components/artifact-preview.tsx

--
refence https://github.com/intern3-chat/intern3-chat

+ HTML/Mermaid/React artifacts preview
+ HTTP/SSE MCP Support for Model Context Protocol
+ Supermemory API integration for persistent memories
+ Native Voice input in input box using Groq
+ https://intern3.chat/settings/profile

--
update Deep Research prompt to encourage the Agent to use Summarize data in a way that could be turned into charts or tables"

--

review .env config production

-> copy config from .env to .env.production

--
## Fly.io deployment. Good luck!

fly.toml -> can set production/development environment variables? NODE_ENV and [env] setup, as path and env keys are difference between production and development?

https://fly.io/docs/apps/going-to-production/#main-content-start

+ dev
web: https://vtchat-dev.fly.dev
app: https://fly.io/apps/vtchat-dev/configuration

https://fly.io/docs/apps/going-to-production/

--

https://x.com/KuittinenPetri/status/1937496855342121234
Gemini 2.5 Flash Lite Preview 05-17 still has very generous 15 RPM and 500 free requests per day. It is surprisingly capable model considering how cheap and fast it is.

--> add `gemini-2.5-flash-lite-preview-06-17` model

1. set as free and with rate limit
2. add GEMINI_API_KEY to .env.production and .env.development (i have set this) -> update to fly.io deployment config
3. offer to register users only with constraints:
a. only 10 requests per day
b. only 1 request per minute
4. reset requests per day and per minute for each user at 00:00 UTC
5. add a note to the UI that this is a free model with limited requests
6. when user reaches the limit, show a message that they need to upgrade to a paid plan -> route to /plus
7. add credit/limit tracking meter to settings page, only show for registered users and not subscribed users
8. non-logged in users should not be used this offer, they should be redirected to login page with a message that they need to register to use this model.
9. think even harder
10. test thoroughly
11. note that this limit is per account
12. auto selected gemini-2.5-flash-lite-preview-06-17 model as default on chat input model dropdown selection
13. priority selection: gemini-2.5-flash-lite-preview-06-17 -> check if user has already input BYOK -> use their BYOK gemini key. if not, use the default gemini key from env that we offer.
14. make sure for this feature, gemini-2.5-flash-lite-preview-06-17 should get the api key from .env only for this features. all other models are from BYOK

--
https://x.com/tuantruong/status/1937400031281328602?s=46&t=PpYJInz2WcSN_fhoxWJwRQ

--

--

fly.io: https://fly.io/docs/apps/going-to-production/

--

<https://docs.creem.io/faq/account-reviews>

==

[]
remember to publish Google Auth
<https://console.cloud.google.com/auth/audience?authuser=6&inv=1&invt=Ab0LuQ&project=psyched-span-463012-h5>

--
[] Reddit marketing cheat codes every startup founder should know: <https://x.natiakourdadze/status/1933939677016228177>

--

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
