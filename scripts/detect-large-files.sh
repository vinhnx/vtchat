#!/bin/bash

# Script to detect large files in the codebase
# This script can be run periodically to identify files that may need refactoring
# Usage: ./detect-large-files.sh [threshold] [output_file]

# Set default values
THRESHOLD=${1:-500}  # Default threshold is 500 lines
OUTPUT_FILE=${2:-"large-files-report.md"}  # Default output file
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Create output file with header
cat > "$OUTPUT_FILE" << EOF
# Large Files Report

Generated on: $TIMESTAMP

This report identifies files in the codebase that exceed the threshold of $THRESHOLD lines.
Large files often benefit from refactoring into smaller, more focused modules.

## Files Exceeding Threshold

| File Path | Line Count | Recommendation |
|-----------|------------|----------------|
EOF

# Find large files and append to the report
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/.next/*" | \
while read -r file; do
  line_count=$(wc -l < "$file")
  if [ "$line_count" -gt "$THRESHOLD" ]; then
    # Determine recommendation based on size
    if [ "$line_count" -gt 1000 ]; then
      recommendation="High priority refactoring needed"
    elif [ "$line_count" -gt 750 ]; then
      recommendation="Medium priority refactoring"
    else
      recommendation="Consider refactoring"
    fi
    
    # Add file to report
    echo "| $file | $line_count | $recommendation |" >> "$OUTPUT_FILE"
  fi
done

# Sort the report by line count (descending)
# First, save the header
head -n 9 "$OUTPUT_FILE" > "${OUTPUT_FILE}.header"
# Then sort the data
tail -n +10 "$OUTPUT_FILE" | sort -t'|' -k3 -nr > "${OUTPUT_FILE}.sorted"
# Combine header and sorted data
cat "${OUTPUT_FILE}.header" "${OUTPUT_FILE}.sorted" > "$OUTPUT_FILE"
rm "${OUTPUT_FILE}.header" "${OUTPUT_FILE}.sorted"

# Add summary and conclusion
echo -e "\n## Summary\n" >> "$OUTPUT_FILE"
TOTAL_FILES=$(grep -c "|" "$OUTPUT_FILE" | awk '{print $1-1}')
echo "Total files exceeding threshold: $TOTAL_FILES" >> "$OUTPUT_FILE"

echo -e "\n## Refactoring Guidelines\n" >> "$OUTPUT_FILE"
echo "When refactoring large files, consider these approaches:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "1. **Extract Types**: Move types to dedicated type files" >> "$OUTPUT_FILE"
echo "2. **Extract Components**: Break down large UI components into smaller ones" >> "$OUTPUT_FILE"
echo "3. **Create Custom Hooks**: Extract stateful logic into reusable hooks" >> "$OUTPUT_FILE"
echo "4. **Separate Concerns**: Split different responsibilities into separate modules" >> "$OUTPUT_FILE"
echo "5. **Implement Incrementally**: Test after each extraction to ensure functionality" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "For a detailed refactoring strategy, refer to the `/refactoring-plan.md` document." >> "$OUTPUT_FILE"

echo "Large files report generated: $OUTPUT_FILE"
echo "Found $TOTAL_FILES files exceeding the threshold of $THRESHOLD lines."