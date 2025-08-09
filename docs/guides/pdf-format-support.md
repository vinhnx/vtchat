# PDF Format Support Guide

VT supports PDF document analysis through Google's Gemini AI models. This guide explains supported formats, common issues, and troubleshooting steps.

## Supported PDF Formats

### ✅ Fully Supported
- **Text-based PDFs**: Documents with selectable text content
- **Mixed content PDFs**: Documents containing both text and images
- **Form PDFs**: Documents with fillable forms and text fields
- **Multi-page documents**: Up to 10MB file size limit

### ⚠️ Limited Support
- **Image-only PDFs**: Scanned documents without OCR text layer
- **Complex layouts**: Documents with intricate formatting may have reduced accuracy
- **Password-protected PDFs**: Must be unlocked before upload

### ❌ Not Supported
- **Corrupted PDFs**: Files with structural damage
- **Empty PDFs**: Documents with no readable content
- **Extremely large files**: Over 10MB size limit
- **DRM-protected PDFs**: Documents with digital rights management

## File Requirements

### Size Limits
- **Maximum file size**: 10MB
- **Recommended size**: Under 5MB for optimal processing speed
- **Page count**: No specific limit, but larger documents take longer to process

### Format Specifications
- **File extension**: Must be `.pdf`
- **MIME type**: `application/pdf`
- **PDF version**: All standard PDF versions supported (1.0 - 2.0)

## Common Issues and Solutions

### "Document has no pages" Error
**Cause**: PDF file is corrupted or empty
**Solutions**:
- Try opening the PDF in a PDF viewer to verify it's readable
- Re-export or re-save the PDF from the original source
- Use a different PDF file

### "Unable to process input image" Error
**Cause**: PDF format is not compatible with Gemini's processing
**Solutions**:
- Convert the PDF to individual images (PNG/JPG) and upload those instead
- Try using a text-based PDF instead of a scanned document
- Use OCR software to create a text-searchable PDF

### "Request payload size exceeds limit" Error
**Cause**: PDF file is too large
**Solutions**:
- Compress the PDF using online tools or PDF software
- Split large documents into smaller sections
- Reduce image quality/resolution in the PDF

### Upload Fails or Times Out
**Cause**: Network issues or temporary service problems
**Solutions**:
- Check your internet connection
- Try uploading again after a few minutes
- Verify your API key is valid (if using BYOK)

## Best Practices

### For Optimal Results
1. **Use text-based PDFs** when possible for better accuracy
2. **Keep files under 5MB** for faster processing
3. **Ensure good text quality** - avoid low-resolution scans
4. **Test with simple documents first** before uploading complex files

### Document Preparation
1. **Remove passwords** before uploading
2. **Flatten forms** if they contain filled data you want analyzed
3. **Optimize file size** without losing important content
4. **Use descriptive filenames** for better organization

## Troubleshooting Steps

### If PDF Upload Fails
1. **Verify file format**: Ensure the file has a `.pdf` extension
2. **Check file size**: Must be under 10MB
3. **Test file integrity**: Open the PDF in a PDF viewer
4. **Try a different PDF**: Test with a known-good document
5. **Clear browser cache**: Refresh the page and try again

### If Analysis is Inaccurate
1. **Check PDF quality**: Ensure text is selectable and clear
2. **Simplify the request**: Ask specific questions about the document
3. **Break down complex documents**: Upload sections separately
4. **Provide context**: Explain what type of document it is

## Error Messages Reference

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Document has no pages" | PDF is empty or corrupted | Use a different PDF file |
| "Unable to process input image" | Unsupported PDF format | Convert to image or use text-based PDF |
| "Request payload size exceeds limit" | File too large | Compress or split the PDF |
| "Invalid file type" | Not a PDF file | Ensure file has .pdf extension |
| "API key error" | Authentication issue | Check API key in settings |
| "Rate limit exceeded" | Too many requests | Wait and try again |

## Alternative Approaches

### If PDF Processing Fails
1. **Convert to images**: Export PDF pages as PNG/JPG files
2. **Extract text manually**: Copy and paste text content into chat
3. **Use document conversion tools**: Convert PDF to Word/TXT format
4. **Split large documents**: Upload sections separately

### For Scanned Documents
1. **Use OCR software**: Convert to searchable PDF first
2. **Upload as images**: Process individual pages as image files
3. **Manual transcription**: Type key content into chat messages

## Getting Help

If you continue to experience issues with PDF processing:

1. **Check the error message** against this guide
2. **Try the suggested solutions** for your specific error
3. **Test with a simple PDF** to isolate the issue
4. **Contact support** with details about the error and file type

## Technical Details

### Processing Pipeline
1. **File validation**: Size, type, and format checks
2. **Content extraction**: Text and image analysis
3. **AI processing**: Gemini model analysis
4. **Response generation**: Structured output with insights

### Privacy and Security
- **Local processing**: Files are processed securely
- **No permanent storage**: Documents are not saved on servers
- **Encrypted transmission**: All uploads use HTTPS
- **User isolation**: Your documents are only accessible to you

---

For more information about document features, see the [Document Upload Feature Guide](../document-upload-feature.md).
