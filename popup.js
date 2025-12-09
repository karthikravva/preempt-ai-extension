const API_URL = 'https://preempt-production.up.railway.app/v1/sanitize';
const HEALTH_URL = 'https://preempt-production.up.railway.app/health';

// DOM Elements
const protectionToggle = document.getElementById('protectionToggle');
const currentSiteEl = document.getElementById('currentSite');
const apiStatusEl = document.getElementById('apiStatus');
const apiDot = document.getElementById('apiDot');
const inputText = document.getElementById('inputText');
const sanitizeBtn = document.getElementById('sanitizeBtn');
const resultArea = document.getElementById('resultArea');
const resultHeader = document.getElementById('resultHeader');
const resultText = document.getElementById('resultText');
const badges = document.getElementById('badges');
const copyBtn = document.getElementById('copyBtn');
const errorMsg = document.getElementById('errorMsg');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const { protectionEnabled = true } = await chrome.storage.local.get('protectionEnabled');
    updateToggle(protectionEnabled);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
        try {
            const url = new URL(tab.url);
            currentSiteEl.textContent = url.hostname.replace('www.', '');
        } catch {
            currentSiteEl.textContent = '—';
        }
    }

    checkApiHealth();
});

// Toggle protection
protectionToggle.addEventListener('click', async () => {
    const { protectionEnabled = true } = await chrome.storage.local.get('protectionEnabled');
    const newState = !protectionEnabled;
    await chrome.storage.local.set({ protectionEnabled: newState });
    updateToggle(newState);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PROTECTION', enabled: newState });
    }
});

function updateToggle(enabled) {
    protectionToggle.classList.toggle('active', enabled);
}

// Check API health
async function checkApiHealth() {
    try {
        const response = await fetch(HEALTH_URL);
        if (response.ok) {
            apiStatusEl.textContent = 'API Online';
            apiDot.classList.add('green');
            apiDot.classList.remove('red');
        } else {
            throw new Error('API not healthy');
        }
    } catch {
        apiStatusEl.textContent = 'API Offline';
        apiDot.classList.add('red');
        apiDot.classList.remove('green');
    }
}

// Sanitize button
sanitizeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
        showError('Enter a prompt to scan');
        return;
    }

    sanitizeBtn.disabled = true;
    sanitizeBtn.textContent = '⏳ Scanning...';
    hideError();
    resultArea.classList.remove('visible', 'safe', 'threat', 'pii');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text })
        });

        if (!response.ok) throw new Error('Failed');

        const data = await response.json();
        const piiTypes = data.pii_flags || [];
        const attackCount = data.security?.attack_count || 0;
        const attacks = data.security?.attacks || [];
        const overallRisk = data.security?.overall_risk || 'none';

        // Determine result type
        let resultType = 'safe';
        let headerText = '✓ Safe to send';

        if (attackCount > 0) {
            resultType = 'threat';
            headerText = `⚠️ ${attackCount} Threat${attackCount > 1 ? 's' : ''} Detected`;
        } else if (piiTypes.length > 0) {
            resultType = 'pii';
            headerText = `🔒 ${piiTypes.length} PII Protected`;
        }

        resultArea.classList.add('visible', resultType);
        resultHeader.textContent = headerText;
        resultText.textContent = data.materialized_prompt || text;

        // Build badges
        let badgesHtml = '';
        if (attackCount > 0 && overallRisk !== 'none') {
            badgesHtml += `<span class="badge" style="background:rgba(249,115,22,0.2);color:#fb923c">${overallRisk.toUpperCase()}</span>`;
        }
        attacks.slice(0, 2).forEach(a => {
            badgesHtml += `<span class="badge">${a.name}</span>`;
        });
        piiTypes.slice(0, 3).forEach(p => {
            badgesHtml += `<span class="badge">${p}</span>`;
        });
        badges.innerHTML = badgesHtml;

    } catch (err) {
        showError('Connection failed. Try again.');
    } finally {
        sanitizeBtn.disabled = false;
        sanitizeBtn.textContent = '🛡️ Scan Prompt';
    }
});

// Copy button
copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(resultText.textContent);
    copyBtn.textContent = '✓ Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
        copyBtn.textContent = '📋 Copy Protected Prompt';
        copyBtn.classList.remove('copied');
    }, 1500);
});

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('visible');
}

function hideError() {
    errorMsg.classList.remove('visible');
}
