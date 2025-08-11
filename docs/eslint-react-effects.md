# ESLint Rules for React Effects Best Practices

## Recommended ESLint Rules

Add these rules to your ESLint configuration to help prevent unnecessary effects:

```json
{
    "rules": {
        // Prevent exhaustive deps violations
        "react-hooks/exhaustive-deps": "error",

        // Warn about effects that might not be needed
        "react-hooks/rules-of-hooks": "error",

        // Custom rules (if using eslint-plugin-react-hooks-extra)
        "react-hooks-extra/no-unnecessary-use-effect": "warn",
        "react-hooks-extra/prefer-use-state-lazy-initialization": "warn"
    }
}
```

## Custom ESLint Rule Ideas

### 1. Detect Derived State in Effects

```javascript
// BAD - Should trigger warning
useEffect(() => {
    setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// GOOD - Calculated during render
const fullName = firstName + ' ' + lastName;
```

### 2. Detect Event Handler Logic in Effects

```javascript
// BAD - Should trigger warning
useEffect(() => {
    if (isSubmitted) {
        showNotification('Form submitted!');
    }
}, [isSubmitted]);

// GOOD - In event handler
const handleSubmit = () => {
    // ... submit logic
    showNotification('Form submitted!');
};
```

### 3. Detect State Reset Patterns

```javascript
// BAD - Should suggest key prop
useEffect(() => {
    setComment('');
}, [userId]);

// GOOD - Use key prop
<CommentForm key={userId} />;
```

## Implementation

To implement these rules, you could:

1. Use existing plugins like `eslint-plugin-react-hooks-extra`
2. Create custom ESLint rules for your specific patterns
3. Use code review guidelines to catch these patterns

## Code Review Checklist

When reviewing effects, ask:

- [ ] Is this synchronizing with an external system?
- [ ] Could this be calculated during render instead?
- [ ] Should this logic be in an event handler?
- [ ] Could the `key` prop reset state instead?
- [ ] Are the dependencies minimal and stable?
- [ ] Is cleanup properly handled?
