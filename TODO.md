# TODO

ok go!


--
IMPORTANT verify creem.io LIVE payment

https://www.creem.io/checkout/prod_1UZhx15bSgbT8ggWTPQNi/ch_4oVL59zbacFQaBIGrGBgug

--

try to setup email from matbao.net

--

now all critical config: verify neon config, creem io config, webhook and other configs to make sure production config works
use context7 and mcp if needed
use subagent if needed
--

fly.io: https://fly.io/docs/apps/going-to-production/
--
Make sure private services are not exposed

Check that your private apps with services don’t have public IP addresses. Run fly ips list and use fly ips release to release unnecessary public IPs. See flyctl fly ips commands. Assign private apps a Flycast address instead.

--

Use Arcjet application security for JavaScript apps

Secure your app with rate limiting, bot protection, email validation, and defense against common attacks through our extension partner Arcjet. Currently free in beta, but pricing is subject to change. See Application Security by Arcjet.
https://github.com/arcjet/arcjet-js

use context7

--

https://fly.io/docs/monitoring/sentry/
 Application Monitoring by Sentry

Sentry is a developer-first application monitoring platform that helps you identify and fix software problems before they impact your users. Through our partnerships with Sentry, each of your Fly organizations can claim a year’s worth of Team Plan credits.

--
Fly.io Metric dashboard

> https://fly-metrics.net/d/fly-app/fly-app?orgId=1142684

--

IMPORTANT: research and config machine config

https://fly.io/dashboard/vt/builders -> use lowest machine?

--

[DOMAIN NAME PURCHASE]
https://pay.matbao.net/payment/payoo-return.html?status=1&order_no=115120_PAY_1_S2312340&checksum=53115f09f23b1196b43db91e01c3294d64bd5cc25946a2eff4843eece460dcc54c4502c20c64207d247fb810f3a0221b3652d20bb86f7de519c3b1d5400e63c3&totalAmount=94900&paymentFee=0

vtchat.io.vn

-> setup email forward
-> setup domain config
-> setup domain DNS
-> setup env confg
-> setup fly.io domain config

good luck!

--

change vtchat.io@gmail.com -> support@vtchat.io@gmail.com domain?

--
scan and update email and domain config in project (faq, terms, privacy, etc.)

--

https://page-speed.dev/

--
https://requestindexing.com/

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
--

--

<https://docs.creem.io/faq/account-reviews>

--

Marketting plan
"better to launch waitlist + DMs first, then do researches, before building and launching

I like the idea of SEO with ChatGPT blogs though"

+ https://www.producthunt.com/
+ https://peerlist.io/
+ https://uneed.best/
+ https://microlaunch.net/

--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

--

Write a final report and update readme, documentation, and any other relevant materials to reflect the current state of the project.

--

Future plan
+ Adding username/password login option https://www.better-auth.com/docs/plugins/username
+ forgot password
+ update profile
+ verify email
+ otp email
+ magic link
+ https://supermemory.ai/docs/memory-api/overview
+ mcp

--

Good luck!
