# React Scan Integration Guide

React Scan has been integrated into VT Chat to help monitor React performance and identify slow renders during development.

## Overview

React Scan is a performance monitoring tool that:

- Highlights components when they re-render
- Identifies unnecessary re-renders
- Tracks render times and performance bottlenecks
- Provides visual feedback about component rendering patterns

## Usage

### Development Mode

React Scan is automatically enabled in development mode when you run:

```bash
bun dev
```

You'll see:

- A toolbar in the top-right corner of the browser
- Visual highlights when components re-render
- Console logs for slow renders (if logging is enabled)

### CLI Scanning

You can also run React Scan externally to scan your running application:

```bash
# Start the development server and React Scan CLI together
bun dev:scan

# Or run React Scan CLI separately against a running app
bun scan
```

### Environment Variables

Configure React Scan behavior with these environment variables:

```bash
# Force enable in production (STRONGLY NOT RECOMMENDED - only works in dev anyway)
REACT_SCAN_FORCE_PRODUCTION=true

# Enable console logging for debugging (only works in development)
REACT_SCAN_LOG=true

# Set threshold for slow render detection (default: 10ms)
REACT_SCAN_SLOW_THRESHOLD=20
```

## Deployment Safety

React Scan is configured with multiple safety layers to ensure it **NEVER** runs in production:

- ✅ Only enabled when `NODE_ENV === 'development'`
- ✅ Automatically disabled on deployment platforms (Vercel, Fly.io, Netlify, Render, Railway, Heroku)
- ✅ Multiple runtime environment checks
- ✅ Even "force production" flag is limited to development only
- ✅ Early exit if any deployment environment is detected

## Features

### Visual Highlighting

- **Blue/Green**: Normal re-renders
- **Yellow/Orange**: Slower re-renders
- **Red**: Very slow re-renders
- **Gray**: Unnecessary re-renders (when `trackUnnecessaryRenders` is enabled)

### Toolbar Controls

- **Enable/Disable**: Toggle scanning on/off
- **Settings**: Adjust animation speed, logging, and tracking options
- **Report**: View detailed performance reports

### Console Logging

When `REACT_SCAN_LOG=true`, you'll see:

- Slow render warnings with component names and timing
- Heavy render cycle detection
- Performance monitoring status

## Performance Impact

- **Development**: Minimal impact, designed for development use
- **Production/Deployment**: **COMPLETELY DISABLED** - Multiple safety layers prevent activation
- **Logging**: Can add overhead when enabled (development only)

## Deployment Safety Features

React Scan includes comprehensive safety measures:

1. **Environment Detection**: Automatically detects deployment platforms
2. **Multiple Checks**: NODE_ENV, platform variables, and runtime verification
3. **Early Exit**: Returns immediately if not in local development
4. **Error Boundaries**: Graceful handling of initialization failures
5. **Console Warnings**: Logs blocking reasons when activation is prevented

## Common Use Cases

### Identifying Performance Issues

1. Enable React Scan in development
2. Interact with your application normally
3. Look for components that re-render frequently (lots of highlighting)
4. Check console for slow render warnings

### Debugging Unnecessary Re-renders

1. Set `trackUnnecessaryRenders: true` (enabled by default in dev)
2. Look for gray highlights indicating unnecessary re-renders
3. Check if props/state changes are actually meaningful

### Optimizing Component Performance

1. Use React Scan to identify bottlenecks
2. Apply React.memo(), useMemo(), useCallback() where appropriate
3. Verify improvements by observing reduced highlighting

## Integration Details

### File Structure

```
apps/web/
├── components/
│   └── react-scan.tsx           # React Scan component
├── lib/config/
│   └── react-scan.ts           # Configuration
└── app/
    └── layout.tsx              # Integration point
```

### Configuration

- Settings in `lib/config/react-scan.ts`
- Environment-based activation
- Customizable thresholds and options

### Safety Features

- **Development-Only Activation**: Automatically enabled only in local development
- **Deployment Platform Detection**: Blocked on Vercel, Fly.io, Netlify, Render, Railway, Heroku
- **Multiple Environment Checks**: NODE_ENV + platform-specific variables
- **Runtime Verification**: Additional checks during component initialization
- **Error Handling**: Graceful fallbacks for initialization failures

## Best Practices

1. **Keep Enabled in Development**: Always run with React Scan during development
2. **Monitor Console**: Watch for slow render warnings
3. **Use CLI Scanning**: Great for testing specific pages or flows
4. **Don't Enable in Production**: **IMPOSSIBLE** - Multiple safety layers prevent production activation
5. **Adjust Thresholds**: Customize slow render thresholds based on your performance targets
6. **Verify Safety**: Check console for React Scan status messages during development

## Troubleshooting

### React Scan Not Showing

- Check that you're in development mode
- Verify the component is included in your layout
- Check browser console for initialization messages

### Performance Issues

- Disable logging if it's impacting performance
- Reduce `trackUnnecessaryRenders` if overhead is too high
- Consider disabling if working on performance-critical features

### Configuration Not Working

- Verify environment variables are set correctly
- Check the configuration file for typos
- Restart the development server after changing environment variables

## Safety Verification

You can verify React Scan is properly configured by checking the browser console in development:

### In Local Development

```
[React Scan] Performance monitoring initialized {
  environment: 'development',
  trackUnnecessaryRenders: true,
  logging: false,
  deployment: false
}
```

### In Deployment (Blocked)

```
[React Scan] Blocked: Deployment environment detected
```

### Manual Testing

To test the safety configuration manually:

```bash
# Should enable (local development)
NODE_ENV=development bun dev

# Should block (simulated deployment)
NODE_ENV=development VERCEL=1 bun dev
NODE_ENV=development FLY_APP_NAME=myapp bun dev
```

## Links

- [React Scan GitHub](https://github.com/aidenybai/react-scan)
- [React Scan Documentation](https://react-scan.com)
- [Performance Optimization Guide](./performance-optimization.md)
