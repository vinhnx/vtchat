# Fly.io Multi-Region Setup Guide

## Current Configuration

### Machines

- **Machine 1** (3d8d1736a73789): Singapore (sin) - Primary
- **Machine 2** (3287e560fd4685): Singapore (sin) - To be moved to USA

### Target Configuration

- **Primary Region**: Singapore (sin) - Serves Asia-Pacific traffic
- **Secondary Region**: USA - Ashburn, Virginia (iad) - Serves US traffic

## Setup Instructions

### Automated Setup (Recommended)

Run the setup script:

```bash
./scripts/setup-fly-regions.sh
```

This script will:

1. Show current machines
2. Destroy the second Singapore machine
3. Clone the first machine to USA (iad) region
4. Verify the final configuration

### Manual Setup

If you prefer manual control:

```bash
# List current machines
fly machines list -a vtchat

# Destroy the second Singapore machine
fly machines destroy 3287e560fd4685 -a vtchat --force

# Clone the primary machine to USA
fly machines clone 3d8d1736a73789 --region iad -a vtchat

# Verify setup
fly status -a vtchat
```

## How It Works

### Auto-Scaling Configuration

From `fly.toml`:

- `auto_stop_machines = 'suspend'` - Machines suspend when idle
- `auto_start_machines = true` - Machines start on incoming requests
- `min_machines_running = 0` - No machines running when idle (cost optimization)

### Routing Strategy

- Primary region (sin) is set in `fly.toml`
- Fly.io routes traffic to the nearest available machine
- If nearest machine is suspended, it auto-starts (takes a few seconds)
- Health checks ensure machines are responding properly

### Resource Configuration

Each machine:

- **Memory**: 512MB
- **CPU**: 1 shared CPU
- **Cost**: ~$3.50/month per machine when active
- **Actual cost**: Much lower due to auto-suspend feature

## Region Codes Reference

Common Fly.io regions:

- `sin` - Singapore (Asia-Pacific)
- `iad` - Ashburn, Virginia (US East)
- `lax` - Los Angeles (US West)
- `dfw` - Dallas (US Central)
- `lhr` - London (Europe)
- `fra` - Frankfurt (Europe)
- `syd` - Sydney (Australia)
- `gru` - São Paulo (South America)

## Monitoring

### Check machine status:

```bash
fly machines list -a vtchat
```

### Check logs:

```bash
fly logs -a vtchat
```

### Check health:

```bash
fly checks list -a vtchat
```

### Wake up a suspended machine:

Machines auto-wake on traffic, but you can manually wake them:

```bash
fly machines start <machine-id> -a vtchat
```

## Troubleshooting

### Machine won't start

```bash
# Check machine logs
fly machines logs <machine-id> -a vtchat

# Restart machine
fly machines restart <machine-id> -a vtchat
```

### Health checks failing

- Verify `/api/health` endpoint is working
- Check if machine has enough memory
- Review logs for errors

### High latency

- Verify machines are running in correct regions
- Check if machines are suspending too frequently
- Consider increasing `min_machines_running` if needed

## Cost Optimization

Current setup with `min_machines_running = 0`:

- Machines only run when there's traffic
- Auto-suspend after idle period
- Typical cost: $5-15/month for light traffic
- Heavy traffic: Up to $7/machine/month

To always keep machines running (better performance, higher cost):

```toml
[http_service]
min_machines_running = 1 # or 2 for both regions
```

## Verification Checklist

After setup, verify:

- [ ] Two machines exist (one in sin, one in iad)
- [ ] Both machines have same configuration
- [ ] Health checks are passing
- [ ] App is accessible from both regions
- [ ] Auto-suspend/start is working

```bash
# Quick verification
fly status -a vtchat
fly machines list -a vtchat
curl -I https://vtchat.io.vn/api/health
```

## Next Steps

1. **Run the setup script** to configure machines
2. **Monitor for 24-48 hours** to ensure stability
3. **Check costs** in Fly.io dashboard
4. **Adjust regions** if needed based on traffic patterns
5. **Consider adding more regions** if serving other continents

## Additional Resources

- [Fly.io Regions](https://fly.io/docs/reference/regions/)
- [Machine Migration](https://fly.io/docs/apps/scale-count/)
- [Auto-scaling](https://fly.io/docs/reference/configuration/#auto-start-and-auto-stop)
