#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Interactive deployment script for VT Chat
echo -e "${PURPLE}🚀 VT Chat Interactive Deployment Pipeline${NC}"
echo "=============================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}📋 $1${NC}"
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./deploy-fly.sh                    # Interactive deployment"
    echo "  ./deploy-fly.sh --auto             # Non-interactive deployment"
    echo "  ./deploy-fly.sh --version <type>   # Specify version bump (patch/minor/major)"
    echo "  ./deploy-fly.sh --help             # Show this help"
    echo ""
    echo -e "${YELLOW}Features:${NC}"
    echo "  • Interactive version selection (patch/minor/major)"
    echo "  • Git dirty state checking"
    echo "  • Semantic versioning with timestamps"
    echo "  • Automatic git tagging and pushing"
    echo "  • Fly.io deployment integration"
    echo "  • Build optimization with cache"
    exit 0
fi

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    print_error "flyctl is not installed. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    print_error "Not logged in to Fly.io. Please run: flyctl auth login"
    exit 1
fi

print_status "flyctl is installed and user is authenticated"

# Function to get current version from git tags
get_current_version() {
    local latest_tag=$(git tag --list --sort=-version:refname | head -1)
    if [ -z "$latest_tag" ]; then
        echo "0.0.0"
    else
        echo "$latest_tag" | sed 's/^v//'
    fi
}

# Function to increment version
increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -r major minor patch <<< "$version"
    
    case $type in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            print_error "Invalid version type: $type"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Function to check git status
check_git_status() {
    print_step "Checking git repository status..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes:"
        git status --porcelain
        echo ""
        
        if [ "$1" != "--auto" ]; then
            read -p "Do you want to commit these changes? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                read -p "Enter commit message: " commit_message
                if [ -z "$commit_message" ]; then
                    print_error "Commit message cannot be empty!"
                    exit 1
                fi
                git add -A
                git commit -m "$commit_message"
                print_status "Changes committed successfully"
            else
                print_error "Please commit or stash your changes before deploying"
                exit 1
            fi
        else
            print_error "Uncommitted changes detected in auto mode. Please commit first."
            exit 1
        fi
    else
        print_status "Working directory is clean"
    fi
    
    # Check if we're on main/master branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_warning "You're not on main/master branch (current: $current_branch)"
        if [ "$1" != "--auto" ]; then
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
}

# Function to create version tag
create_version_tag() {
    local version_type=$1
    local auto_mode=$2
    
    print_step "Creating version tag..."
    
    local current_version=$(get_current_version)
    print_info "Current version: v$current_version"
    
    # Determine version type
    if [ -z "$version_type" ] && [ "$auto_mode" != "--auto" ]; then
        echo ""
        echo "Select version bump type:"
        echo "1) patch (v$current_version -> v$(increment_version $current_version patch))"
        echo "2) minor (v$current_version -> v$(increment_version $current_version minor))"
        echo "3) major (v$current_version -> v$(increment_version $current_version major))"
        echo ""
        read -p "Enter choice (1-3): " choice
        
        case $choice in
            1) version_type="patch" ;;
            2) version_type="minor" ;;
            3) version_type="major" ;;
            *) print_error "Invalid choice"; exit 1 ;;
        esac
    elif [ -z "$version_type" ]; then
        version_type="patch"  # Default for auto mode
    fi
    
    local new_version=$(increment_version $current_version $version_type)
    local timestamp=$(date +"%Y%m%d.%H%M%S")
    local build_number="build-$timestamp"
    local tag_name="v$new_version"
    
    print_info "New version: $tag_name ($build_number)"
    
    # Create tag with build info
    local tag_message="Release $tag_name

Build: $build_number
Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
Branch: $(git branch --show-current)
Commit: $(git rev-parse --short HEAD)
Fly.io App: vtchat"
    
    if [ "$auto_mode" != "--auto" ]; then
        read -p "Create tag $tag_name? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            print_error "Tag creation cancelled"
            exit 1
        fi
    fi
    
    git tag -a "$tag_name" -m "$tag_message"
    print_status "Created tag: $tag_name"
    
    # Set build ID for Next.js
    export BUILD_ID="$new_version-$timestamp"
    echo "BUILD_ID=$BUILD_ID" > .env.build
    
    echo "$tag_name"
}

# Function to push to remote
push_to_remote() {
    local tag_name=$1
    local auto_mode=$2
    
    print_step "Pushing to remote repository..."
    
    if [ "$auto_mode" != "--auto" ]; then
        read -p "Push changes and tags to remote? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            print_warning "Skipping remote push"
            return
        fi
    fi
    
    # Push commits and tags
    git push origin $(git branch --show-current)
    git push origin "$tag_name"
    
    print_status "Pushed to remote repository"
}

# Function to deploy to Fly.io
deploy_to_fly() {
    local tag_name=$1
    local auto_mode=$2
    
    print_step "Deploying to Fly.io..."
    
    # Enable BuildKit for optimization
    export DOCKER_BUILDKIT=1
    
    # App configuration
    local FLY_APP="vtchat"
    
    print_info "App: $FLY_APP"
    print_info "Version: $tag_name"
    print_info "Config: fly.toml"
    
    if [ "$auto_mode" != "--auto" ]; then
        read -p "Deploy to Fly.io? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            print_warning "Skipping Fly.io deployment"
            return
        fi
    fi
    
    # Check if app exists
    if ! flyctl apps list | grep -q "^$FLY_APP" 2>/dev/null; then
        print_warning "App '$FLY_APP' does not exist. Creating it..."
        flyctl apps create "$FLY_APP" --region sin
        print_status "App '$FLY_APP' created successfully"
    fi
    
    # Deploy
    print_status "Starting deployment..."
    
    if flyctl deploy --app "$FLY_APP"; then
        print_status "Deployment completed successfully!"
        echo ""
        echo "🌐 Your app is available at:"
        echo "   https://vtchat.io.vn"
        echo "   https://vtchat.fly.dev"
        echo ""
        
        # Show app status
        flyctl status --app "$FLY_APP"
        
        print_status "🎉 Deployment completed!"
    else
        print_error "Deployment failed!"
        exit 1
    fi
}

# Main deployment pipeline
main() {
    local auto_mode=""
    local version_type=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --auto)
                auto_mode="--auto"
                shift
                ;;
            --version)
                version_type="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    echo ""
    print_step "Starting deployment pipeline..."
    
    # Step 1: Check git status
    check_git_status "$auto_mode"
    
    # Step 2: Create version tag
    local tag_name=$(create_version_tag "$version_type" "$auto_mode")
    
    # Step 3: Push to remote
    push_to_remote "$tag_name" "$auto_mode"
    
    # Step 4: Deploy to Fly.io
    deploy_to_fly "$tag_name" "$auto_mode"
    
    # Cleanup
    rm -f .env.build
    
    echo ""
    print_status "✨ Deployment pipeline completed successfully!"
    echo -e "${YELLOW}📊 Summary:${NC}"
    echo -e "${YELLOW}  Version: $tag_name${NC}"
    echo -e "${YELLOW}  App: vtchat${NC}"
    echo -e "${YELLOW}  URL: https://vtchat.io.vn${NC}"
}

# Run main function with all arguments
main "$@"
