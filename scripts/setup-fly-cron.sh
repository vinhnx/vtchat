#!/bin/bash

# Setup database maintenance using GitHub Actions (Cost-Optimized)
# This approach avoids dedicated cron machines to keep costs under $5/month

set -e

echo "🚀 Setting up cost-optimized database maintenance..."
echo "💰 Target: Monthly cost under $5 USD"
echo ""

# Check if required secrets are set
echo "📋 Checking required secrets..."

if ! gh secret list | grep -q "CRON_SECRET_TOKEN"; then
    echo "⚠️  Setting up CRON_SECRET_TOKEN secret..."
    echo "Please enter a secure token for cron job authentication:"
    read -s CRON_SECRET
    echo "$CRON_SECRET" | gh secret set CRON_SECRET_TOKEN
    echo "✅ CRON_SECRET_TOKEN secret set"
else
    echo "✅ CRON_SECRET_TOKEN already exists"
fi

if ! gh secret list | grep -q "FLY_APP_URL"; then
    echo "⚠️  Setting up FLY_APP_URL secret..."
    FLY_APP_URL="https://vtchat.io.vn"
    echo "$FLY_APP_URL" | gh secret set FLY_APP_URL
    echo "✅ FLY_APP_URL secret set to $FLY_APP_URL"
else
    echo "✅ FLY_APP_URL already exists"
fi

echo ""
echo "🎯 Cost-optimized database maintenance setup complete!"
echo ""
echo "💰 Cost Optimization:"
echo "   ✅ Using GitHub Actions instead of dedicated cron machine"
echo "   ✅ Main app: 512MB memory, scale-to-zero enabled"
echo "   ✅ Estimated monthly cost: <$4 USD"
echo ""
echo "📅 Scheduled tasks (GitHub Actions):"
echo "   ⏰ Hourly maintenance: Every hour"
echo "   📅 Weekly maintenance: Sundays at 2 AM UTC"
echo ""
echo "🔧 Manual trigger:"
echo "   gh workflow run database-maintenance.yml -f maintenance_type=hourly"
echo "   gh workflow run database-maintenance.yml -f maintenance_type=weekly"
echo ""
echo "📊 Monitor at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
echo ""
echo "💡 Next steps:"
echo "   1. Deploy optimized config: fly deploy --config fly.toml"
echo "   2. Monitor costs: fly dashboard billing"
echo "   3. Test maintenance: gh workflow run database-maintenance.yml -f maintenance_type=hourly"
echo ""
echo "📖 See docs/fly-cost-optimization.md for detailed cost management"
