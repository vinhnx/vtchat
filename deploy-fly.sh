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
echo -e "${PURPLE}VT Chat Interactive Deployment Pipeline${NC}" >&2
echo "===============================================" >&2

# Function to print colored output
print_status() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" >&2
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}" >&2
}

print_step() {
    echo -e "${CYAN}[STEP] $1${NC}" >&2
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
    echo "  • Git dirty state checking with user confirmation"
    echo "  • Semantic versioning with timestamps"
    echo "  • Automatic git tagging and pushing"
    echo "  • Changelog generation with changelogithub"
    echo "  • Fly.io deployment integration"
    echo "  • Build optimization with cache"
    echo ""
    echo -e "${YELLOW}Environment Variables:${NC}"
    echo "  GITHUB_TOKEN    GitHub token for changelog generation (optional)"
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

# Check if Node.js is installed (required for changelogithub)
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Changelog generation will be skipped."
    NODE_AVAILABLE=false
else
    NODE_AVAILABLE=true
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

    # Extract only numeric parts, ignore any suffixes like -beta.1
    local clean_version=$(echo "$version" | sed 's/-.*$//')
    IFS='.' read -r major minor patch <<< "$clean_version"

    # Ensure we have numeric values
    major=${major:-0}
    minor=${minor:-0}
    patch=${patch:-0}

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
    local auto_mode=$1

    print_step "Checking git repository status..."

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes:"
        git status --porcelain >&2
        echo "" >&2

        # If in auto mode, automatically commit changes
        if [ "$auto_mode" = "--auto" ]; then
            print_info "In auto mode - automatically committing changes..."
            git add -A
            git commit -m "Auto-commit before deployment"
            print_status "Changes committed successfully"
        else
            # In interactive mode, always ask
            echo -n "Do you want to commit these changes before deployment? (y/N): " >&2
            read -r answer
            
            if [[ "$answer" =~ ^[Yy]$ ]]; then
                print_info "Committing changes..."
                git add -A
                git commit -m "Commit before deployment"
                print_status "Changes committed successfully"
            else
                print_info "Proceeding without committing changes..."
            fi
        fi
    else
        print_status "Working directory is clean"
    fi

    # Check if we're on main/master branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_warning "You're not on main/master branch (current: $current_branch)"
        if [ "$auto_mode" != "--auto" ]; then
            echo -n "Do you want to continue anyway? (y/N): " >&2
            read -r answer
            
            if [[ ! "$answer" =~ ^[Yy]$ ]]; then
                print_error "Deployment cancelled by user."
                exit 1
            fi
        else
            print_info "Continuing deployment anyway (auto mode)..."
        fi
    fi
}

# Function to generate changelog
generate_changelog() {
    local tag_name=$1
    local previous_tag=$2

    if [ "$NODE_AVAILABLE" = false ]; then
        print_warning "Skipping changelog generation (Node.js not available)"
        return
    fi

    print_step "Generating changelog..."

    # Try to generate changelog using changelogithub
    if command -v npx &> /dev/null; then
        print_info "Using changelogithub to generate changelog..."
        
        # Set the GITHUB_TOKEN if it exists in environment
        local github_token_args=""
        if [ -n "$GITHUB_TOKEN" ]; then
            github_token_args="--github-token $GITHUB_TOKEN"
        fi
        
        # Generate changelog in dry-run mode to see what would be generated
        # We redirect stderr to stdout to capture all output, then filter out the URL line
        # Use a temporary file in the system temp directory to avoid any permission issues
        local temp_changelog=$(mktemp)
        if npx changelogithub --dry $github_token_args 2>&1 | grep -v "Using the following link" > "$temp_changelog"; then
            # Check if the changelog has meaningful content (not just version info)
            if grep -q "Features\|Bug Fixes\|Performance" "$temp_changelog"; then
                print_info "Changelog preview:"
                # Redirect preview to stderr so function callers can safely capture stdout
                head -20 "$temp_changelog" >&2
                print_status "Changelog generated successfully (preview above)"
            else
                print_info "No significant changes to include in changelog"
            fi
        else
            print_warning "Failed to generate changelog with changelogithub"
        fi
        
        # Clean up temp file
        rm -f "$temp_changelog"
    else
        print_warning "npx not found, skipping changelog generation"
    fi
}

# Function to create version tag
create_version_tag() {
    local version_type=$1
    local auto_mode=$2

    print_step "Creating version tag..."

    local current_version=$(get_current_version)
    local previous_tag="v$current_version"
    print_info "Current version: $previous_tag"

    # Default to patch version if not specified
    if [ -z "$version_type" ]; then
        version_type="patch"
    fi

    local new_version=$(increment_version $current_version $version_type)
    local tag_name="v$new_version"

    print_info "New version: $tag_name"

    # Generate changelog before creating tag
    generate_changelog "$tag_name" "$previous_tag"

    # Create tag
    # Sanitize the tag message to avoid any special characters that might cause issues
    local current_branch=$(git branch --show-current)
    local commit_hash=$(git rev-parse --short HEAD)
    local tag_message="Release $tag_name

Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
Branch: ${current_branch}
Commit: ${commit_hash}
Fly.io App: vtchat"

    print_info "Creating tag $tag_name..."

    git tag -a "$tag_name" -m "$tag_message"
    print_status "Created tag: $tag_name"

    echo "$tag_name"
}

# Function to push to remote
push_to_remote() {
    local tag_name=$1
    local auto_mode=$2

    print_step "Pushing to remote repository..."

    # Get current branch name and ensure it's clean
    local current_branch=$(git branch --show-current)
    
    # Validate branch name
    if [ -z "$current_branch" ]; then
        print_error "Could not determine current branch"
        exit 1
    fi

    # Push commits and tags
    print_info "Pushing branch: $current_branch"
    if ! git push origin "$current_branch"; then
        print_error "Failed to push branch $current_branch"
        exit 1
    fi
    
    print_info "Pushing tag: $tag_name"
    if ! git push origin "$tag_name"; then
        print_error "Failed to push tag $tag_name"
        exit 1
    fi

    print_status "Pushed to remote repository"
}

# Function to build the application
build_application() {
    print_step "Building Next.js application..."

    # Check if bun is installed
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install it first:"
        echo "curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        bun install
    fi

    # Build the application
    print_info "Running build command..."
    if bun run build; then
        print_status "Application built successfully"

        # Verify standalone build exists
        if [ ! -d "apps/web/.next/standalone" ]; then
            print_error "Standalone build not found at apps/web/.next/standalone"
            print_error "Check your Next.js configuration for output: 'standalone'"
            exit 1
        fi

        if [ ! -d "apps/web/.next/static" ]; then
            print_error "Static build not found at apps/web/.next/static"
            exit 1
        fi

        print_status "Build verification completed"
    else
        print_error "Build failed with exit code $?"
        exit 1
    fi
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

    # Check if app exists
    if ! flyctl apps list | grep -q "^$FLY_APP" 2>/dev/null; then
        print_warning "App '$FLY_APP' does not exist. Creating it..."
        flyctl apps create "$FLY_APP" --region sin
        print_status "App '$FLY_APP' created successfully"
    fi

    # Deploy
    print_status "Starting deployment..."
    print_info "Running: flyctl deploy --app $FLY_APP"
    print_info "You can also monitor deployment progress at: https://fly.io/apps/$FLY_APP"
    print_info "View deployment logs at: https://fly.io/apps/$FLY_APP/monitoring"

    # Run deployment with verbose output
    if flyctl deploy --app "$FLY_APP" --verbose; then
        print_status "Deployment completed successfully!"
        echo "" >&2
        echo "Your app is available at:" >&2
        echo "   https://vtchat.io.vn" >&2
        echo "   https://vtchat.fly.dev" >&2
        echo "" >&2

        # Show app status
        print_info "Checking app status..."
        flyctl status --app "$FLY_APP"

        print_status "Deployment completed!"
    else
        print_error "Deployment failed with exit code $?"
        print_error "Check the output above for details"
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

    echo "" >&2
    print_step "Starting deployment pipeline..."

    # Step 1: Check git status
    check_git_status "$auto_mode"

    # Step 2: Create version tag
    local tag_name=$(create_version_tag "$version_type" "$auto_mode")

    # Step 3: Push to remote
    push_to_remote "$tag_name" "$auto_mode"

    # Step 4: Build application
    build_application

    # Step 5: Deploy to Fly.io
    deploy_to_fly "$tag_name" "$auto_mode"

    echo "" >&2
    print_status "Deployment pipeline completed successfully!"
    echo -e "${YELLOW}Summary:${NC}" >&2
    echo -e "${YELLOW}  Version: $tag_name${NC}" >&2
    echo -e "${YELLOW}  App: vtchat${NC}" >&2
    echo -e "${YELLOW}  URL: https://vtchat.io.vn${NC}" >&2
}

# Run main function with all arguments
main "$@"
