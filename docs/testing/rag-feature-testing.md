# RAG Chatbot Feature Testing Guide

## Overview
This guide provides comprehensive testing instructions for the new RAG (Retrieval-Augmented Generation) Knowledge Chat feature implemented in VT+.

## Prerequisites

### 1. Database Setup
The RAG feature requires PostgreSQL with pgvector extension. The necessary tables should already be created:
- `resources` - stores user's knowledge content
- `embeddings` - stores vector embeddings with HNSW index

### 2. API Keys Required
- **OpenAI API Key**: For OpenAI embedding model (`text-embedding-ada-002`)
- **Google AI API Key**: For Gemini embedding model (`text-embedding-004`)

Set these in your `.env.local` file:
```bash
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

### 3. User Account & Subscription
- Must be signed in to VT
- Must have VT+ subscription (feature is gated)
- Only models with `"tool_call": true` support RAG functionality

## Feature Access & Navigation

### 1. Accessing RAG Chat
1. **Sidebar Navigation**: Look for "RAG Chat" button in the sidebar
   - For VT+ users: Direct access to `/rag`
   - For free users: Shows "Plus" badge, redirects to upgrade page

2. **Direct URL**: Navigate to `/rag` in your browser
   - VT+ users: Access RAG interface
   - Free users: Upgrade prompt with feature benefits

### 2. Plus Tier Validation
Test that feature gating works correctly:
- **Free users**: Should see upgrade prompt with RAG feature description
- **VT+ users**: Should access full RAG chatbot interface

## Core RAG Functionality Testing

### 1. Basic Knowledge Storage
Test adding information to your knowledge base:

```
Test Input: "My favorite programming language is Python because it's readable and has great libraries."
Expected: Tool call indicator → "Adding to knowledge base..." → Confirmation message
```

```
Test Input: "The capital of France is Paris. It's known for the Eiffel Tower and the Louvre Museum."
Expected: Automatic storage without confirmation prompt (as specified in system prompt)
```

### 2. Knowledge Retrieval
Test querying stored information:

```
Test Query: "What's my favorite programming language?"
Expected: Retrieves Python information and explains the reasons
```

```
Test Query: "Tell me about Paris"
Expected: Returns information about Paris, Eiffel Tower, and Louvre Museum
```

### 3. Multi-Step Conversations
Test complex interactions:

```
Conversation:
1. "I work as a software engineer at Google"
2. "My main project involves machine learning and natural language processing"
3. "What do you know about my work?"
Expected: Combines information from both inputs
```

### 4. Unknown Information Handling
Test behavior when information isn't in knowledge base:

```
Test Query: "What's my dog's name?"
Expected: "Sorry, I don't know." (since no pet information was stored)
```

## Embedding Model Selection Testing

### 1. Settings Access
1. Go to Settings → Preferences
2. Find "RAG Embedding Model" section with Plus badge
3. Verify dropdown shows both options:
   - OpenAI Ada 002 (OpenAI • 1536D)
   - Gemini Text Embedding 004 (Google • 768D)

### 2. Model Switching
1. Switch between OpenAI and Gemini models
2. Add new information after switching
3. Verify both models work for storage and retrieval
4. Note: Different models may have slightly different semantic understanding

### 3. Persistence Testing
1. Change embedding model in settings
2. Refresh the page
3. Verify setting is persisted
4. Test that new embeddings use the selected model

## UI/UX Testing

### 1. RAG Chatbot Interface
- **Empty State**: Shows database icon with helpful instructions
- **Message Display**: User and assistant messages with proper styling
- **Tool Indicators**: Shows "Adding to knowledge base..." or "Searching knowledge base..."
- **Loading States**: Proper loading indicators during processing

### 2. Feature Gating UI
- **Free User Experience**: Clear upgrade prompt with feature benefits
- **Navigation Badge**: "Plus" badge visible for free users
- **Upgrade Flow**: Clicking upgrade redirects to `/plus` page

### 3. Settings Interface
- **Embedding Model Selector**: Dropdown with model descriptions
- **Plus Badge**: Clearly indicates this is a premium feature
- **Model Information**: Shows provider and vector dimensions

## Error Scenarios Testing

### 1. Missing API Keys
- Remove API keys from environment
- Try to add knowledge
- Should show appropriate error handling

### 2. Network Issues
- Test with poor connection
- Verify graceful degradation and error messages

### 3. Invalid Content
- Try adding empty content
- Test with extremely long content
- Verify validation and error handling

## Performance Testing

### 1. Large Knowledge Base
- Add 20+ pieces of information
- Test retrieval performance
- Verify search accuracy doesn't degrade

### 2. Concurrent Operations
- Add multiple pieces of information quickly
- Test system responsiveness

### 3. Vector Search Accuracy
- Add similar but distinct information
- Test semantic search retrieval accuracy
- Verify most relevant content is returned

## Advanced Testing Scenarios

### 1. Mixed Content Types
```
Add These Types:
1. Personal preferences: "I prefer dark mode interfaces"
2. Work information: "I'm a React developer"
3. Technical knowledge: "Redux is a state management library"
4. General facts: "The iPhone was released in 2007"

Test Queries:
- "What are my UI preferences?"
- "What's my job?"
- "Explain Redux"
- "When was the iPhone released?"
```

### 2. Contextual Understanding
```
Sequential Information:
1. "I'm learning machine learning"
2. "I'm focusing on neural networks"
3. "My current project uses TensorFlow"

Test Query: "Tell me about my ML studies"
Expected: Combines all related information contextually
```

### 3. Edge Cases
- Very short information: "I like coffee"
- Technical jargon: Add programming code snippets
- Multiple languages: Add content in different languages
- Contradictory information: Add conflicting facts and test retrieval

## Documentation & Help Testing

### 1. Help Center Section
- Navigate to `/faq`
- Find "RAG Knowledge Chat" section
- Verify comprehensive feature explanation
- Test all described functionality

### 2. Feature Discovery
- Check pricing page for RAG feature listing
- Verify feature accordion includes RAG description
- Test feature marketing copy accuracy

## Success Criteria

### ✅ Basic Functionality
- [ ] Knowledge storage works correctly
- [ ] Knowledge retrieval is accurate
- [ ] Feature gating prevents free user access
- [ ] Both embedding models function properly

### ✅ User Experience
- [ ] Intuitive navigation and access
- [ ] Clear tool call indicators
- [ ] Responsive interface
- [ ] Helpful error messages

### ✅ Plus Integration
- [ ] Proper subscription validation
- [ ] Settings integration works
- [ ] Upgrade flow is seamless
- [ ] Feature marketing is clear

### ✅ Technical Performance
- [ ] Fast response times
- [ ] Accurate semantic search
- [ ] Proper error handling
- [ ] Data persistence

## Common Issues & Solutions

### Issue: "Tools not working"
**Solution**: Verify you're using a model with `"tool_call": true` in models-data.json

### Issue: "No knowledge retrieved"
**Solution**: Check similarity threshold (currently 0.5) and ensure related content was added

### Issue: "Settings not saving"
**Solution**: Verify localStorage permissions and browser settings

### Issue: "Upgrade prompt not showing"
**Solution**: Check subscription status and ensure user is properly identified as free tier

## Reporting Issues
When reporting issues, include:
1. User subscription status (Free/VT+)
2. Selected AI model
3. Selected embedding model
4. Browser and version
5. Steps to reproduce
6. Expected vs actual behavior
7. Console errors (if any)

---

**Note**: This RAG feature represents a significant enhancement to VT+ capabilities. Thorough testing ensures a premium user experience worthy of the subscription tier.
