# Document Upload Feature

## Overview

The VTChat application now supports document uploads for enhanced AI conversations. Users can upload PDF, DOC, DOCX, TXT, and MD files as attachments to their messages, allowing AI models to analyze and discuss document content.

## Supported Models

Document upload is currently **only available for Gemini models**:

- gemini-2.0-flash
- gemini-2.5-flash
- gemini-2.0-flash-lite
- gemini-2.5-flash-lite-preview-06-17
- gemini-2.5-flash-preview-05-20
- gemini-2.5-pro-preview-05-06
- gemini-2.5-pro-preview-06-05

The document upload button will only appear when one of these models is selected.

## Supported File Types

- **PDF**: `.pdf` files up to 10MB
- **Word Documents**: `.doc` and `.docx` files up to 10MB
- **Text Files**: `.txt` files up to 10MB
- **Markdown**: `.md` files up to 10MB

## File Size Limitations

- Maximum file size: **10MB**
- Only one document can be attached per message
- Documents are processed as base64-encoded data

## How to Use

1. Select a Gemini model from the chat mode selector
2. Click the document upload button (📎) in the chat input area
3. Choose a supported document file
4. The document will appear as an attachment preview
5. Type your message and send - the AI will analyze both your text and the document
6. **Document Processing**: While Gemini processes the document, you'll see:
   - A processing indicator with the document name
   - A timer showing processing duration
   - A warning if processing takes longer than 30 seconds
   - Option to cancel processing if needed

## User Interface Features

### Document Display in Chat

- **Message View**: Uploaded documents appear in the user message area
- **Thread History**: Documents are visible in conversation history with filename and type
- **Document Actions**: Download, preview (PDF only), and view options available

### Document Side Panel

- **View Document Button**: Click to open document details in a side panel
- **Document Details**: Shows filename, MIME type, and file size
- **Processing Info**: Explains how Gemini handles document analysis
- **Quick Actions**: Download and preview document without leaving the conversation

### Loading States and Progress

- **Document Processing Indicator**: Shows when Gemini is analyzing the document
- **Real-time Timer**: Displays how long processing has been running
- **Warning System**: Alerts if processing takes unusually long (>30 seconds)
- **Cancel Option**: Ability to abort processing and try again
- **Tool Call Indicators**: Enhanced display for document-related AI operations

### Enhanced Tool Call Display

- **Document Tool Recognition**: Special icons and styling for document processing tools
- **Visual Feedback**: Blue-themed indicators for document-related operations
- **Processing Status**: Clear indication when AI is working with document content

## Technical Implementation

### File Processing

- Documents are converted to base64 encoding for transmission
- File metadata (name, type, size) is preserved
- Documents are passed to the AI SDK as file attachments with proper MIME types

### State Management

- Document attachments are stored in the Zustand chat store
- Each thread item can include a `documentAttachment` with base64 data, MIME type, and filename
- Attachments are cleared after message submission

### Component Architecture

The document upload feature consists of several key components:

1. **DocumentUploadButton**: Handles file selection and validation
2. **DocumentAttachment**: Displays attached documents in chat input
3. **DocumentDisplay**: Shows document cards in chat history with actions
4. **DocumentProcessingIndicator**: Real-time processing status with timer and warnings
5. **DocumentSidePanel**: Detailed document view with metadata and actions
6. **Enhanced ToolCallStep**: Improved styling for document-related AI operations

### Document Processing Flow

1. **Upload**: User selects document → validation → base64 encoding
2. **Attachment**: Document preview appears in chat input area
3. **Submission**: Document data included in message to AI
4. **Processing**: Real-time indicator shows Gemini analyzing document
5. **Display**: Document appears in chat history with full functionality
6. **Interaction**: Users can view, download, or reference document anytime

### Gemini Integration

- Documents are passed as `filePart` objects to the AI SDK
- Proper MIME type mapping ensures correct interpretation
- Base64 encoding allows secure transmission of binary content
- File metadata helps Gemini understand document context

### Security Considerations

- File type validation ensures only supported formats are accepted
- File size limits prevent oversized uploads
- All document processing happens client-side before transmission

## Limitations

- **Gemini models only**: Other AI models (GPT, Claude, etc.) do not support document upload
- **Single document per message**: Only one document can be attached at a time
- **No document history**: Previous document attachments are not preserved in conversation history
- **Client-side processing**: Large documents may impact browser performance during encoding

## Future Enhancements

Potential improvements for future versions:

- Support for additional AI models that accept file inputs
- Multiple document attachments per message
- Document preview and analysis tools
- Server-side document processing for better performance
- Document conversation history and reference capabilities

## Troubleshooting

### Document Upload Button Not Visible

- Ensure a Gemini model is selected
- Check that you're using a supported chat mode
- Verify the model is correctly configured in `GEMINI_MODELS` constant

### Upload Fails

- Check file size (must be under 10MB)
- Verify file type is supported (PDF, DOC, DOCX, TXT, MD)
- Try refreshing the page and re-uploading

### Poor AI Response Quality

- Ensure the document is text-based and readable
- Try smaller documents for better processing
- Include specific questions about the document content in your message
