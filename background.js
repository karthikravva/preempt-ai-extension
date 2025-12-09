// Preempt AI Background Service Worker v1.0.0
// Handles extension lifecycle and API communication

const API_URL = 'https://preempt-production.up.railway.app';

// Initialize default settings on install
chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        protectionEnabled: true,
        stats: {
            promptsScanned: 0,
            threatsBlocked: 0,
            piiProtected: 0
        }
    });

    if (details.reason === 'install') {
        console.log('[Preempt AI] v1.0.0 installed - automatic protection enabled');
    } else if (details.reason === 'update') {
        console.log('[Preempt AI] Updated to v1.0.0');
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SANITIZE_PROMPT') {
        sanitizePrompt(message.prompt)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    if (message.type === 'UPDATE_STATS') {
        updateStats(message.stats);
    }
});

async function sanitizePrompt(prompt) {
    const response = await fetch(`${API_URL}/v1/sanitize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        throw new Error('Failed to sanitize prompt');
    }

    return response.json();
}

async function updateStats(newStats) {
    const { stats = {} } = await chrome.storage.local.get('stats');
    await chrome.storage.local.set({
        stats: {
            promptsScanned: (stats.promptsScanned || 0) + (newStats.scanned || 0),
            piiDetected: (stats.piiDetected || 0) + (newStats.detected || 0)
        }
    });
}
