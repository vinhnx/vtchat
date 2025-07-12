# Bash Syntax Highlighting Documentation

## 🎨 Overview

VT Chat includes comprehensive bash syntax highlighting powered by Prism.js with custom color schemes for both light and dark modes.

## ✅ Supported Languages

### Primary:
- `bash` - Main bash syntax highlighting
- `sh` - Shell scripts (aliases to bash)
- `shell` - Generic shell scripts (aliases to bash)

### Shell Variants:
- `zsh` - Z shell scripts
- `fish` - Fish shell scripts  
- `ksh` - Korn shell scripts
- `csh` - C shell scripts
- `tcsh` - TENEX C shell scripts

### Additional:
- `powershell` - PowerShell scripts (Windows)

## 🎯 Syntax Elements

### Comments
```bash
# This is a comment
# TODO: Add error handling
```
**Styling:** Gray color (`#797979` light, `#ffffff5c` dark)

### Strings
```bash
echo "Hello World!"
echo 'Single quotes'
echo `command substitution`
```
**Styling:** Green color (`#16a34a` light, `#86efac` dark)

### Variables
```bash
NAME="John"
AGE=30
echo "$NAME is $AGE years old"
echo "${HOME}/Documents"
```
**Styling:** Purple color (`#9f42f5` light, `#b8a6ff` dark)

### Keywords
```bash
if [ condition ]; then
    echo "true"
elif [ other_condition ]; then
    echo "maybe"
else
    echo "false"
fi

for i in {1..10}; do
    echo $i
done

while [ $counter -lt 10 ]; do
    echo $counter
    ((counter++))
done

case $var in
    pattern1) echo "match1" ;;
    pattern2) echo "match2" ;;
    *) echo "default" ;;
esac
```
**Styling:** Purple color (`#c267ce` light, `#d99fff` dark)

### Functions
```bash
function greet() {
    local name=$1
    echo "Hello, $name!"
}

# Alternative syntax
greet() {
    echo "Hi there!"
}
```
**Styling:** Blue color (`#215ddf` light, `#7dd3fc` dark)

### Operators
```bash
if [ $a -eq $b ]; then     # numeric equality
if [ $a -gt $b ]; then     # greater than
if [ "$str1" = "$str2" ]; then  # string equality
if [ -f "$file" ]; then    # file exists
if [ -d "$dir" ]; then     # directory exists
```
**Styling:** Yellow color (`#ca8a04` light, `#fbbf24` dark)

### Built-in Commands
```bash
echo "output"
printf "formatted %s\n" "string"
read -p "Enter name: " name
export PATH="/usr/local/bin:$PATH"
cd /home/user
ls -la
grep pattern file.txt
```
**Styling:** Green color (`#16a34a` light, `#86efac` dark)

### Numbers
```bash
COUNT=42
DECIMAL=3.14
```
**Styling:** Purple color (`#9f42f5` light, `#b8a6ff` dark)

### Shebangs
```bash
#!/bin/bash
#!/usr/bin/env bash
#!/bin/sh
```
**Styling:** Green color with bold weight

## 🎨 Color Scheme

### Light Mode
- **Background**: Light gray
- **Text**: Dark gray (`#212121`)
- **Comments**: Gray (`#797979`)
- **Strings**: Green (`#16a34a`)
- **Keywords**: Purple (`#c267ce`)
- **Functions**: Blue (`#215ddf`)
- **Variables**: Purple (`#9f42f5`)
- **Operators**: Yellow (`#ca8a04`)

### Dark Mode
- **Background**: Dark gray
- **Text**: Light gray (`#f8fafc`)
- **Comments**: Light gray with opacity (`#ffffff5c`)
- **Strings**: Light green (`#86efac`)
- **Keywords**: Light purple (`#d99fff`)
- **Functions**: Light blue (`#7dd3fc`)
- **Variables**: Light purple (`#b8a6ff`)
- **Operators**: Light yellow (`#fbbf24`)

## 📝 Usage Examples

### Basic Script
```bash
#!/bin/bash

# Variables
USER_NAME="admin"
PASSWORD_FILE="/etc/passwd"

# Check if user exists
if grep -q "^$USER_NAME:" "$PASSWORD_FILE"; then
    echo "User $USER_NAME exists"
else
    echo "User $USER_NAME not found"
fi
```

### Advanced Script
```bash
#!/bin/bash

# Function definition
check_service() {
    local service_name=$1
    
    if systemctl is-active --quiet "$service_name"; then
        echo "✅ $service_name is running"
        return 0
    else
        echo "❌ $service_name is not running"
        return 1
    fi
}

# Array of services
SERVICES=("nginx" "mysql" "redis")

# Check each service
for service in "${SERVICES[@]}"; do
    check_service "$service"
done

# Exit with appropriate code
exit $?
```

### Shell Variants
```fish
# Fish shell
function greet
    set name $argv[1]
    echo "Hello, $name from Fish!"
end
```

```zsh
# Z shell
typeset -A config
config[user]="admin"
config[host]="localhost"

for key value in ${(kv)config}; do
    echo "$key: $value"
done
```

## 🔧 Technical Implementation

### Prism.js Components
- `prism-bash` - Core bash syntax highlighting
- Custom CSS overrides for enhanced styling
- Language aliases for shell variants

### File Structure
```
packages/common/components/code-block/
├── code-block.tsx          # Main component with language detection
├── code-block.css          # Custom Prism.js styling
└── bash-syntax-highlighting.md  # This documentation
```

### Language Detection
The CodeBlock component automatically detects bash syntax using:
1. Direct language specification: `bash`, `sh`, `shell`
2. Language aliases for shell variants
3. Fallback to plaintext if language not supported

## 🚀 Usage in Markdown

### Code Blocks
````markdown
```bash
#!/bin/bash
echo "This will be syntax highlighted!"
```
````

### Inline Code
```markdown
Use `chmod +x script.sh` to make it executable.
```

## 🎯 Benefits

1. **Enhanced Readability**: Color-coded syntax makes bash scripts easier to read
2. **Error Prevention**: Syntax highlighting helps identify mistakes
3. **Professional Appearance**: Clean, modern styling matches VT Chat design
4. **Accessibility**: High contrast colors work well in both light and dark modes
5. **Shell Agnostic**: Works with multiple shell variants

## 🔄 Future Enhancements

- [ ] Add syntax highlighting for shell script parameters
- [ ] Enhanced heredoc (`<<EOF`) syntax support
- [ ] Better array and associative array highlighting
- [ ] Command substitution (`$()` vs backticks) differentiation
- [ ] Shell-specific keyword highlighting (fish, zsh extensions)
