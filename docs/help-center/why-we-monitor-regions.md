# Why We Monitor Regions - User FAQ

## Quick Answer

**We track which world region your request comes from (like "US East Coast" or "Asia") to make VTChat faster for everyone, but we never track who you are or store your personal information.**

## How It Makes VTChat Better

### 🚀 Faster AI Responses

- If lots of US users are chatting, we add US servers
- If European users join, we add European servers
- Your AI responses get faster (under 50ms vs 300ms+)

### 💰 Cost Efficient

- We only add servers where people actually use VTChat
- Keeps our costs low = keeps VTChat affordable for everyone

## What We See vs What We Don't See

### ✅ What We Know

```
"12 requests from US region today"
"5 requests from Europe region today"
"45 requests from Asia region today"
```

### ❌ What We DON'T Know

- Who made those requests
- Your IP address
- Your location beyond "general region"
- When you specifically used the app
- What you chatted about

## Real Example

**Bad logging (we DON'T do this):**

```
❌ User john@email.com from 192.168.1.1 in New York chatted at 2pm
```

**Good logging (what we actually do):**

```
✅ Request from US region
```

## Is This Normal?

**Yes!** Every major service does this:

- **Netflix**: Adds servers in countries with lots of viewers
- **YouTube**: Places content closer to audiences
- **ChatGPT**: Uses global infrastructure for speed
- **VTChat**: Same idea, but with even less data collection

## Privacy Protection

### 🔒 GDPR Compliant

- Region codes aren't personal data under EU law
- No consent needed for infrastructure optimization
- You can't be identified from "US region" logs

### 🗑️ Auto-Deletion

- Logs automatically delete after 7-30 days
- We don't store this data permanently
- Used only for immediate server decisions

## Can I Opt Out?

**You don't need to!** The monitoring is:

- Anonymous by design
- Cannot be linked to your account
- Doesn't affect your privacy

It's like asking "can I opt out of Netflix knowing someone in my country watches movies?" - the data is too general to matter.

## Questions?

### "Why not use analytics instead?"

Analytics track individuals. We specifically chose NOT to use Google Analytics, Facebook Pixel, or similar tools that create user profiles.

### "Can you identify me from this?"

Impossible. "US region" could be any of 330 million people. We'd need much more data to identify anyone.

### "Do you share this data?"

Never. It stays in our private logs and gets deleted automatically.

### "What if I use a VPN?"

No problem! If your VPN makes you appear in a different region, that just helps us understand global usage patterns better.

## Bottom Line

This monitoring helps us serve you faster AI responses while collecting the absolute minimum data possible. It's a win-win: better performance for you, smart scaling for us, maximum privacy for everyone.

**Still have questions?** Contact us at support@vtchat.io.vn
