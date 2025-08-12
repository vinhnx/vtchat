// Test script to verify React Scan safety configuration
import { REACT_SCAN_CONFIG } from '../lib/config/react-scan.ts';

console.log('🔍 React Scan Safety Configuration Test');
console.log('=====================================');

console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    FLY_APP_NAME: process.env.FLY_APP_NAME,
    NETLIFY: process.env.NETLIFY,
    RENDER: process.env.RENDER,
});

console.log('\nReact Scan Config:', {
    enabled: REACT_SCAN_CONFIG.enabled,
    shouldRun: REACT_SCAN_CONFIG.shouldRun,
    isDeployment: REACT_SCAN_CONFIG.isDeployment,
    showToolbar: REACT_SCAN_CONFIG.showToolbar,
    log: REACT_SCAN_CONFIG.log,
});

console.log('\nSafety Checks:');
console.log('✅ Development only:', REACT_SCAN_CONFIG.enabled);
console.log('✅ Should run:', REACT_SCAN_CONFIG.shouldRun);
console.log('✅ Not deployment:', !REACT_SCAN_CONFIG.isDeployment);

if (REACT_SCAN_CONFIG.shouldRun) {
    console.log('\n🟢 React Scan would initialize in this environment');
} else {
    console.log('\n🔴 React Scan BLOCKED in this environment (as expected)');
}
