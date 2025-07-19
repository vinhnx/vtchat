# OAuth Social Authentication Setup

VTChat supports multiple OAuth providers for seamless social authentication. This guide covers the setup and configuration for all supported providers.

## Supported Providers

- **GitHub** - Professional development community
- **Google** - Universal social login
- **Twitter/X** - Social media authentication

## Current Implementation Status

### ✅ GitHub OAuth

- **Status**: Fully implemented and configured
- **Environment Variables**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Features**: Profile image mapping, email scope access

### ✅ Google OAuth

- **Status**: Fully implemented and configured
- **Environment Variables**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Features**: OpenID Connect, profile image mapping

### ✅ Twitter/X OAuth

- **Status**: Fully implemented and ready for credentials
- **Environment Variables**: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
- **Features**: New X logo, API v2 support with email scope

## Implementation Details

### Backend Configuration

All OAuth providers are configured in [`apps/web/lib/auth-server.ts`](../apps/web/lib/auth-server.ts):

```typescript
socialProviders: {
    github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        scope: ['read:user', 'user:email'],
        mapProfileToUser: profile => ({
            image: profile.avatar_url,
        }),
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scope: ['openid', 'email', 'profile'],
        mapProfileToUser: profile => ({
            image: profile.picture,
        }),
    },
    twitter: {
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    },
},
```

### Frontend UI Components

Social authentication buttons are implemented in [`apps/web/components/login-form.tsx`](../apps/web/components/login-form.tsx):

- Google OAuth button with brand styling
- GitHub OAuth button with GitHub logo
- Twitter/X OAuth button with new X logo

### Account Linking Support

All OAuth providers support secure account linking:

- Users can link multiple social accounts to one VTChat account
- Requires same email address for security
- Trusted providers: `['google', 'github', 'twitter']`

## Setup Instructions

### Twitter/X OAuth Setup

1. **Create Twitter App**
    - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
    - Create a new application
    - Configure OAuth 2.0 settings

2. **Configure Callback URLs**
    - **Development**: `http://localhost:3000/api/auth/callback/twitter`
    - **Production**: `https://vtchat.io.vn/api/auth/callback/twitter`

3. **Request Email Scope**
    - Enable "Request email from users" in Twitter app settings
    - This allows VTChat to retrieve user email addresses

4. **Set Environment Variables**
    ```bash
    TWITTER_CLIENT_ID=your_twitter_client_id
    TWITTER_CLIENT_SECRET=your_twitter_client_secret
    ```

### GitHub OAuth Setup (Already Configured)

1. **GitHub Developer Settings**
    - Go to GitHub Settings > Developer settings > OAuth Apps
    - Create new OAuth App

2. **Configure Application**
    - **Application name**: VTChat
    - **Homepage URL**: `https://vtchat.io.vn`
    - **Authorization callback URL**: `https://vtchat.io.vn/api/auth/callback/github`

### Google OAuth Setup (Already Configured)

1. **Google Cloud Console**
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create/select project
    - Enable Google+ API

2. **OAuth 2.0 Credentials**
    - Create OAuth 2.0 client ID
    - Add authorized redirect URIs
    - Configure consent screen

## Security Features

### Account Linking Security

- **Email Verification**: Requires same email for account linking
- **Trusted Providers**: Only whitelisted providers can be linked
- **Single Account**: Multiple OAuth accounts link to one VTChat account

### Session Management

- **Better Auth Integration**: Modern session handling
- **Secure Cookies**: HTTPOnly, Secure, SameSite attributes
- **Session Isolation**: Per-user session management

### Rate Limiting

- **OAuth Endpoints**: Protected against abuse
- **User-Specific Limits**: Individual rate limiting per user
- **Arcjet Integration**: Advanced security layer

## Testing OAuth Integration

### Development Testing

1. Ensure environment variables are set
2. Start development server: `bun run dev`
3. Test each OAuth provider:
    - Click social login buttons
    - Verify successful authentication
    - Check account linking functionality

### Production Verification

1. Verify callback URLs are correctly configured
2. Test OAuth flows in production environment
3. Monitor authentication metrics
4. Validate security headers and CORS settings

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
    - Ensure callback URLs match exactly in OAuth app settings
    - Check both development and production URLs

2. **Missing Email Permissions**
    - Verify email scope is requested in OAuth configuration
    - Check provider app settings for email permissions

3. **Environment Variables**
    - Ensure all required environment variables are set
    - Verify variable names match exactly

### Debug Steps

1. Check browser network tab for OAuth errors
2. Review server logs for authentication failures
3. Verify OAuth app configuration in provider settings
4. Test with different browsers/incognito mode

## Benefits of Multi-Provider OAuth

### User Experience

- **Convenience**: Users can choose their preferred login method
- **Speed**: Faster registration and login process
- **Familiarity**: Use existing social accounts

### Security

- **No Password Storage**: VTChat doesn't store user passwords
- **OAuth Security**: Leverage provider security infrastructure
- **Account Recovery**: Multiple recovery options through linked accounts

### Business Value

- **Reduced Friction**: Lower barriers to user registration
- **Higher Conversion**: Improved signup rates
- **User Trust**: Established provider credibility

---

_For detailed security implementation, see [SECURITY.md](./SECURITY.md)_  
_For account linking details, see [ACCOUNT_LINKING.md](./ACCOUNT_LINKING.md)_

_Last Updated: June 30, 2025_
