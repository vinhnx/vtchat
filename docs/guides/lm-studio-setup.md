# LM Studio Integration Guide

This guide shows you how to integrate LM Studio with VTChat for local AI model inference.

## Prerequisites

1. **Install LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai)
2. **Install LM Studio CLI**: The CLI should be included with LM Studio installation

## Setup Steps

### 1. Start LM Studio Server

```bash
# Start server on default port (1234)
lms server start --cors

# Or start on custom port
lms server start --port 3000 --cors
```

The `--cors` flag is required for web application integration.

### 2. Load a Model

1. Open LM Studio application
2. Go to the "My Models" tab
3. Load any compatible model (e.g., Llama 3 8B, Qwen 2.5 7B, Gemma 7B)

### 3. Configure Environment (Optional)

If using a custom port, set the environment variable:

```bash
# .env.local
LMSTUDIO_BASE_URL=http://localhost:3000
```

Default is `http://localhost:1234`.

### 4. Available Models

VTChat includes these LM Studio models by default:

- **Llama 3 8B (Local)** - General purpose chat model
- **Qwen 2.5 7B (Local)** - Multilingual model with extended context
- **Gemma 7B (Local)** - Google's instruction-tuned model

### 5. Test Integration

Run the test script to verify everything works:

```bash
node apps/web/app/tests/test-lm-studio-integration.js
```

## Usage in VTChat

1. Start LM Studio server
2. Load your desired model
3. Select one of the "LM Studio" models from the model selector in VTChat
4. Start chatting with your local model!

## Benefits

- **Privacy**: Models run entirely on your machine
- **No API costs**: Free to use once you have the models
- **Offline**: Works without internet connection
- **Custom models**: Use any GGUF model compatible with LM Studio

## Troubleshooting

### Server Connection Issues

```
❌ Error: connect ECONNREFUSED ::1:1234
```

**Solution**: Start LM Studio server with `lms server start --cors`

### Mixed Content Issues (HTTPS Sites)

If you're running VTChat on HTTPS (like `https://vtchat.io.vn`), browsers will block HTTP requests to `http://localhost:1234` due to mixed content security policies.

**Solutions**:
1. **Run VTChat locally**: Use `http://localhost:3000` for development
2. **HTTPS Proxy**: Set up a reverse proxy with SSL for LM Studio
3. **Tunnel Service**: Use tools like ngrok to create an HTTPS tunnel

```bash
# Example with ngrok
ngrok http 1234
# Then use the HTTPS URL: https://abc123.ngrok.io
```

### Model Not Found

```
❌ Error: Model not found
```

**Solution**: Load a model in LM Studio application first

### CORS Issues

```
❌ Error: CORS policy
```

**Solution**: Make sure to start the server with `--cors` flag

### Port Already in Use

```
❌ Error: Port 1234 already in use
```

**Solution**: 
- Stop other services using port 1234, or
- Use a different port: `lms server start --port 3000 --cors`
- Update `LMSTUDIO_BASE_URL` environment variable accordingly

## Advanced Configuration

### Custom Model Names

If you want to use models with different names than the defaults, you can modify the model identifiers in the LM Studio provider configuration.

### Performance Tuning

- **GPU Offloading**: Configure in LM Studio settings
- **Context Length**: Adjust based on your hardware
- **Batch Size**: Optimize for your system's memory

## Model Recommendations

### For Chat
- **Llama 3.1 8B Instruct** - Excellent general conversation
- **Qwen2.5 7B Instruct** - Good multilingual support
- **Mistral 7B Instruct** - Fast and efficient

### For Code
- **CodeLlama 7B** - Specialized for programming
- **Qwen2.5 Coder 7B** - Good code understanding
- **Deepseek Coder 6.7B** - Strong coding capabilities

## Support

For LM Studio specific issues, check:
- [LM Studio Documentation](https://lmstudio.ai/docs)
- [LM Studio GitHub](https://github.com/lmstudio-ai)
- [LM Studio Discord](https://discord.gg/lmstudio)
