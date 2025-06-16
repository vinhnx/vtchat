# Make Changelog Prompt

## Purpose

Generate comprehensive changelogs for VT releases based on git commits, pull requests, and development changes.

## Usage

Use this prompt to create detailed changelogs that follow conventional commit standards and provide clear information for users and developers.

## Prompt Template

```markdown
# Changelog Generator for VT

You are a technical writer specializing in creating comprehensive changelogs for software releases. Generate a changelog for VT based on the provided information.

## Context
- **Project**: VT - Privacy-focused AI chat application
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Better Auth, Creem.io payments
- **Architecture**: Turborepo monorepo with subscription tiers (VT_BASE, VT_PLUS)

## Input Information
Please provide:
1. **Version Number**: (e.g., v1.2.0)
2. **Release Date**: (e.g., 2025-06-14)
3. **Git Commits**: (paste recent commits or describe changes)
4. **Pull Requests**: (list merged PRs if available)
5. **Manual Changes**: (any additional features/fixes not in commits)

## Changelog Format

Generate a changelog following this structure:

### [Version] - YYYY-MM-DD

#### 🚀 New Features
- **Feature Category**: Description of new functionality
- **Subscription Features**: VT+ exclusive features
- **UI/UX Improvements**: Interface enhancements

#### 🔧 Improvements
- **Performance**: Speed and optimization improvements
- **Developer Experience**: Code quality, tooling improvements
- **Security**: Security enhancements

#### 🐛 Bug Fixes
- **Critical Fixes**: High-priority bug fixes
- **Minor Fixes**: Small bug fixes and edge cases

#### 🔒 Security
- **Authentication**: Auth-related security improvements
- **Data Privacy**: Privacy and data protection enhancements

#### 📱 UI/UX
- **Design**: Visual improvements
- **Accessibility**: A11y improvements
- **Mobile**: Mobile experience enhancements

#### 🛠️ Technical
- **Dependencies**: Package updates
- **Infrastructure**: Build, deployment, config changes
- **API Changes**: Breaking or non-breaking API changes

#### 📚 Documentation
- **Guides**: New or updated documentation
- **Code Comments**: Improved code documentation

## Guidelines

1. **User-Focused**: Write for end users, not just developers
2. **Clear Categories**: Use emoji icons for visual clarity
3. **Impact Level**: Prioritize high-impact changes
4. **Breaking Changes**: Clearly mark breaking changes with ⚠️
5. **VT+ Features**: Clearly indicate subscription-only features
6. **Links**: Include relevant links to documentation or issues when possible

## Example Entry

#### 🚀 New Features
- **Web Search Gating**: Added VT+ subscription gating for web search functionality with proper upgrade dialogs
- **Image Upload Protection**: Implemented subscription checks for image uploads in advanced chat modes
- **Unified Dialogs**: Migrated all upgrade prompts to use consistent LoginRequiredDialog styling

#### 🔧 Improvements
- **Feature Gating**: Enhanced GatedFeatureAlert component with improved visual consistency
- **Error Handling**: Consolidated all login-required alerts to use centralized LoginRequiredDialog component

#### 🐛 Bug Fixes
- **Dialog Consistency**: Fixed inconsistent styling across subscription upgrade dialogs
- **TypeScript Safety**: Resolved type errors in dialog component implementations

## Output Format
Please format the changelog in standard Markdown that can be:
1. Added to CHANGELOG.md file
2. Used in GitHub releases
3. Shared with users in documentation
4. Posted on social media or blog posts

## Additional Considerations
- Include migration notes for breaking changes
- Mention compatibility requirements
- Add acknowledgments for contributors
- Reference related issues/PRs with numbers
```

## Example Usage

When you want to generate a changelog:

1. Copy the prompt template above
2. Fill in the input information section with:
   - Current version number
   - Release date
   - Recent git commits (use `git log --oneline --since="2 weeks ago"`)
   - Merged pull requests
   - Any manual changes not captured in commits
3. Submit to AI assistant
4. Review and edit the generated changelog
5. Add to project CHANGELOG.md file

## VT-Specific Categories

### Subscription Features

- Always mark VT+ exclusive features
- Include pricing/upgrade information when relevant
- Mention free tier improvements

### Privacy & Security

- Highlight privacy-focused changes
- Mention data protection improvements
- Note security enhancements

### Chat Experience

- AI model updates
- Chat interface improvements
- Message handling enhancements

### Authentication

- Better Auth integration updates
- Login/logout improvements
- User management features

## Git Command Helpers

```bash
# Get commits since last release
git log --oneline --since="2 weeks ago"

# Get commits between tags
git log --oneline v1.1.0..HEAD

# Get changed files
git diff --name-only v1.1.0..HEAD

# Get commit count
git rev-list --count v1.1.0..HEAD
```

This prompt template ensures consistent, comprehensive changelogs that serve both technical and non-technical audiences while highlighting VT's unique features and subscription model.
