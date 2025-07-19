# Ollama Integration Guide

This guide shows you how to integrate Ollama with VTChat for **free, private, local AI** that runs entirely on your machine with zero API costs.

## Quick Start (5 minutes)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Start the service
ollama serve

# 3. Pull a model (in a new terminal)
ollama pull qwen3:1.7b

# 4. Test it works
ollama run qwen3:1.7b "Hello!"
```

That's it! Now you can use Ollama models in VTChat completely free and private.

## Installation Options

### macOS

```bash
# Option 1: Direct download
open https://ollama.com/download/mac

# Option 2: Homebrew
brew install ollama
```

### Windows

```bash
# Download and run installer
https://ollama.com/download/windows
```

### Linux

```bash
# Install script (Ubuntu, Debian, Fedora, etc.)
curl -fsSL https://ollama.com/install.sh | sh

# Or manual installation
sudo apt update && sudo apt install ollama  # Ubuntu/Debian
sudo dnf install ollama                      # Fedora
```

### Docker (Production)

```bash
# Pull and run Ollama in Docker
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull a model
docker exec -it ollama ollama pull qwen3:1.7b
```

## Setup Steps

### 1. Start Ollama Service

```bash
# Start Ollama service (runs on port 11434 by default)
ollama serve
```

The service will start automatically and provide an OpenAI-compatible API at `http://localhost:11434/v1`.

### 2. Pull Models

**🚀 Recommended Models (Start Here)**:

```bash
# Best all-around models for most users
ollama pull qwen3:1.7b        # ⭐ Fast, smart, only 1GB - BEST starter model
ollama pull llama3.2:3b       # ⭐ Good balance of speed/quality - 2GB
ollama pull gemma2:2b         # ⭐ Google's efficient model - 1.6GB

# If you have 16GB+ RAM, try these larger models:
ollama pull qwen3:14b         # Higher quality conversations - 8GB
ollama pull llama3.3:70b      # Best quality but needs 40GB+ RAM
```

**🎯 Specialized Models**:

```bash
# For coding
ollama pull deepseek-r1:1.5b  # ⭐ NEW: Reasoning model for code/math - 1GB
ollama pull codellama:7b      # Code generation specialist - 4GB

# For vision/images
ollama pull llava:7b          # Chat with images - 4GB

# Multilingual
ollama pull qwen2.5:7b        # Excellent for non-English - 4GB
```

**💾 Model Size Guide**:

- **1-3B models**: 1-2GB RAM, fast on any modern laptop
- **7B models**: 4-8GB RAM, good quality, reasonable speed
- **14B models**: 8-16GB RAM, high quality
- **70B models**: 40GB+ RAM, best quality, slow

### 3. Configure Environment (Optional)

If using a custom port or remote Ollama instance:

```bash
# .env.local
OLLAMA_BASE_URL=http://localhost:11434

# For development with remote Ollama instance
ALLOW_REMOTE_OLLAMA=true

# For production, remote URLs are automatically allowed
NODE_ENV=production
```

Default is `http://127.0.0.1:11434`. Remote URLs are automatically allowed in production environments.

### 4. Using in VTChat

Once you have models installed, you can use them in VTChat:

1. **Go to VTChat** → Open the model selector dropdown
2. **Find "Ollama (Beta)"** → Choose your model
3. **Start chatting!** → Your conversations are 100% private and free

**Available Models in VTChat**:

- 🌟 **Qwen 3 (Ollama)** - Our newest, smartest model
- 🚀 **Llama 3.3 70B (Ollama)** - Best quality (needs powerful hardware)
- ⚡ **Llama 3.2 (Ollama)** - Fast and efficient
- 🧠 **DeepSeek R1 (Ollama)** - Reasoning specialist for math/code
- 🌍 **Gemma 3 (Ollama)** - Google's latest efficient model
- 💻 **CodeLlama (Ollama)** - Programming specialist
- 👁️ **LLaVA (Ollama)** - Chat with images

### 5. Test Integration

Run the test script to verify everything works:

```bash
bun apps/web/app/tests/test-ollama-integration.js
```

The integration uses Ollama's built-in OpenAI compatibility mode at `/v1/chat/completions`.

## Usage in VTChat

1. Start Ollama service
2. Pull your desired models
3. Select one of the "Ollama" models from the model selector in VTChat
4. Start chatting with your local model!

## Benefits

- **Privacy**: Models run entirely on your machine
- **No API costs**: Free to use once you have the models
- **Offline**: Works without internet connection
- **Model variety**: Access to hundreds of models via Ollama library
- **Easy management**: Simple model pulling and management with Ollama CLI

## Ollama CLI Commands

### Model Management

```bash
# List downloaded models
ollama list

# Pull a specific model
ollama pull model_name

# Remove a model
ollama rm model_name

# Show model information
ollama show model_name
```

### Interactive Chat

```bash
# Chat with a model directly in terminal
ollama run llama3.2

# Chat with a specific model variant
ollama run llama3.2:7b
```

### Server Management

```bash
# Start server (if not running as service)
ollama serve

# Check server status
curl http://127.0.0.1:11434/api/tags
```

## Troubleshooting

### Service Connection Issues

```
❌ Error: connect ECONNREFUSED ::1:11434
```

**Solution**: Start Ollama service with `ollama serve`

### Model Not Found

```
❌ Error: model not found
```

**Solution**: Pull the model first with `ollama pull model_name`

### Port Already in Use

```
❌ Error: Port 11434 already in use
```

**Solution**:

- Check if Ollama is already running: `ps aux | grep ollama`
- Kill existing processes or restart your system
- Use a different port: `OLLAMA_HOST=localhost:11435 ollama serve`

### Mixed Content Issues (HTTPS Sites)

If you're running VTChat on HTTPS, browsers may block HTTP requests to `http://localhost:11434`.

**Solutions**:

1. **Run VTChat locally**: Use `http://localhost:3000` for development
2. **Production Environment**: Deploy with `NODE_ENV=production` to allow remote URLs
3. **Reverse Proxy**: Set up nginx or similar with SSL for Ollama
4. **Tunnel Service**: Use tools like ngrok to create an HTTPS tunnel

### Model Performance Issues

**Optimization Tips**:

- Use smaller models for faster inference (e.g., `llama3.2:1b` instead of `llama3.2:70b`)
- Ensure sufficient RAM (8GB+ recommended for 7B models, 32GB+ for 70B models)
- Use GPU acceleration if available (NVIDIA GPU recommended)
- Consider quantized models for lower memory usage

## Model Recommendations

### For General Chat

- **Llama 3.3:70b** - Best quality but requires more resources
- **Llama 3.2:8b** - Good balance of quality and speed
- **Qwen2.5:7b** - Excellent multilingual support
- **Gemma2:9b** - Efficient and fast

### For Code

- **CodeLlama:13b** - Best for code generation and analysis
- **Qwen2.5-Coder:7b** - Good code understanding
- **Llama 3.2:3b** - Fast coding assistance

### For Vision Tasks

- **LLaVA:13b** - Best multimodal understanding
- **LLaVA:7b** - Faster vision-language tasks

### For Resource-Constrained Systems

- **Llama 3.2:1b** - Ultra-lightweight but capable
- **Gemma2:2b** - Small but efficient
- **Qwen2.5:3b** - Good quality in small size

## Advanced Configuration

### Custom Model Parameters

You can create custom model configurations with Ollama:

```bash
# Create a custom model with specific parameters
echo 'FROM llama3.2
PARAMETER temperature 0.8
PARAMETER top_p 0.9
SYSTEM You are a helpful coding assistant.' > Modelfile

ollama create custom-coder -f Modelfile
```

### Performance Tuning

```bash
# Set GPU layers (for NVIDIA GPUs)
OLLAMA_GPU_LAYERS=32 ollama serve

# Set memory allocation
OLLAMA_MAX_LOADED_MODELS=2 ollama serve

# Set concurrent requests
OLLAMA_NUM_PARALLEL=4 ollama serve
```

## Support

For Ollama-specific issues, check:

- [Ollama Documentation](https://ollama.com/docs)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Ollama Discord](https://discord.gg/ollama)
- [Model Library](https://ollama.com/library)
