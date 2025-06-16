# GitHub Actions Railway Deployment Setup Guide

## Overview

This guide explains how to set up GitHub Actions for automatic Railway deployments with branch-based environments:

- **`dev` branch** → Railway Development Environment
- **`main` branch** → Railway Production Environment
- **Pull Requests** → Temporary preview environments

## Created Workflows

### 1. `railway-deploy.yml` - Main Deployment Workflow

**Triggers:**

- Push to `dev` branch → Deploy to Railway development environment
- Push to `main` branch → Deploy to Railway production environment
- Pull requests → Build validation only

**Features:**

- Automatic deployment on branch pushes
- Build validation for PRs
- Environment-specific deployments
- Deployment status comments

### 2. `pr-management.yml` - PR Preview Environments

**Triggers:**

- PR opened/updated targeting `main` → Create production preview
- PR opened/updated targeting `dev` → Create development preview
- PR closed → Clean up preview environment

**Features:**

- Automatic preview environment creation
- Environment cleanup on PR close
- PR comments with preview URLs
- Separate previews for main vs dev targets

## Required Setup

### 1. Railway Token

Create a Railway API token and add it to GitHub secrets:

1. Go to [Railway Dashboard](https://railway.app/account/tokens)
2. Create a new token with full access
3. In your GitHub repo: Settings → Secrets and variables → Actions
4. Add new secret: `RAILWAY_TOKEN` with your token value

### 2. Railway Project ID

Add your Railway project ID as a repository variable:

1. Get your project ID from Railway dashboard URL or CLI: `railway status`
2. In your GitHub repo: Settings → Secrets and variables → Actions → Variables tab
3. Add new variable: `RAILWAY_PROJECT_ID` with your project ID

### 3. GitHub Environments (Optional but Recommended)

Create GitHub environments for additional protection:

1. Go to Settings → Environments
2. Create environments:
   - `development` (for dev branch deployments)
   - `production` (for main branch deployments)
3. Add protection rules as needed (required reviewers, branch restrictions)

## Branch Strategy

### Development Flow

```bash
# Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR to dev branch
# → Triggers preview environment creation
# → Build validation runs

# After PR approval and merge to dev
# → Triggers automatic deployment to Railway development environment
```

### Production Flow

```bash
# When dev is stable, create PR to main
git checkout dev
git pull origin dev
git checkout -b release/v1.0.0

# Create PR from release branch to main
# → Triggers production preview environment
# → Build validation runs

# After PR approval and merge to main
# → Triggers automatic deployment to Railway production environment
```

## Environment URLs

| Environment | URL Pattern | Trigger |
|-------------|-------------|---------|
| **Development** | `https://vtchat-web-development.up.railway.app` | Push to `dev` |
| **Production** | `https://vtchat-web-production.up.railway.app` | Push to `main` |
| **PR Preview (Dev)** | `https://vtchat-web-pr-{number}-dev.up.railway.app` | PR to `dev` |
| **PR Preview (Main)** | `https://vtchat-web-pr-{number}-main.up.railway.app` | PR to `main` |

## Workflow Features

### Build Validation

For all pull requests:

- ✅ Dependencies installation with Bun
- ✅ TypeScript compilation
- ✅ Linting checks
- ✅ Build verification
- ✅ PR comment with validation status

### Deployment Automation

For branch pushes:

- ✅ Automatic Railway CLI installation
- ✅ Environment-specific deployment
- ✅ Deployment status logging
- ✅ Success/failure notifications

### Preview Environments

For pull requests:

- ✅ Automatic environment creation
- ✅ Environment naming: `pr-{number}-{target-branch}`
- ✅ PR comments with preview URLs
- ✅ Automatic cleanup on PR close

## Usage Examples

### Creating a Feature

```bash
# Start from dev
git checkout dev
git pull origin dev
git checkout -b feature/user-authentication

# Make changes and commit
git add .
git commit -m "Implement user authentication"
git push origin feature/user-authentication

# Create PR to dev branch
# This will:
# 1. Create preview environment: pr-123-dev
# 2. Run build validation
# 3. Comment with preview URL
```

### Deploying to Production

```bash
# Ensure dev is ready for production
git checkout dev
git pull origin dev

# Create release branch
git checkout -b release/v1.2.0

# Create PR to main
# This will:
# 1. Create production preview: pr-124-main
# 2. Run build validation
# 3. Comment with preview URL

# After PR approval and merge:
# Automatic deployment to production environment
```

## Monitoring Deployments

### Via GitHub Actions

1. Go to your repo → Actions tab
2. Select the workflow run
3. View logs for deployment details

### Via Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. View deployment history and logs

### Via Railway CLI

```bash
# Check deployment status
railway status

# View logs
railway logs

# Switch environments
railway environment development
railway environment production
```

## Troubleshooting

### Common Issues

1. **Railway Token Invalid**
   - Regenerate token in Railway dashboard
   - Update GitHub secret

2. **Project ID Wrong**
   - Check Railway project URL or run `railway status`
   - Update GitHub repository variable

3. **Environment Creation Fails**
   - Check Railway project limits
   - Verify token permissions

4. **Build Fails**
   - Check build logs in GitHub Actions
   - Verify all environment variables are set in Railway

### Getting Help

1. Check GitHub Actions logs for detailed error messages
2. Check Railway deployment logs in dashboard
3. Use Railway CLI for local debugging: `railway run bun dev`

## Security Notes

- ✅ Railway tokens are stored as GitHub secrets
- ✅ Preview environments are cleaned up automatically
- ✅ Environment variables are managed in Railway dashboard
- ✅ No sensitive data in GitHub Actions workflows

## Next Steps

1. **Set up the required secrets and variables** in GitHub
2. **Test the workflow** by creating a PR to dev branch
3. **Verify deployments** are working correctly
4. **Configure environment protection rules** if needed
5. **Train team members** on the new workflow

---

**Created:** June 16, 2025
**Updated:** June 16, 2025
**Status:** ✅ Ready for use
