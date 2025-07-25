# Complete Local AI Setup Guide

**🚀 Run AI models on your computer for FREE with complete privacy!**

This guide helps you choose between **Ollama** (command-line) and **LM Studio** (GUI) to run local AI models with VTChat.

## Why Use Local AI?

✅ **100% Free** - No API costs, no subscriptions  
✅ **Complete Privacy** - Your data never leaves your computer  
✅ **Always Available** - Works offline, no internet required  
✅ **No Rate Limits** - Use as much as you want  
✅ **Custom Models** - Access to hundreds of specialized models

## Quick Comparison: Ollama vs LM Studio

| Feature               | 🔧 Ollama           | 🎨 LM Studio            |
| --------------------- | ------------------- | ----------------------- |
| **Interface**         | Command line        | Beautiful GUI           |
| **Setup Time**        | 2 minutes           | 5 minutes               |
| **Best For**          | Developers, servers | Everyone, beginners     |
| **Model Management**  | Terminal commands   | Visual download manager |
| **Resource Usage**    | Minimal             | GUI overhead            |
| **Advanced Features** | Full scripting      | Visual parameter tuning |

## Option 1: Ollama (Recommended for Developers)

**🚀 Super Fast Setup**:

```bash
# Install (one command)
curl -fsSL https://ollama.com/install.sh | sh

# Start service
ollama serve

# Get a model (new terminal)
ollama pull qwen3:1.7b

# Test it
ollama run qwen3:1.7b "Hello!"
```

**✅ Pros**: Fastest setup, minimal resources, great for automation  
**❌ Cons**: Command-line only, less user-friendly

➡️ **[Full Ollama Setup Guide](./ollama-setup.md)**

## Option 2: LM Studio (Recommended for Everyone Else)

**🎨 Visual Setup**:

1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Install and open the app
3. Search tab → Download "qwen3:1.7b"
4. Developer tab → Start Server
5. Done!

**✅ Pros**: Beautiful interface, easy model management, beginner-friendly  
**❌ Cons**: Larger download, GUI uses more resources

➡️ **[Full LM Studio Setup Guide](./lm-studio-setup.md)**

## Model Recommendations

### 🌟 Best Starter Models (Fast & Smart)

| Model           | Size  | RAM Needed | Best For                     |
| --------------- | ----- | ---------- | ---------------------------- |
| **qwen3:1.7b**  | 1GB   | 4GB+       | General chat, fast responses |
| **llama3.2:3b** | 2GB   | 6GB+       | Balanced quality/speed       |
| **gemma2:2b**   | 1.6GB | 4GB+       | Efficient, good reasoning    |

### 🧠 Specialized Models

| Model                | Size | Purpose                 |
| -------------------- | ---- | ----------------------- |
| **deepseek-r1:1.5b** | 1GB  | Coding, math, reasoning |
| **codellama:7b**     | 4GB  | Programming specialist  |
| **llava:7b**         | 4GB  | Chat with images        |

### 🚀 High-End Models (If You Have Powerful Hardware)

| Model            | Size | RAM Needed | Quality           |
| ---------------- | ---- | ---------- | ----------------- |
| **qwen3:14b**    | 8GB  | 16GB+      | Excellent quality |
| **llama3.3:70b** | 40GB | 64GB+      | Best available    |

## Hardware Requirements

### Minimum (Entry Level)

- **4GB RAM** - Can run 1-2B models (qwen3:1.7b, gemma2:2b)
- **10GB Storage** - For a few models
- **Any CPU** - Modern processor from last 5 years

### Recommended (Good Experience)

- **16GB RAM** - Can run 7B models smoothly
- **50GB Storage** - For multiple models
- **Dedicated GPU** - NVIDIA RTX series for faster inference

### Optimal (Best Experience)

- **32GB+ RAM** - Can run larger 14B+ models
- **100GB+ Storage** - Lots of model variety
- **High-end GPU** - RTX 4080/4090 or equivalent

## Getting Started Checklist

**For Beginners** (Choose LM Studio):

- [ ] Download LM Studio from [lmstudio.ai](https://lmstudio.ai)
- [ ] Install and open the app
- [ ] Download qwen3:1.7b model (Search tab)
- [ ] Start local server (Developer tab)
- [ ] Select "LM Studio (Beta)" in VTChat
- [ ] Start chatting!

**For Developers** (Choose Ollama):

- [ ] Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
- [ ] Start service: `ollama serve`
- [ ] Pull model: `ollama pull qwen3:1.7b`
- [ ] Test: `ollama run qwen3:1.7b "Hello!"`
- [ ] Select "Ollama (Beta)" in VTChat
- [ ] Start chatting!

## Using with VTChat

Once your local AI is running:

1. **Open VTChat** → Go to the chat interface
2. **Click Model Selector** → The dropdown at the top
3. **Find Local Models**:
    - **"Ollama (Beta)"** - If using Ollama
    - **"LM Studio (Beta)"** - If using LM Studio
4. **Choose Your Model** → Pick the model you downloaded
5. **Start Chatting** → Your conversations are completely private!

## Troubleshooting

### Connection Issues

**Problem**: "Unable to connect to local server"  
**Solution**: Make sure your service is running:

- **Ollama**: Run `ollama serve` in terminal
- **LM Studio**: Check Developer tab, click "Start Server"

### Out of Memory

**Problem**: Model crashes or runs very slowly  
**Solution**: Try a smaller model:

- Switch from 7B → 3B → 1.7B models
- Close other applications to free up RAM

### Model Not Found

**Problem**: "Model not available"  
**Solution**: Download the model first:

- **Ollama**: `ollama pull model-name`
- **LM Studio**: Use Search tab to download

## Advanced Tips

### Performance Optimization

```bash
# For Ollama - Use GPU acceleration
OLLAMA_GPU_LAYERS=32 ollama serve

# Monitor resource usage
htop  # Linux/macOS
taskmgr  # Windows
```

### Multiple Models

- You can have many models installed
- Only one loads into memory at a time
- Switch between models in VTChat anytime

### Production Deployment

- Use Docker for Ollama in production
- Set up reverse proxy for HTTPS
- Consider load balancing for multiple users

## Support & Community

### Ollama

- 📖 [Ollama Docs](https://ollama.com/docs)
- 💬 [Discord](https://discord.gg/ollama)
- 🐙 [GitHub](https://github.com/ollama/ollama)

### LM Studio

- 📖 [LM Studio Docs](https://lmstudio.ai/docs)
- 💬 [Discord](https://discord.gg/lmstudio)
- 🐙 [GitHub](https://github.com/lmstudio-ai)

## Next Steps

1. **Try Both Tools** - Install both and see which you prefer
2. **Experiment with Models** - Different models have different strengths
3. **Join Communities** - Get help and discover new models
4. **Share Your Experience** - Help others get started with local AI

---

**🎉 Welcome to the world of free, private, local AI!**

Your data stays on your computer, your conversations are completely private, and you never pay API fees again.
