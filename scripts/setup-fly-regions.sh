#!/bin/bash
# Script to setup Fly.io machines in Singapore and USA regions

set -e

APP_NAME="vtchat"
PRIMARY_REGION="sin"  # Singapore
SECONDARY_REGION="iad"  # USA (Ashburn, Virginia)

echo "🚀 Setting up Fly.io multi-region deployment"
echo "Primary region: $PRIMARY_REGION (Singapore)"
echo "Secondary region: $SECONDARY_REGION (USA - Ashburn)"

# Get current machines
echo ""
echo "📋 Current machines:"
fly machines list -a "$APP_NAME"

# Machine IDs from status
MACHINE1="3d8d1736a73789"  # twilight-dawn-5387
MACHINE2="3287e560fd4685"  # solitary-sea-7930

echo ""
echo "🔧 Configuration plan:"
echo "  - Keep machine $MACHINE1 in Singapore (sin)"
echo "  - Move/recreate machine $MACHINE2 to USA (iad)"

# Ask for confirmation
read -p "Continue with this setup? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Destroy the second Singapore machine
echo ""
echo "🗑️  Destroying second Singapore machine ($MACHINE2)..."
fly machines destroy "$MACHINE2" -a "$APP_NAME" --force || echo "⚠️  Machine may already be destroyed"

# Create a new machine in USA region
echo ""
echo "🇺🇸 Creating new machine in USA ($SECONDARY_REGION)..."
fly machines clone "$MACHINE1" --region "$SECONDARY_REGION" -a "$APP_NAME"

# List final configuration
echo ""
echo "✅ Setup complete! Current machines:"
fly machines list -a "$APP_NAME"

echo ""
echo "📊 Checking app status:"
fly status -a "$APP_NAME"

echo ""
echo "✨ Multi-region setup complete!"
echo "   - Primary: Singapore (sin)"
echo "   - Secondary: USA (iad)"
echo ""
echo "💡 Tips:"
echo "   - Machines auto-suspend when idle (min_machines_running = 0)"
echo "   - They auto-start on incoming requests"
echo "   - Primary region (sin) handles most routing decisions"
echo ""
echo "💰 Cost Optimization:"
echo "   - Target: <$5/month"
echo "   - Auto-suspend keeps costs low"
echo "   - Expected: $2-4/month with typical traffic"
echo "   - Monitor: fly dashboard for first week"
echo ""
echo "📊 Check costs: https://fly.io/dashboard/personal/billing"
