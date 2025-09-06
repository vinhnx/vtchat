# LM Studio Integration Guide

This guide shows you how to integrate LM Studio with VTChat for **free, private, local AI** with a beautiful GUI interface for managing your models.

## Quick Start (10 minutes)

1. **Download LM Studio** → [lmstudio.ai](https://lmstudio.ai) (Free)
2. **Install & Open** → The app will guide you through setup
3. **Download a Model** → Search tab → Search "qwen3" → Download "qwen3:1.7b"
4. **Start Local Server** → Developer tab → Start Server
5. **Use in VTChat** → Select "LM Studio (Beta)" models

**Why LM Studio?**

- 🎨 **Beautiful GUI** - Easy model management with visual interface
- 🖱️ **One-Click Setup** - No command line needed
- 💾 **Smart Downloads** - Handles model downloading and storage
- ⚡ **Optimized** - Automatically uses your GPU for faster inference
- 🔧 **Advanced Controls** - Fine-tune model parameters easily

## Installation

### All Platforms (Windows, macOS, Linux)

1. Go to [lmstudio.ai](https://lmstudio.ai)
2. Click "Download" and select your platform
3. Install and open LM Studio
4. The app will automatically detect your hardware and optimize settings

## Setup Steps

### 1. Download & Load Models (First Time)

**📱 Using the LM Studio App (Recommended)**:

1. **Open LM Studio** → Click the "Search" tab
2. **Find Models** → Search for popular models:
   - `qwen3` → Download "qwen3:1.7b" (1GB, fast)
   - `llama3.2` → Download "llama3.2:3b" (2GB, good quality)
   - `gemma-2` → Download "gemma-2:2b" (1.6GB, efficient)
3. **Load Model** → Go to "Chat" tab → Select your downloaded model
4. **Test Chat** → Try asking "Hello!" to make sure it works

**🔧 Model Recommendations by Hardware**:

- **8GB RAM or less**: qwen3:1.7b, gemma-2:2b
- **16GB RAM**: llama3.2:3b, qwen2.5:7b
- **32GB+ RAM**: llama3.3:70b, codellama:13b

### 2. Start Local Server

**📡 Using LM Studio GUI (Easy)**:

1. Go to **"Developer"** tab in LM Studio
2. Click **"Start Server"**
3. Make sure **"Cross-Origin-Resource-Sharing (CORS)"** is ✅ enabled
4. Note the server URL (usually `http://127.0.0.1:1234`)

**⌨️ Using Command Line (Alternative)**:

```bash
# Start server on default port (1234)
lms server start --cors

# Or start on custom port
lms server start --port 3000 --cors
```

### 3. Configure Environment (Optional)

If using a custom port or remote instance:

```bash
# .env.local
LMSTUDIO_BASE_URL=http://localhost:3000

# For development with remote LM Studio instance
ALLOW_REMOTE_LMSTUDIO=true

# For production, remote URLs are automatically allowed
NODE_ENV=production
```

Default is `http://127.0.0.1:1234`. Remote URLs are automatically allowed in production environments.

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

The integration uses the `@ai-sdk/openai-compatible` provider which follows the OpenAI API standard for maximum compatibility.

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
2. **Production Environment**: Deploy with `NODE_ENV=production` to allow remote URLs
3. **HTTPS Proxy**: Set up a reverse proxy with SSL for LM Studio
4. **Tunnel Service**: Use tools like ngrok to create an HTTPS tunnel

```bash
# Example with ngrok
ngrok http 1234
# Then use the HTTPS URL: https://abc123.ngrok.io
# Set: LMSTUDIO_BASE_URL=https://abc123.ngrok.io
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
