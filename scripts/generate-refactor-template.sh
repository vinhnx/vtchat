#!/bin/bash

# Script to generate a template for refactoring a component or module
# Usage: ./generate-refactor-template.sh [component|module|hook] [name] [original_file]

# Set default values and get arguments
TYPE=${1:-"component"}
NAME=${2:-"Example"}
ORIGINAL_FILE=${3:-""}
OUTPUT_DIR=""
PASCAL_NAME="$(echo ${NAME:0:1} | tr '[:lower:]' '[:upper:]')${NAME:1}"
CAMEL_NAME="$(echo ${NAME:0:1} | tr '[:upper:]' '[:lower:]')${NAME:1}"
KEBAB_NAME=$(echo "$NAME" | sed -r 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')

# Determine output directory based on type
case $TYPE in
  "component")
    OUTPUT_DIR="packages/common/components/${KEBAB_NAME}"
    ;;
  "module")
    OUTPUT_DIR="packages/common/modules/${KEBAB_NAME}"
    ;;
  "hook")
    OUTPUT_DIR="packages/common/hooks"
    FILE_PREFIX="use-"
    CAMEL_NAME="use${PASCAL_NAME}"
    KEBAB_NAME="use-${KEBAB_NAME}"
    ;;
  *)
    echo "Invalid type. Use 'component', 'module', or 'hook'."
    exit 1
    ;;
esac

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Generate types file
if [ "$TYPE" == "component" ] || [ "$TYPE" == "module" ]; then
  cat > "${OUTPUT_DIR}/types.ts" << EOF
/**
 * Types for ${PASCAL_NAME} ${TYPE}
 * Extracted from: ${ORIGINAL_FILE}
 */

export interface ${PASCAL_NAME}Props {
  // Add your props here
}

export interface ${PASCAL_NAME}State {
  // Add your state here
}
EOF
  echo "Created ${OUTPUT_DIR}/types.ts"
fi

# Generate main file based on type
if [ "$TYPE" == "component" ]; then
  cat > "${OUTPUT_DIR}/${KEBAB_NAME}.tsx" << EOF
'use client';

import { useState } from 'react';
import type { ${PASCAL_NAME}Props } from './types';

/**
 * ${PASCAL_NAME} Component
 * Extracted from: ${ORIGINAL_FILE}
 */
export const ${PASCAL_NAME} = ({ 
  // Destructure props here
}: ${PASCAL_NAME}Props) => {
  // Component logic here
  
  return (
    <div className="...">
      {/* Component JSX here */}
    </div>
  );
};
EOF
  echo "Created ${OUTPUT_DIR}/${KEBAB_NAME}.tsx"

elif [ "$TYPE" == "module" ]; then
  cat > "${OUTPUT_DIR}/${KEBAB_NAME}.ts" << EOF
/**
 * ${PASCAL_NAME} Module
 * Extracted from: ${ORIGINAL_FILE}
 */
import type { ${PASCAL_NAME}Props, ${PASCAL_NAME}State } from './types';

/**
 * Main function for ${PASCAL_NAME} module
 */
export const ${CAMEL_NAME} = () => {
  // Module logic here
};

/**
 * Additional helper functions
 */
export const ${CAMEL_NAME}Helper = () => {
  // Helper function logic
};
EOF
  echo "Created ${OUTPUT_DIR}/${KEBAB_NAME}.ts"

elif [ "$TYPE" == "hook" ]; then
  cat > "${OUTPUT_DIR}/${KEBAB_NAME}.tsx" << EOF
'use client';

import { useState, useEffect } from 'react';

/**
 * ${CAMEL_NAME} Hook
 * Extracted from: ${ORIGINAL_FILE}
 */
export const ${CAMEL_NAME} = (/* parameters */) => {
  // Hook state
  const [state, setState] = useState();
  
  // Hook effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Hook methods
  const handleSomething = () => {
    // Method logic
  };
  
  // Return hook API
  return {
    state,
    handleSomething,
  };
};
EOF
  echo "Created ${OUTPUT_DIR}/${KEBAB_NAME}.tsx"
fi

# Generate index file for easy imports
cat > "${OUTPUT_DIR}/index.ts" << EOF
/**
 * Export all ${TYPE} functionality
 */
export * from './${TYPE === "hook" ? KEBAB_NAME : TYPE === "component" ? KEBAB_NAME : KEBAB_NAME}';
${TYPE !== "hook" ? "export * from './types';" : ""}
EOF
echo "Created ${OUTPUT_DIR}/index.ts"

# Generate example usage file
if [ "$TYPE" == "component" ]; then
  cat > "${OUTPUT_DIR}/example-usage.tsx" << EOF
'use client';

import { ${PASCAL_NAME} } from './${KEBAB_NAME}';

/**
 * Example of how to use the ${PASCAL_NAME} component
 */
export const Example = () => {
  return (
    <${PASCAL_NAME} 
      // Props go here
    />
  );
};
EOF
  echo "Created ${OUTPUT_DIR}/example-usage.tsx"

elif [ "$TYPE" == "module" ]; then
  cat > "${OUTPUT_DIR}/example-usage.ts" << EOF
import { ${CAMEL_NAME} } from './${KEBAB_NAME}';

/**
 * Example of how to use the ${PASCAL_NAME} module
 */
export const exampleUsage = () => {
  const result = ${CAMEL_NAME}();
  return result;
};
EOF
  echo "Created ${OUTPUT_DIR}/example-usage.ts"

elif [ "$TYPE" == "hook" ]; then
  cat > "${OUTPUT_DIR}/example-usage.tsx" << EOF
'use client';

import { ${CAMEL_NAME} } from './${KEBAB_NAME}';

/**
 * Example of how to use the ${CAMEL_NAME} hook
 */
export const Example = () => {
  const { state, handleSomething } = ${CAMEL_NAME}();
  
  return (
    <div>
      {/* Example usage */}
      <button onClick={handleSomething}>Action</button>
    </div>
  );
};
EOF
  echo "Created ${OUTPUT_DIR}/example-usage.tsx"
fi

echo ""
echo "✅ Generated ${TYPE} template for ${PASCAL_NAME} in ${OUTPUT_DIR}"
echo ""
echo "Next steps:"
echo "1. Extract the actual code from ${ORIGINAL_FILE}"
echo "2. Update imports in the new files"
echo "3. Replace extracted code in the original file with imports"
echo "4. Test to ensure functionality is preserved"