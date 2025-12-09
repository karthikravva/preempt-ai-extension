# Preempt AI Browser Extension v1.0.0

**Security for AI Applications**

Preempt AI protects your AI interactions from prompt injection, jailbreaks, and data leaks.

## Features

### Security Protection
- **Prompt Injection Detection** - Blocks attempts to manipulate AI behavior
- **Jailbreak Prevention** - Stops attempts to bypass AI safety measures
- **PII Protection** - Auto-detect and encrypt sensitive data (SSN, credit cards, emails)
- **Universal Support** - Works on any website with text inputs
- **Real-time Scanning** - Instant security analysis of your prompts

## Supported AI Platforms

Works as a **universal prompt entry point** for ANY AI that accepts prompts:

### Major AI Assistants
- ✅ **ChatGPT** (chat.openai.com, chatgpt.com)
- ✅ **Claude** (claude.ai)
- ✅ **Google Gemini** (gemini.google.com)
- ✅ **Microsoft Copilot** (copilot.microsoft.com)
- ✅ **Perplexity** (perplexity.ai)
- ✅ **Poe** (poe.com)
- ✅ **HuggingChat** (huggingface.co/chat)

### Also Works On
- ✅ Any website with text inputs or textareas
- ✅ Rich text editors (ProseMirror, Quill, TipTap, CodeMirror)
- ✅ Contenteditable elements
- ✅ Custom AI chat interfaces
- ✅ API playgrounds and testing tools

## Installation

### Chrome / Edge / Brave

1. Open `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `browser-extension` folder
5. The Preempt icon will appear in your toolbar

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file from the `browser-extension` folder

## Usage

### Quick Sanitize (Popup)

1. Click the Preempt icon in your toolbar
2. Paste any text in the input box
3. Click **Sanitize Prompt**
4. Copy the protected version

### On AI Chat Sites

1. Go to ChatGPT, Claude, Gemini, or any AI site
2. Type your prompt in the chat input
3. The **🛡️ Preempt button replaces the send button**
4. Click the shield button to:
   - Automatically scan for security threats and PII
   - Sanitize any detected issues
   - Send the protected prompt to the AI
5. You'll see a toast notification showing what was detected/protected

## How It Works

1. **Security Analysis**: Preempt scans your prompt for:
   - 🛡️ **Prompt Injection** - Attempts to override AI instructions
   - 🛡️ **Jailbreak Attempts** - Bypassing AI safety measures
   - 🔒 **PII/Sensitive Data** - SSN, credit cards, emails, etc.

2. **Risk Assessment**:
   - Risk level: none, low, medium, high, critical
   - Recommended action: allow, warn, or block

3. **Protection Methods**: 
   - SSNs, credit cards → Format-Preserving Encryption (FPE)
   - Emails, phone numbers → Redacted
   - Security threats → Flagged with risk level

4. **Safe to Send**: Use the protected prompt with confidence

## Privacy

- All processing happens via the Preempt API
- No prompts are stored or logged
- Your original data never reaches the AI service

## API

The extension uses the Preempt API:
- **Endpoint**: `https://preempt-production.up.railway.app/v1/sanitize`
- **Docs**: https://preempt-production.up.railway.app/docs

## Support

- **Web App**: https://preempt-ai.vercel.app
- **API Docs**: https://preempt-production.up.railway.app/docs
- **Feedback**: Use the feedback form in the web app

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
