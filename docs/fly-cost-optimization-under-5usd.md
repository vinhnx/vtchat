# Fly.io Cost Optimization: Stay Under $5/Month

## Target: <$5/month for 2-region deployment

### Fly.io Pricing Model (2025)

**Shared CPU Machines**:

- 256MB RAM: ~$1.94/month ($0.0000008/second)
- 512MB RAM: ~$3.87/month ($0.0000015/second)
- 1GB RAM: ~$7.74/month ($0.0000030/second)

**Key Insight**: You only pay when machines are **running**. Suspended machines = $0 cost!

### Current Configuration Analysis

**Your Setup**:

- 2 machines × 512MB = $7.74/month if always running
- With auto-suspend: **Actual cost = only when processing requests**

**Cost Breakdown**:

```
Cost per machine = $3.87/month (if running 100% of time)
Cost per hour = $0.00537/hour
Cost per minute = $0.0000895/minute
Cost per second = $0.0000015/second
```

### Optimization Strategy: Stay Under $5/month

#### Option 1: Keep Current Setup (512MB) - Recommended

✅ **Target usage**: <65% uptime (47 hours/month per machine)

**How to achieve**:

- ✅ Already configured: `min_machines_running = 0`
- ✅ Already configured: `auto_stop_machines = 'suspend'`
- ✅ Machines suspend after idle period
- ✅ Only wake on incoming traffic

**Expected cost with low/medium traffic**: $2-4/month
**Works for**: Most web apps with intermittent usage

#### Option 2: Reduce Memory to 256MB

💡 **Target**: $1.94/month per machine × 2 = $3.88/month at 100% uptime

**Trade-off**:

- ✅ Lower cost (can run 100% time and stay under $5)
- ⚠️ Less memory for Next.js (may impact performance)
- ⚠️ Longer cold starts

**Configuration change needed**:

```toml
[[vm]]
memory = '256mb' # Changed from 512mb
cpu_kind = 'shared'
cpus = 1
```

#### Option 3: Single Region Only

💡 **Target**: 1 machine × $3.87/month = $3.87/month at 100% uptime

**Trade-off**:

- ✅ Guaranteed under $5/month
- ✅ Can keep 512MB memory
- ⚠️ Higher latency for USA users
- ⚠️ No redundancy

**Setup**: Keep only Singapore machine

### Recommended Approach: Option 1 (Current Setup)

Your current configuration is **already optimized** for <$5/month:

```toml
[http_service]
auto_stop_machines = 'suspend' # ✅ Suspend when idle
auto_start_machines = true # ✅ Wake on demand
min_machines_running = 0 # ✅ No minimum (full suspend)

[[vm]]
memory = '512mb' # ✅ Good performance
cpu_kind = 'shared' # ✅ Cost-effective
cpus = 1 # ✅ Sufficient for web app
```

### Monitoring Costs

#### Check current spending:

```bash
# Via Fly.io dashboard
open https://fly.io/dashboard/personal/billing

# Via CLI (check machine uptime)
fly status -a vtchat
fly machines list -a vtchat
```

#### Track machine uptime:

```bash
# Check when machines were last active
fly machines list -a vtchat

# View recent activity
fly logs -a vtchat --region sin
fly logs -a vtchat --region iad
```

### Cost Triggers to Watch

**What increases cost**:

- 🔴 **Constant traffic** - Keeps machines awake
- 🔴 **Health check failures** - Prevents auto-suspend
- 🔴 **Background jobs** - Keeps machines running
- 🔴 **WebSocket connections** - Long-lived connections

**What keeps cost low**:

- 🟢 **Intermittent traffic** - Machines suspend between requests
- 🟢 **Quick requests** - Process and suspend fast
- 🟢 **Proper health checks** - Allow clean suspends
- 🟢 **No background tasks** - Only wake on demand

### Auto-Suspend Configuration

**Current settings** (already optimal):

```toml
[[http_service.checks]]
grace_period = "15s" # Allow 15s for startup
interval = "60s" # Check every minute
timeout = "10s" # Fail if no response in 10s

[[http_service.checks]]
type = "tcp"
grace_period = "5s" # Quick TCP check
interval = "30s" # More frequent
timeout = "2s" # Fast timeout
```

**What this means**:

- Machines wake in 2-5 seconds on first request
- Machines suspend after ~2-3 minutes of inactivity
- Health checks don't prevent suspension (they're infrequent)

### If You Need to Reduce Costs Further

#### Immediate actions:

1. **Check current spending**:
   ```bash
   # See actual usage
   fly dashboard -a vtchat
   ```

2. **Reduce to 256MB RAM** (if needed):
   ```bash
   # Update fly.toml
   [[vm]]
   memory = '256mb'

   # Deploy
   fly deploy
   ```

3. **Single region** (if needed):
   ```bash
   # Keep only Singapore
   fly machines destroy <usa-machine-id> -a vtchat
   ```

4. **Increase suspend aggressiveness**:
   ```toml
   [[http_service.checks]]
   interval = "120s" # Less frequent checks = faster suspend
   ```

### Real-World Cost Examples

**Scenario A: Low Traffic Blog**

- Traffic: 100 requests/day
- Uptime: ~2 hours/day
- Cost: **$0.50/month** (2 machines)

**Scenario B: Medium Traffic App**

- Traffic: 1000 requests/day
- Uptime: ~8 hours/day
- Cost: **$2.00/month** (2 machines)

**Scenario C: Active Development**

- Traffic: Constant during work hours
- Uptime: ~12 hours/day
- Cost: **$3.00/month** (2 machines)

**Scenario D: High Traffic**

- Traffic: Constant 24/7
- Uptime: 24 hours/day
- Cost: **$7.74/month** (2 machines) ⚠️ Over budget

### Cost Calculation Formula

```
Monthly Cost = (Hours Running / 730 hours) × $3.87 × Number of Machines

Target: < $5/month
Max hours running = $5 / $3.87 / 2 machines = ~0.65
= 65% uptime = 47 hours/month per machine
= 1.5 hours/day per machine
```

### Quick Cost Check

After setup, monitor for 3-7 days:

```bash
# 1. Check machine states
fly machines list -a vtchat

# 2. If both machines show "suspended" most of the time = ✅ Low cost
# 3. If machines show "started" constantly = ⚠️ Check traffic patterns

# 4. Review in Fly.io dashboard after 1 week
open https://fly.io/dashboard/personal/billing
```

### Emergency Cost Control

If costs exceed $5/month:

```bash
# Option 1: Reduce to single machine (immediate)
fly machines destroy <second-machine-id> -a vtchat --force

# Option 2: Reduce memory (immediate)
# Edit fly.toml: memory = '256mb'
fly deploy

# Option 3: Stop all machines temporarily
fly machine stop <machine-id> -a vtchat
```

## Summary

✅ **Current setup is optimized for <$5/month**
✅ **Auto-suspend handles cost control automatically**
✅ **No changes needed unless traffic is very high**
✅ **Monitor for first week to confirm**

**Expected cost**: $2-4/month for typical usage

**Next steps**:

1. Run the setup script (./scripts/setup-fly-regions.sh)
2. Monitor costs in Fly.io dashboard for 1 week
3. Adjust if needed (reduce memory or regions)

---

**Questions?**

- Check current bill: `fly dashboard`
- View machine status: `fly status -a vtchat`
- Contact me if costs exceed expectations
