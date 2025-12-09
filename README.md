<div align="center">

# 🛡️ Preempt AI

### **Security for AI Applications**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/Version-1.0.0-10a37f?style=for-the-badge)](https://github.com/karthikravva/preempt-ai-extension)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Protect your AI interactions from prompt injection, jailbreaks, and data leaks.**

[🌐 Website](https://preempt-ai.vercel.app) • [📚 API Docs](https://preempt-production.up.railway.app/docs) • [🔒 Privacy Policy](https://preempt-ai.vercel.app/privacy)

---

<img src="https://raw.githubusercontent.com/karthikravva/preempt-ai-extension/main/screenshots/demo.gif" alt="Preempt AI Demo" width="600">

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🛡️ **Prompt Injection Detection** | Blocks attempts to manipulate AI behavior |
| 🚫 **Jailbreak Prevention** | Stops attempts to bypass AI safety measures |
| 🔒 **PII Protection** | Auto-detect and encrypt SSN, credit cards, emails |
| 🌐 **Universal Support** | Works on any website with text inputs |
| ⚡ **Real-time Scanning** | Instant security analysis of your prompts |

---

## 🎯 Supported Platforms

<table>
<tr>
<td align="center"><img src="https://img.shields.io/badge/ChatGPT-74aa9c?style=flat-square&logo=openai&logoColor=white" alt="ChatGPT"></td>
<td align="center"><img src="https://img.shields.io/badge/Claude-191919?style=flat-square&logo=anthropic&logoColor=white" alt="Claude"></td>
<td align="center"><img src="https://img.shields.io/badge/Gemini-8E75B2?style=flat-square&logo=google&logoColor=white" alt="Gemini"></td>
<td align="center"><img src="https://img.shields.io/badge/Copilot-0078D4?style=flat-square&logo=microsoft&logoColor=white" alt="Copilot"></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/Perplexity-20808D?style=flat-square" alt="Perplexity"></td>
<td align="center"><img src="https://img.shields.io/badge/Poe-5C46F5?style=flat-square" alt="Poe"></td>
<td align="center"><img src="https://img.shields.io/badge/HuggingChat-FFD21E?style=flat-square&logo=huggingface&logoColor=black" alt="HuggingChat"></td>
<td align="center"><img src="https://img.shields.io/badge/Any%20AI-gray?style=flat-square" alt="Any AI"></td>
</tr>
</table>

**Also works on:** Rich text editors, contenteditable elements, custom AI interfaces, and API playgrounds.

---

## 🚀 Installation

### Chrome Web Store (Recommended)
> 🔜 Coming Soon!

### Manual Installation

<details>
<summary><b>Chrome / Edge / Brave</b></summary>

1. Download or clone this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the extension folder
6. Pin the Preempt icon to your toolbar

</details>

<details>
<summary><b>Firefox</b></summary>

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file

</details>

---

## 📖 How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your Prompt   │ ──▶ │   Preempt AI    │ ──▶ │   Safe Prompt   │
│                 │     │   Security      │     │                 │
│ "My SSN is      │     │   Analysis      │     │ "My SSN is      │
│  123-45-6789"   │     │                 │     │  [PROTECTED]"   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Security Analysis

| Threat Type | Detection | Action |
|-------------|-----------|--------|
| 🛡️ Prompt Injection | AI manipulation attempts | Block/Warn |
| 🚫 Jailbreak | Safety bypass attempts | Block |
| 🔒 PII Data | SSN, credit cards, emails | Encrypt/Redact |

### Risk Levels

| Level | Color | Action |
|-------|-------|--------|
| ✅ None | Green | Allow |
| ⚠️ Low | Yellow | Warn |
| 🟠 Medium | Orange | Review |
| 🔴 High | Red | Block |
| ⛔ Critical | Dark Red | Block |

---

## 🖼️ Screenshots

<div align="center">
<table>
<tr>
<td align="center"><b>Threat Detection</b></td>
<td align="center"><b>PII Protection</b></td>
<td align="center"><b>Safe Prompt</b></td>
</tr>
<tr>
<td><img src="screenshots/threat.png" width="250"></td>
<td><img src="screenshots/pii.png" width="250"></td>
<td><img src="screenshots/safe.png" width="250"></td>
</tr>
</table>
</div>

---

## 🔐 Privacy & Security

- ✅ **No data storage** - Prompts are analyzed and discarded
- ✅ **No tracking** - We don't track your browsing
- ✅ **Secure API** - All communications are encrypted (HTTPS)
- ✅ **Open source** - Audit the code yourself

📄 [Read our full Privacy Policy](https://preempt-ai.vercel.app/privacy)

---

## 🛠️ API

The extension uses the Preempt API for security analysis:

```bash
curl -X POST https://preempt-production.up.railway.app/v1/sanitize \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your text here"}'
```

📚 [Full API Documentation](https://preempt-production.up.railway.app/docs)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for AI Security**

[⭐ Star this repo](https://github.com/karthikravva/preempt-ai-extension) if you find it useful!

</div>
