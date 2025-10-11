# Fly.io Multi-Region Setup - Action Items

## Status: Ready to Execute

### Current State

✅ You have 2 machines, both in Singapore (sin):

- Machine 1 (3d8d1736a73789): `twilight-dawn-5387` - suspended
- Machine 2 (3287e560fd4685): `solitary-sea-7930` - starting

### Target State

🎯 2 machines in different regions:

- Machine 1: Singapore (sin) - **Keep as-is** (primary)
- Machine 2: USA Ashburn (iad) - **Create new**

### Configuration Match

Both machines will have identical config from the Singapore machine:

- ✅ Memory: 512MB
- ✅ CPU: 1 shared CPU
- ✅ Same environment variables
- ✅ Same health checks
- ✅ Auto-suspend/start enabled

## How to Execute

### Option 1: Automated Script (Recommended)

```bash
cd /Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat
./scripts/setup-fly-regions.sh
```

The script will:

1. Show current machines
2. Ask for confirmation
3. Destroy second Singapore machine
4. Clone primary machine to USA (iad)
5. Verify final setup

### Option 2: Manual Commands

```bash
# Destroy second Singapore machine
fly machines destroy 3287e560fd4685 -a vtchat --force

# Clone primary to USA
fly machines clone 3d8d1736a73789 --region iad -a vtchat

# Verify
fly machines list -a vtchat
fly status -a vtchat
```

## What Happens After Setup

### Routing Behavior

- **Singapore traffic**: Routed to Singapore machine
- **USA traffic**: Routed to USA machine
- **Other regions**: Routed to nearest machine (sin or iad)

### Cost Impact

- **Before**: 2 machines in Singapore = ~$7/month (with auto-suspend)
- **After**: 1 Singapore + 1 USA = ~$7/month (same cost, better coverage)
- Auto-suspend keeps costs low when traffic is low

### Performance

- **Asia-Pacific users**: Low latency (Singapore)
- **USA users**: Much lower latency (Ashburn vs Singapore)
- **Cold starts**: 2-5 seconds when machine wakes from suspend
- **Active**: Instant response times

## Verification Steps

After running the setup:

```bash
# 1. Check machines are in correct regions
fly machines list -a vtchat

# Expected output:
# ID              NAME                REGION  STATE
# 3d8d1736a73789  twilight-dawn-5387  sin     suspended
# <new-id>        <new-name>          iad     suspended

# 2. Check overall status
fly status -a vtchat

# 3. Test health endpoint
curl -I https://vtchat.io.vn/api/health

# 4. Wake machines by accessing app
open https://vtchat.io.vn
```

## Rollback Plan

If something goes wrong:

```bash
# List all machines
fly machines list -a vtchat --all

# If USA machine has issues, destroy it
fly machines destroy <usa-machine-id> -a vtchat --force

# Clone Singapore machine again if needed
fly machines clone 3d8d1736a73789 --region sin -a vtchat
```

## Files Created/Updated

✅ Created:

- `scripts/setup-fly-regions.sh` - Automated setup script
- `docs/fly-multi-region-setup.md` - Comprehensive guide
- `docs/fly-multi-region-action-items.md` - This file

✅ Updated:

- `fly.toml` - Updated comments for multi-region

## Next Actions

1. **Run the setup script** when ready:
   ```bash
   ./scripts/setup-fly-regions.sh
   ```

2. **Monitor for first 24 hours**:
   - Check logs: `fly logs -a vtchat`
   - Check status: `fly status -a vtchat`
   - Verify both regions: Test from different locations

3. **Review costs after 1 week**:
   - Check Fly.io dashboard
   - Verify auto-suspend is working
   - Adjust `min_machines_running` if needed

## Questions?

- **Why Ashburn (iad)?** - Good coverage for US East Coast, close to major US population centers
- **Why not Los Angeles (lax)?** - Can add later if needed for US West Coast
- **What about Europe?** - Can add London (lhr) or Frankfurt (fra) if you have European users
- **Cost concerns?** - Auto-suspend keeps costs low, typically $5-15/month total

## MCP Integration

Your MCP config at `vscode-userdata:/Users/vinh.nguyenxuan/Library/Application Support/Code/User/mcp.json` is already set up correctly:

```json
"flymcp": {
    "command": "/Users/vinh.nguyenxuan/flymcp/flymcp",
    "args": [],
    "env": {},
    "disabled": false,
    "autoApprove": ["fly-logs", "fly-status"],
    "type": "stdio"
}
```

You can continue using MCP tools to monitor:

- `fly-status` - Check app status
- `fly-logs` - View logs

---

**Ready to proceed?** Run the setup script whenever you're ready! 🚀
