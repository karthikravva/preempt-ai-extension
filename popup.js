const API_URL = 'https://preempt-production.up.railway.app/v1/sanitize';
const HEALTH_URL = 'https://preempt-production.up.railway.app/health';

// DOM Elements
const protectionToggle = document.getElementById('protectionToggle');
const currentSiteEl = document.getElementById('currentSite');
const apiStatusEl = document.getElementById('apiStatus');
const inputText = document.getElementById('inputText');
const sanitizeBtn = document.getElementById('sanitizeBtn');
const resultArea = document.getElementById('resultArea');
const resultText = document.getElementById('resultText');
const piiBadges = document.getElementById('piiBadges');
const copyBtn = document.getElementById('copyBtn');
const errorMsg = document.getElementById('errorMsg');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load protection state
    const { protectionEnabled = true } = await chrome.storage.local.get('protectionEnabled');
    updateToggle(protectionEnabled);

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
        try {
            const url = new URL(tab.url);
            currentSiteEl.textContent = url.hostname;
            currentSiteEl.classList.add('active');
        } catch {
            currentSiteEl.textContent = 'N/A';
        }
    }

    // Check API health
    checkApiHealth();
});

// Toggle protection
protectionToggle.addEventListener('click', async () => {
    const { protectionEnabled = true } = await chrome.storage.local.get('protectionEnabled');
    const newState = !protectionEnabled;
    await chrome.storage.local.set({ protectionEnabled: newState });
    updateToggle(newState);

    // Notify content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PROTECTION', enabled: newState });
    }
});

function updateToggle(enabled) {
    if (enabled) {
        protectionToggle.classList.add('active');
    } else {
        protectionToggle.classList.remove('active');
    }
}

// Check API health
async function checkApiHealth() {
    try {
        const response = await fetch(HEALTH_URL);
        if (response.ok) {
            apiStatusEl.textContent = 'Connected';
            apiStatusEl.classList.remove('offline');
            apiStatusEl.classList.add('online');
        } else {
            throw new Error('API not healthy');
        }
    } catch {
        apiStatusEl.textContent = 'Offline';
        apiStatusEl.classList.remove('online');
        apiStatusEl.classList.add('offline');
    }
}

// Sanitize button
sanitizeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
        showError('Please enter a prompt to sanitize');
        return;
    }

    sanitizeBtn.disabled = true;
    sanitizeBtn.innerHTML = '<span>⏳</span><span>Scanning...</span>';
    hideError();
    resultArea.classList.remove('visible');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text })
        });

        if (!response.ok) {
            throw new Error('Failed to sanitize');
        }

        const data = await response.json();

        // Show result
        resultText.textContent = data.materialized_prompt;

        // Show PII badges
        const piiTypes = Array.isArray(data.pii_flags) ? data.pii_flags : [];
        let badgesHtml = piiTypes.length > 0
            ? piiTypes.map(type => `<span class="badge badge-pii">${type.toUpperCase()}</span>`).join('')
            : '<span class="badge badge-safe">No PII detected</span>';

        // Show security warnings
        if (data.security) {
            const attackCount = data.security.attack_count || 0;
            const overallRisk = data.security.overall_risk || 'none';
            const attacks = data.security.attacks || [];

            if (attackCount > 0) {
                // Show attack count and risk level
                badgesHtml += `<span class="badge badge-threat">⚠️ ${attackCount} Attack${attackCount !== 1 ? 's' : ''}</span>`;

                if (overallRisk !== 'none') {
                    const riskColors = { critical: '#be185d', high: '#9333ea', medium: '#0891b2', low: '#059669' };
                    const color = riskColors[overallRisk] || '#9333ea';
                    badgesHtml += `<span class="badge" style="background:${color}20;color:${color};border-color:${color}">Risk: ${overallRisk.toUpperCase()}</span>`;
                }

                // Show first few attack names
                attacks.slice(0, 3).forEach(attack => {
                    badgesHtml += `<span class="badge badge-threat" title="${attack.tier}">${attack.name}</span>`;
                });
            } else {
                // Fallback to legacy detection
                if (data.security.prompt_injection?.detected) {
                    badgesHtml += '<span class="badge badge-threat">⚠️ INJECTION</span>';
                }
                if (data.security.jailbreak?.detected) {
                    badgesHtml += '<span class="badge badge-threat">⚠️ JAILBREAK</span>';
                }
            }
        }

        piiBadges.innerHTML = badgesHtml;

        resultArea.classList.add('visible');

    } catch (err) {
        showError('Failed to sanitize. Please check your connection.');
    } finally {
        sanitizeBtn.disabled = false;
        sanitizeBtn.innerHTML = '<span>🔍</span><span>Scan & Protect</span>';
    }
});

// Copy button
copyBtn.addEventListener('click', async () => {
    const text = resultText.textContent;
    await navigator.clipboard.writeText(text);
    copyBtn.innerHTML = '<span>✓</span><span>Copied!</span>';
    copyBtn.classList.add('copied');
    setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span><span>Copy Protected Prompt</span>';
        copyBtn.classList.remove('copied');
    }, 2000);
});

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('visible');
}

function hideError() {
    errorMsg.classList.remove('visible');
}
