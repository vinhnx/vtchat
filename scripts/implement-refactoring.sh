#!/bin/bash

# Script to assist with implementing the large file refactoring plan
# Usage: ./implement-refactoring.sh [file-number]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Large File Refactoring Implementation Helper${NC}"
echo "This script helps you implement the refactoring plan step by step."

# Check if a file number was provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Please select a file to refactor:${NC}"
  echo "1. packages/common/store/chat.store.ts (1970 lines)"
  echo "2. packages/ai/workflow/utils.ts (1461 lines)"
  echo "3. packages/common/components/side-bar.tsx (1019 lines)"
  echo "4. packages/common/components/user-profile-settings.tsx (910 lines)"
  echo "5. packages/common/hooks/agent-provider.tsx (888 lines)"
  read -p "Enter a number (1-5): " file_number
else
  file_number=$1
fi

# Validate input
if ! [[ "$file_number" =~ ^[1-5]$ ]]; then
  echo -e "${RED}Invalid selection. Please enter a number between 1 and 5.${NC}"
  exit 1
fi

# Define file paths and new directories based on selection
case $file_number in
  1)
    file_path="packages/common/store/chat.store.ts"
    echo -e "${GREEN}Preparing to refactor: chat.store.ts${NC}"
    
    # Create directories for extracted modules
    mkdir -p packages/common/store/chat
    
    # List the extraction steps
    echo -e "${YELLOW}Refactoring Steps:${NC}"
    echo "1. Extract types to packages/common/store/chat/types.ts"
    echo "2. Extract database operations to packages/common/store/chat/database.ts"
    echo "3. Extract notification system to packages/common/store/chat/notifications.ts"
    echo "4. Extract batch processing to packages/common/store/chat/batch-processing.ts"
    echo "5. Create thread store in packages/common/store/chat/thread-store.ts"
    echo "6. Create thread item store in packages/common/store/chat/thread-item-store.ts"
    echo "7. Create UI store in packages/common/store/chat/ui-store.ts"
    echo "8. Refactor main file to use the extracted modules"
    ;;
    
  2)
    file_path="packages/ai/workflow/utils.ts"
    echo -e "${GREEN}Preparing to refactor: workflow/utils.ts${NC}"
    
    # Create directories for extracted modules
    mkdir -p packages/ai/workflow/modules
    
    # List the extraction steps
    echo -e "${YELLOW}Refactoring Steps:${NC}"
    echo "1. Extract types to packages/ai/workflow/modules/types.ts"
    echo "2. Extract ChunkBuffer to packages/ai/workflow/modules/chunk-buffer.ts"
    echo "3. Extract text generation to packages/ai/workflow/modules/text-generation.ts"
    echo "4. Extract web utilities to packages/ai/workflow/modules/web-utils.ts"
    echo "5. Extract event management to packages/ai/workflow/modules/event-manager.ts"
    echo "6. Extract model selection to packages/ai/workflow/modules/model-selection.ts"
    echo "7. Extract error handling to packages/ai/workflow/modules/error-handling.ts"
    echo "8. Refactor main file to use the extracted modules"
    ;;
    
  3)
    file_path="packages/common/components/side-bar.tsx"
    echo -e "${GREEN}Preparing to refactor: side-bar.tsx${NC}"
    
    # Create directories for extracted components and hooks
    mkdir -p packages/common/components/sidebar
    mkdir -p packages/common/hooks/sidebar
    
    # List the extraction steps
    echo -e "${YELLOW}Refactoring Steps:${NC}"
    echo "1. Extract types to packages/common/components/sidebar/types.ts"
    echo "2. Extract utility functions to packages/common/components/sidebar/utils.ts"
    echo "3. Extract user section to packages/common/components/sidebar/user-section.tsx"
    echo "4. Extract action buttons to packages/common/components/sidebar/action-buttons.tsx"
    echo "5. Extract subscription section to packages/common/components/sidebar/subscription-section.tsx"
    echo "6. Extract thread history to packages/common/components/sidebar/thread-history.tsx"
    echo "7. Extract pagination to packages/common/components/sidebar/pagination.tsx"
    echo "8. Create hook for pagination in packages/common/hooks/sidebar/use-pagination.tsx"
    echo "9. Create hook for thread groups in packages/common/hooks/sidebar/use-thread-groups.tsx"
    echo "10. Refactor main component to use the extracted parts"
    ;;
    
  4)
    file_path="packages/common/components/user-profile-settings.tsx"
    echo -e "${GREEN}Preparing to refactor: user-profile-settings.tsx${NC}"
    
    # Create directories for extracted components
    mkdir -p packages/common/components/user-profile
    mkdir -p packages/common/hooks/user-profile
    mkdir -p packages/common/api
    
    # List the extraction steps
    echo -e "${YELLOW}Refactoring Steps:${NC}"
    echo "1. Extract types to packages/common/components/user-profile/types.ts"
    echo "2. Extract profile form to packages/common/components/user-profile/profile-form.tsx"
    echo "3. Extract account security to packages/common/components/user-profile/account-security.tsx"
    echo "4. Extract social account section to packages/common/components/user-profile/social-account-section.tsx"
    echo "5. Extract social account item to packages/common/components/user-profile/social-account-item.tsx"
    echo "6. Create profile form hook in packages/common/hooks/user-profile/use-profile-form.tsx"
    echo "7. Create account linking hook in packages/common/hooks/user-profile/use-account-linking.tsx"
    echo "8. Extract profile API functions to packages/common/api/profile-api.ts"
    echo "9. Extract account linking API to packages/common/api/account-linking-api.ts"
    echo "10. Refactor main component to use the extracted parts"
    ;;
    
  5)
    file_path="packages/common/hooks/agent-provider.tsx"
    echo -e "${GREEN}Preparing to refactor: agent-provider.tsx${NC}"
    
    # Create directories for extracted modules
    mkdir -p packages/common/context
    mkdir -p packages/common/store
    mkdir -p packages/common/types
    mkdir -p packages/common/hooks/agent
    mkdir -p packages/common/api
    
    # List the extraction steps
    echo -e "${YELLOW}Refactoring Steps:${NC}"
    echo "1. Extract types to packages/common/types/agent-types.ts"
    echo "2. Extract context to packages/common/context/agent-context.tsx"
    echo "3. Extract store to packages/common/store/agent-store.ts"
    echo "4. Extract agent tools hook to packages/common/hooks/agent/use-agent-tools.tsx"
    echo "5. Extract agent execution hook to packages/common/hooks/agent/use-agent-execution.tsx"
    echo "6. Extract agent history hook to packages/common/hooks/agent/use-agent-history.tsx"
    echo "7. Extract API integration to packages/common/api/agent-api.ts"
    echo "8. Refactor main provider to use the extracted parts"
    ;;
esac

echo ""
echo -e "${BLUE}Implementation Strategy:${NC}"
echo "1. Use 'cp' to make a backup of the file before refactoring"
echo "2. For each step, extract the relevant code to the new file"
echo "3. Update imports in the new file"
echo "4. Replace the extracted code in the original file with imports"
echo "5. Run tests after each extraction to verify functionality"
echo ""
echo -e "${GREEN}Ready to start refactoring ${file_path}${NC}"
echo "Follow the detailed instructions in refactoring-plan.md"
echo ""
echo -e "${YELLOW}Remember to:${NC}"
echo "- Run 'bun run build' frequently to check for errors"
echo "- Run 'bun run test' to ensure functionality is preserved"
echo "- Commit changes after each major extraction step"
echo ""
echo -e "${BLUE}Good luck with the refactoring!${NC}"