#!/bin/bash

# Fix Web Search Production Configuration
# This script helps diagnose and fix web search issues on production

set -e

APP_NAME="vtchat"
PRODUCTION_URL="https://vtchat.io.vn"

echo "🔍 VTChat Web Search Production Fix"
echo "=================================="
echo ""

# Function to check if fly CLI is installed
check_fly_cli() {
    if ! command -v fly &> /dev/null; then
        echo "❌ Fly CLI not found. Please install it first:"
        echo "   curl -L https://fly.io/install.sh | sh"
        exit 1
    fi
    echo "✅ Fly CLI found"
}

# Function to check current web search status
check_web_search_status() {
    echo "🔍 Checking current web search status..."
    
    response=$(curl -s "${PRODUCTION_URL}/api/debug/web-search" || echo "ERROR")
    
    if [ "$response" = "ERROR" ]; then
        echo "❌ Failed to connect to production API"
        return 1
    fi
    
    echo "📊 Current Status:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # Check if GEMINI_API_KEY is missing
    has_gemini_key=$(echo "$response" | jq -r '.webSearchConfig.hasGeminiApiKey' 2>/dev/null || echo "false")
    
    if [ "$has_gemini_key" = "false" ]; then
        echo "❌ GEMINI_API_KEY is missing from production environment"
        return 1
    else
        echo "✅ GEMINI_API_KEY is configured"
        return 0
    fi
}

# Function to set GEMINI_API_KEY
set_gemini_api_key() {
    echo "🔧 Setting GEMINI_API_KEY..."
    echo ""
    echo "Please enter your Gemini API key:"
    echo "(It should be 39 characters starting with 'AIza')"
    read -s -p "GEMINI_API_KEY: " api_key
    echo ""
    
    if [ ${#api_key} -ne 39 ]; then
        echo "⚠️  Warning: API key length is ${#api_key}, expected 39 characters"
    fi
    
    if [[ ! $api_key =~ ^AIza ]]; then
        echo "⚠️  Warning: API key doesn't start with 'AIza'"
    fi
    
    echo "Setting secret in Fly.io..."
    fly secrets set GEMINI_API_KEY="$api_key" --app "$APP_NAME"
    
    echo "✅ GEMINI_API_KEY set successfully"
    echo ""
    echo "🔄 Restarting application to pick up new secret..."
    fly apps restart "$APP_NAME"
    
    echo "⏳ Waiting 30 seconds for restart to complete..."
    sleep 30
}

# Function to verify fix
verify_fix() {
    echo "🧪 Verifying fix..."
    echo ""
    
    for i in {1..3}; do
        echo "Attempt $i/3..."
        if check_web_search_status; then
            echo "✅ Web search is now working!"
            return 0
        fi
        
        if [ $i -lt 3 ]; then
            echo "⏳ Waiting 10 seconds before retry..."
            sleep 10
        fi
    done
    
    echo "❌ Web search still not working after fix attempt"
    return 1
}

# Function to show manual steps
show_manual_steps() {
    echo "📋 Manual Fix Steps:"
    echo "==================="
    echo ""
    echo "1. Get a Gemini API key from Google AI Studio:"
    echo "   https://aistudio.google.com/app/apikey"
    echo ""
    echo "2. Set it as a Fly.io secret:"
    echo "   fly secrets set GEMINI_API_KEY=\"your_key_here\" --app $APP_NAME"
    echo ""
    echo "3. Restart the application:"
    echo "   fly apps restart $APP_NAME"
    echo ""
    echo "4. Verify the fix:"
    echo "   curl $PRODUCTION_URL/api/debug/web-search"
    echo ""
}

# Main execution
main() {
    check_fly_cli
    echo ""
    
    if check_web_search_status; then
        echo "✅ Web search is already working correctly!"
        exit 0
    fi
    
    echo ""
    echo "🔧 Web search needs to be fixed."
    echo ""
    echo "Options:"
    echo "1. Automatically fix (requires Gemini API key)"
    echo "2. Show manual steps"
    echo "3. Exit"
    echo ""
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            set_gemini_api_key
            verify_fix
            ;;
        2)
            show_manual_steps
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
