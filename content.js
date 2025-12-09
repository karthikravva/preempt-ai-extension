// Preempt AI Security Extension v1.0.0
// Robust, fail-safe prompt security for AI chat platforms
// Multi-layer security threat detection

(function () {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const API_URL = 'https://preempt-production.up.railway.app/v1/sanitize';
    const API_TIMEOUT = 5000; // 5 second timeout
    const VERSION = '1.0.0';

    let isProcessing = false;
    let pendingSend = null;
    let lastApiResponse = null; // Store full API response

    // Local threat detection patterns (fallback when API unavailable)
    const THREATS = [
        // Tier 1: Prompt Injection (Direct)
        [/ignore\s+(all\s+)?(the\s+)?(previous|prior|above|my|your)?\s*(instructions?|prompts?|rules?)/i, 'Context Ignoring', 'prompt_injection_direct'],
        [/ignore\s+all/i, 'Instruction Override', 'prompt_injection_direct'],
        [/ignore\s+everything/i, 'Instruction Override', 'prompt_injection_direct'],
        [/disregard\s+(all|the|previous|prior)/i, 'Instruction Override', 'prompt_injection_direct'],
        [/forget\s+(all|everything|previous|prior)/i, 'Instruction Override', 'prompt_injection_direct'],
        [/override\s+(system|all|the|previous)/i, 'Instruction Override', 'prompt_injection_direct'],
        [/show\s+(me\s+)?(your\s+)?system\s*prompt/i, 'System Prompt Extraction', 'prompt_injection_direct'],
        [/reveal\s+(your\s+)?system/i, 'System Prompt Extraction', 'prompt_injection_direct'],
        [/display\s+(your\s+)?system/i, 'System Prompt Extraction', 'prompt_injection_direct'],
        [/what\s+(is|are)\s+(your\s+)?system/i, 'System Prompt Extraction', 'prompt_injection_direct'],
        [/print\s+(your\s+)?system/i, 'System Prompt Extraction', 'prompt_injection_direct'],
        [/tell\s+me\s+(your\s+)?system/i, 'System Prompt Extraction', 'prompt_injection_direct'],
        [/you\s+are\s+now\s+(a|an|the)/i, 'Role Manipulation', 'prompt_injection_direct'],
        [/pretend\s+(you\s+are|to\s+be|you're)/i, 'Role Manipulation', 'prompt_injection_direct'],
        [/act\s+as\s+(if|a|an)/i, 'Role Manipulation', 'prompt_injection_direct'],
        [/roleplay\s+as/i, 'Role Manipulation', 'prompt_injection_direct'],
        [/from\s+now\s+on/i, 'Goal Hijacking', 'prompt_injection_direct'],
        [/\[system\]/i, 'Delimiter Injection', 'prompt_injection_direct'],
        [/\[INST\]/i, 'Delimiter Injection', 'prompt_injection_direct'],
        [/<system>/i, 'Delimiter Injection', 'prompt_injection_direct'],
        [/<<SYS>>/i, 'Delimiter Injection', 'prompt_injection_direct'],
        // Tier 3: Jailbreak
        [/jailbreak/i, 'DAN (Do Anything Now)', 'jailbreak'],
        [/dan\s*mode/i, 'DAN (Do Anything Now)', 'jailbreak'],
        [/do\s+anything\s+now/i, 'DAN (Do Anything Now)', 'jailbreak'],
        [/developer\s+mode/i, 'Constraint Removal', 'jailbreak'],
        [/god\s*mode/i, 'Constraint Removal', 'jailbreak'],
        [/sudo\s+mode/i, 'Constraint Removal', 'jailbreak'],
        [/no\s+(restrictions|limits|rules)/i, 'Constraint Removal', 'jailbreak'],
        [/uncensored/i, 'Refusal Suppression', 'jailbreak'],
        [/unfiltered/i, 'Refusal Suppression', 'jailbreak'],
        [/unrestricted/i, 'Constraint Removal', 'jailbreak'],
        [/bypass\s+(the\s+)?(safety|filter|guard)/i, 'Refusal Suppression', 'jailbreak'],
        [/disable\s+(the\s+)?(safety|filter|guard)/i, 'Refusal Suppression', 'jailbreak'],
        [/hypothetically/i, 'Hypothetical Framing', 'jailbreak'],
        [/for\s+(educational|research)\s+purposes/i, 'Hypothetical Framing', 'jailbreak'],
        [/imagine\s+you\s+(are|were|can)/i, 'Hypothetical Framing', 'jailbreak'],
        [/in\s+a\s+fictional/i, 'Hypothetical Framing', 'jailbreak'],
        // Tier 5: Data Extraction
        [/what\s+(did|do)\s+you\s+learn/i, 'Training Data Extraction', 'data_extraction'],
        [/repeat\s+(your|the)\s+training/i, 'Training Data Extraction', 'data_extraction'],
        [/show\s+me\s+your\s+config/i, 'Configuration Extraction', 'data_extraction']
    ];

    console.log('[Preempt AI] v' + VERSION + ' - Initializing...');

    // ============================================================
    // INJECT STYLES IMMEDIATELY
    // ============================================================
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .preempt-modal-bg {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85); z-index: 2147483647;
            display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            backdrop-filter: blur(4px);
        }
        .preempt-modal {
            background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px; width: 460px;
            max-width: 90vw; max-height: 80vh; overflow: hidden;
            box-shadow: 0 25px 80px rgba(0,0,0,0.6);
        }
        .preempt-hdr {
            padding: 20px 24px; display: flex; align-items: center;
            justify-content: space-between; color: white; font-weight: 700; font-size: 17px;
        }
        .preempt-hdr.green { background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.1)); border-bottom: 1px solid rgba(34,197,94,0.3); }
        .preempt-hdr.red { background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.1)); border-bottom: 1px solid rgba(249,115,22,0.3); }
        .preempt-hdr.orange { background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1)); border-bottom: 1px solid rgba(251,191,36,0.3); }
        .preempt-hdr-title { display: flex; align-items: center; gap: 10px; }
        .preempt-hdr-close {
            background: rgba(255,255,255,0.1); border: none; color: #888;
            width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-size: 18px;
            transition: all 0.2s;
        }
        .preempt-hdr-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .preempt-body { padding: 20px 24px; color: #d0d0d0; max-height: 350px; overflow-y: auto; }
        .preempt-section { margin-bottom: 18px; }
        .preempt-lbl { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
        .preempt-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; font-size: 14px; line-height: 1.6; max-height: 90px; overflow-y: auto; color: #aaa; word-break: break-word; }
        .preempt-threats { display: flex; flex-direction: column; gap: 10px; }
        .preempt-threat { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); border-radius: 12px; color: #fb923c; font-weight: 500; font-size: 14px; }
        .preempt-pii { display: flex; flex-wrap: wrap; gap: 8px; }
        .preempt-pii span { padding: 8px 14px; background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.25); border-radius: 8px; font-size: 12px; font-weight: 700; color: #fbbf24; }
        .preempt-safe { display: flex; align-items: center; gap: 14px; padding: 18px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 12px; color: #4ade80; font-weight: 500; font-size: 15px; }
        .preempt-ftr { padding: 18px 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 12px; justify-content: flex-end; background: rgba(0,0,0,0.3); }
        .preempt-btn { padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; outline: none; }
        .preempt-btn:focus { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }
        .preempt-btn-gray { background: rgba(255,255,255,0.08); color: #aaa; }
        .preempt-btn-gray:hover { background: rgba(255,255,255,0.12); color: #ddd; }
        .preempt-btn-green { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
        .preempt-btn-green:hover, .preempt-btn-green:focus { box-shadow: 0 6px 16px rgba(34,197,94,0.4); transform: translateY(-1px); }
        .preempt-btn-red { background: linear-gradient(135deg, #f97316, #ea580c); color: white; box-shadow: 0 4px 12px rgba(249,115,22,0.3); }
        .preempt-btn-red:hover, .preempt-btn-red:focus { box-shadow: 0 6px 16px rgba(249,115,22,0.4); transform: translateY(-1px); }
        .preempt-btn-orange { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1a1a; box-shadow: 0 4px 12px rgba(251,191,36,0.3); }
        .preempt-btn-orange:hover, .preempt-btn-orange:focus { box-shadow: 0 6px 16px rgba(251,191,36,0.4); transform: translateY(-1px); }
        .preempt-loading { padding: 50px; text-align: center; color: #666; }
        .preempt-spinner { width: 44px; height: 44px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: preempt-spin 0.8s linear infinite; margin: 0 auto 18px; }
        @keyframes preempt-spin { to { transform: rotate(360deg); } }
        .preempt-toast { position: fixed; bottom: 24px; right: 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 22px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 2147483647; box-shadow: 0 8px 24px rgba(99,102,241,0.4); font-family: -apple-system, sans-serif; display: flex; align-items: center; gap: 8px; }
    `;
    (document.head || document.documentElement).appendChild(styleEl);

    // ============================================================
    // CORE FUNCTIONS
    // ============================================================

    function detectThreats(text) {
        const found = [];
        const foundNames = new Set();
        for (const [regex, name, tier] of THREATS) {
            if (regex.test(text) && !foundNames.has(name)) {
                foundNames.add(name);
                found.push({ name: name, tier: tier || 'unknown' });
            }
        }
        return found;
    }

    // Get simple threat names for backwards compatibility
    function getThreatNames(threats) {
        return threats.map(t => typeof t === 'string' ? t : t.name);
    }

    function getPromptText() {
        // Try multiple selectors
        const selectors = [
            '#prompt-textarea',
            'div.ProseMirror[contenteditable="true"]',
            'div[contenteditable="true"].ProseMirror',
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="Send"]',
            'div[contenteditable="true"][data-placeholder]',
            'textarea',
            'div[contenteditable="true"]'
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const text = el.value || el.innerText || el.textContent || '';
                if (text.trim()) return { element: el, text: text.trim() };
            }
        }
        return null;
    }

    function setPromptText(el, text) {
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            el.value = text;
        } else {
            el.innerText = text;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function performSend() {
        // Try clicking send button
        const sendBtn = document.querySelector('button[data-testid="send-button"]') ||
            document.querySelector('button[aria-label*="Send" i]') ||
            document.querySelector('button[aria-label*="send" i]');

        if (sendBtn) {
            sendBtn.click();
            return;
        }

        // Fallback: dispatch Enter on input
        const input = getPromptText();
        if (input?.element) {
            input.element.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true
            }));
        }
    }

    // ============================================================
    // MODAL UI
    // ============================================================

    function showModal(content) {
        closeModal();
        const bg = document.createElement('div');
        bg.className = 'preempt-modal-bg';
        bg.id = 'preempt-modal-bg';
        bg.innerHTML = `<div class="preempt-modal">${content}</div>`;
        document.body.appendChild(bg);

        // Close on background click
        bg.addEventListener('click', (e) => {
            if (e.target === bg) closeModal();
        });

        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
        };
        document.addEventListener('keydown', escHandler);
    }

    function closeModal() {
        const m = document.getElementById('preempt-modal-bg');
        if (m) m.remove();
        isProcessing = false;
    }

    function showLoading() {
        showModal(`
            <div class="preempt-hdr green"><svg style="width:20px;height:20px;vertical-align:middle;margin-right:8px" viewBox="0 0 64 64"><path d="M32 4 L56 14 L56 30 C56 46 32 58 32 58 C32 58 8 46 8 30 L8 14 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M22 32 L28 38 L42 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>Preempt AI Security Scan</div>
            <div class="preempt-loading">
                <div class="preempt-spinner"></div>
                <div>Scanning for threats...</div>
            </div>
        `);
    }

    function showResults(prompt, threats, pii, sanitized, apiData) {
        // Note: This function is only called for unsafe prompts (threats or PII detected)
        // Safe prompts are auto-sent with a toast notification

        // threats is now an array of {name, tier} objects or strings
        const threatList = threats.map(t => typeof t === 'string' ? { name: t, tier: 'unknown' } : t);
        const isDanger = threatList.length > 0;

        // Get risk level from API response if available
        const riskLevel = apiData?.security?.overall_risk || (isDanger ? 'high' : 'none');
        const attackCount = apiData?.security?.attack_count || threatList.length;

        // Header styling: red for threats, orange for PII only
        const hdrClass = isDanger ? 'red' : 'orange';
        const hdrIcon = isDanger ? '🔒' : '⚠️';
        const hdrText = isDanger ? 'Security Analysis' : 'PII Detected';

        let body = `<div class="preempt-section"><div class="preempt-lbl">Your Prompt</div><div class="preempt-box">${escapeHtml(prompt)}</div></div>`;

        if (isDanger) {
            // Show risk level badge
            const riskColor = riskLevel === 'critical' ? '#be185d' : riskLevel === 'high' ? '#9333ea' : riskLevel === 'medium' ? '#0891b2' : '#059669';
            body += `<div class="preempt-section">`;
            body += `<div class="preempt-lbl">🔒 Security Issues (${attackCount} found) - Risk: <span style="color:${riskColor};font-weight:700">${riskLevel.toUpperCase()}</span></div>`;
            body += `<div class="preempt-threats">`;

            // Use API attacks if available, otherwise use local detection
            const attacksToShow = (apiData?.security?.attacks && apiData.security.attacks.length > 0)
                ? apiData.security.attacks.slice(0, 5)
                : threatList.slice(0, 5);

            attacksToShow.forEach(attack => {
                const name = attack.name || attack;
                const tier = attack.tier ? attack.tier.replace(/_/g, ' ') : '';
                const severity = attack.severity ? ` (Severity: ${attack.severity}/10)` : '';
                body += `<div class="preempt-threat">⚠️ <strong>${escapeHtml(name)}</strong>${tier ? ` <span style="opacity:0.7;font-size:12px">${tier}${severity}</span>` : ''}</div>`;
            });

            if (attacksToShow.length < attackCount) {
                body += `<div style="color:#888;font-size:12px;padding:8px;">...and ${attackCount - attacksToShow.length} more</div>`;
            }
            body += `</div></div>`;
        }

        if (pii.length > 0) {
            body += `<div class="preempt-section"><div class="preempt-lbl">🔒 Personal Information</div><div class="preempt-pii">${pii.map(p => `<span>${escapeHtml(p.toUpperCase())}</span>`).join('')}</div></div>`;
        }

        // Note: Safe prompts are auto-sent with toast, so this modal only shows for threats/PII
        let footer = '';
        if (isDanger) {
            // Security threats detected - show Block button (Enter = Block)
            footer = `<button class="preempt-btn preempt-btn-gray" onclick="document.getElementById('preempt-modal-bg').remove()">Edit</button>
                      <button class="preempt-btn preempt-btn-red" id="preempt-block-btn">✕ Block (Enter)</button>`;
        } else {
            // Only PII detected - show Protect & Send button (Enter = Protect & Send)
            footer = `<button class="preempt-btn preempt-btn-gray" onclick="document.getElementById('preempt-modal-bg').remove()">Cancel</button>
                      <button class="preempt-btn preempt-btn-orange" id="preempt-sanitize-btn">🔒 Protect & Send (Enter)</button>`;
        }

        showModal(`
            <div class="preempt-hdr ${hdrClass}">
                <span>${hdrIcon} ${hdrText}</span>
                <button class="preempt-hdr-close" onclick="document.getElementById('preempt-modal-bg').remove()">×</button>
            </div>
            <div class="preempt-body">${body}</div>
            <div class="preempt-ftr">${footer}</div>
        `);

        // Attach handlers
        setTimeout(() => {
            const sendBtn = document.getElementById('preempt-send-btn');
            const blockBtn = document.getElementById('preempt-block-btn');
            const sanitizeBtn = document.getElementById('preempt-sanitize-btn');

            const doSend = () => { closeModal(); pendingSend = prompt; performSend(); };
            const doBlock = () => { closeModal(); showToast('🚫 Blocked - prompt not sent'); };
            const doSanitize = () => {
                const input = getPromptText();
                if (input) setPromptText(input.element, sanitized);
                closeModal();
                pendingSend = sanitized;
                setTimeout(performSend, 100);
            };

            if (sendBtn) sendBtn.onclick = doSend;
            if (blockBtn) blockBtn.onclick = doBlock;
            if (sanitizeBtn) sanitizeBtn.onclick = doSanitize;

            // Add Enter key handler for modal actions - use capturing phase and stop all propagation
            const modalKeyHandler = (e) => {
                // Only handle if modal is still open
                const modal = document.getElementById('preempt-modal-bg');
                if (!modal) {
                    document.removeEventListener('keydown', modalKeyHandler, true);
                    window.removeEventListener('keydown', modalKeyHandler, true);
                    return;
                }

                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    // Execute the primary action based on what buttons exist
                    if (blockBtn) {
                        console.log('[Preempt AI] Enter pressed - blocking');
                        doBlock();
                    } else if (sanitizeBtn) {
                        console.log('[Preempt AI] Enter pressed - sanitizing');
                        doSanitize();
                    } else if (sendBtn) {
                        console.log('[Preempt AI] Enter pressed - sending');
                        doSend();
                    }

                    document.removeEventListener('keydown', modalKeyHandler, true);
                    window.removeEventListener('keydown', modalKeyHandler, true);
                    return false;
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    closeModal();
                    document.removeEventListener('keydown', modalKeyHandler, true);
                    window.removeEventListener('keydown', modalKeyHandler, true);
                    return false;
                }
            };

            // Add to both document and window to catch all events
            document.addEventListener('keydown', modalKeyHandler, true);
            window.addEventListener('keydown', modalKeyHandler, true);

            // Focus the primary button so Enter works naturally too
            if (blockBtn) blockBtn.focus();
            else if (sanitizeBtn) sanitizeBtn.focus();
            else if (sendBtn) sendBtn.focus();
        }, 100);
    }

    function showToast(msg, type = 'default') {
        // Remove any existing toast
        const existing = document.querySelector('.preempt-toast');
        if (existing) existing.remove();

        const t = document.createElement('div');
        t.className = 'preempt-toast';

        // Style based on type
        if (msg.includes('✅') || type === 'safe') {
            t.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            t.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
        } else if (msg.includes('🚫') || type === 'blocked') {
            t.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            t.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
        } else if (msg.includes('⚠️') || type === 'warning') {
            t.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            t.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.4)';
        }

        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // ============================================================
    // MAIN SCAN FUNCTION
    // ============================================================

    async function scanAndIntercept() {
        if (isProcessing) return false;

        const input = getPromptText();
        if (!input || !input.text) return false;

        // If this is a pending send we already approved, let it through
        if (pendingSend && input.text === pendingSend) {
            pendingSend = null;
            return false; // Don't intercept
        }

        isProcessing = true;
        const promptText = input.text;

        // Show loading immediately
        showLoading();

        // Local detection (instant) - returns [{name, tier}]
        let allThreats = detectThreats(promptText);

        // Try API with timeout
        let pii = [];
        let sanitized = promptText;
        let apiData = null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                apiData = await response.json();
                pii = apiData.pii_flags || [];
                sanitized = apiData.materialized_prompt || promptText;

                // Use API attacks if available
                if (apiData.security?.attacks && apiData.security.attacks.length > 0) {
                    // Replace local threats with API-detected attacks (more accurate)
                    allThreats = apiData.security.attacks.map(a => ({
                        name: a.name,
                        tier: a.tier,
                        severity: a.severity,
                        confidence: a.confidence
                    }));
                } else {
                    // Fallback to legacy detection fields
                    const threatNames = getThreatNames(allThreats);
                    if (apiData.security?.prompt_injection?.detected && !threatNames.includes('Prompt Injection')) {
                        allThreats.push({ name: 'Prompt Injection', tier: 'prompt_injection_direct' });
                    }
                    if (apiData.security?.jailbreak?.detected && !threatNames.includes('Jailbreak')) {
                        allThreats.push({ name: 'Jailbreak', tier: 'jailbreak' });
                    }
                }
            }
        } catch (err) {
            console.log('[Preempt AI] API unavailable, using local detection only');
            // Continue with local detection only
        }

        // Check if prompt is safe (no threats and no PII)
        const isSafe = allThreats.length === 0 && pii.length === 0;

        if (isSafe) {
            // For safe prompts: skip popup, show toast, and auto-send
            closeModal(); // Close loading modal
            showToast('✅ Prompt is safe - sending...');
            pendingSend = promptText;
            setTimeout(performSend, 100);
            return true;
        }

        // For unsafe prompts: show results modal with full API data
        showResults(promptText, allThreats, pii, sanitized, apiData);

        return true; // Intercepted
    }

    // ============================================================
    // EVENT INTERCEPTION
    // ============================================================

    function interceptHandler(e) {
        // Supported AI platforms - comprehensive list
        const host = location.hostname;
        const supportedHosts = [
            // OpenAI
            'chat.openai.com', 'chatgpt.com',
            // Anthropic
            'claude.ai',
            // Google
            'gemini.google.com', 'aistudio.google.com', 'bard.google.com', 'makersuite.google.com', 'labs.google',
            // Perplexity
            'perplexity.ai', 'www.perplexity.ai', 'labs.perplexity.ai',
            // Aggregators
            'poe.com', 'you.com',
            // HuggingFace
            'huggingface.co',
            // Microsoft
            'copilot.microsoft.com', 'www.bing.com',
            // Other AI Assistants
            'pi.ai', 'heypi.com', 'character.ai', 'beta.character.ai',
            // Developer Tools
            'groq.com', 'console.groq.com', 'chat.mistral.ai',
            'together.ai', 'www.together.ai', 'api.together.xyz',
            'cohere.com', 'dashboard.cohere.com', 'coral.cohere.com',
            'replicate.com', 'deepai.org', 'www.deepai.org',
            // Writing Tools
            'jasper.ai', 'www.jasper.ai', 'app.jasper.ai',
            'copy.ai', 'www.copy.ai', 'app.copy.ai',
            'writesonic.com', 'app.writesonic.com',
            'notion.so', 'www.notion.so',
            // Code Assistants
            'phind.com', 'www.phind.com',
            // Other
            'forefront.ai', 'www.forefront.ai', 'chat.forefront.ai',
            'open-assistant.io', 'www.llama2.ai'
        ];

        const isSupported = supportedHosts.some(h => host.includes(h) || host.endsWith(h));
        if (!isSupported) {
            return;
        }

        // Check if it's a send action
        let isSendAction = false;

        if (e.type === 'keydown' && e.key === 'Enter' && !e.shiftKey) {
            const target = e.target;
            if (target.tagName === 'TEXTAREA' || target.isContentEditable ||
                target.getAttribute('contenteditable') === 'true' ||
                target.id === 'prompt-textarea') {
                isSendAction = true;
            }
        }

        if (e.type === 'click') {
            const btn = e.target.closest('button');
            if (btn) {
                const label = (btn.getAttribute('aria-label') || '').toLowerCase();
                const testId = (btn.getAttribute('data-testid') || '').toLowerCase();
                if (label.includes('send') || testId.includes('send')) {
                    isSendAction = true;
                }
            }
        }

        if (!isSendAction) return;

        // Check if there's text to scan
        const input = getPromptText();
        if (!input || !input.text) return;

        // If this is an approved send, let it through
        if (pendingSend && input.text === pendingSend) {
            pendingSend = null;
            return;
        }

        // Intercept!
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        scanAndIntercept();
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        // Install global interceptors in capturing phase
        document.addEventListener('keydown', interceptHandler, true);
        document.addEventListener('click', interceptHandler, true);

        console.log('[Preempt AI] v1.0.0 - Ready! Intercepting on:', location.hostname);

        // Show activation toast
        setTimeout(() => {
            if (location.hostname.includes('chat.openai.com') || location.hostname.includes('chatgpt.com') ||
                location.hostname.includes('claude.ai') || location.hostname.includes('gemini.google.com')) {
                showToast('✅ Preempt AI Active');
            }
        }, 1000);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else if (document.body) {
        init();
    } else {
        // Fallback: wait for body
        const obs = new MutationObserver(() => {
            if (document.body) { obs.disconnect(); init(); }
        });
        obs.observe(document.documentElement, { childList: true });
    }

    // Also re-init on navigation (SPA support)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log('[Preempt AI] URL changed, re-checking...');
        }
    }).observe(document.body || document.documentElement, { subtree: true, childList: true });

    // Listen for extension messages
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === 'TOGGLE_PROTECTION') {
                // Could disable/enable here
            }
        });
    }

})();
