export const VTCHAT_CONVERSATION_TEMPLATE = `
<div id="vtchat-root">
    <style>
        :root {
            color-scheme: dark;
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
            margin: 0;
            padding: 0;
        }

        #vtchat-root {
            background: #0f1115;
            color: #f5f7fa;
            min-height: 100vh;
            padding: 24px;
        }

        .vtchat-container {
            max-width: 880px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .vtchat-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .vtchat-header h1 {
            font-size: 22px;
            margin: 0;
        }

        .vtchat-meta {
            color: #8a97a5;
            font-size: 13px;
        }

        .vtchat-card {
            background: #151821;
            border: 1px solid #1f2430;
            border-radius: 12px;
            padding: 16px 18px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 12px 32px rgba(2, 6, 23, 0.35);
        }

        .vtchat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }

        .vtchat-section-title {
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: #9bb5d0;
            margin: 0 0 8px 0;
        }

        ul.vtchat-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        ul.vtchat-list li {
            position: relative;
            padding-left: 16px;
            color: #d6e1f0;
            line-height: 1.45;
        }

        ul.vtchat-list li::before {
            content: '';
            position: absolute;
            left: 4px;
            top: 9px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #48a3ff;
        }

        .vtchat-empty {
            color: #8a97a5;
            font-size: 13px;
        }

        .vtchat-summary {
            font-size: 16px;
            line-height: 1.6;
            color: #f5f7fa;
            margin: 0;
        }

        .vtchat-footer {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #6a7686;
        }

        .vtchat-footer span {
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .vtchat-footer svg {
            width: 14px;
            height: 14px;
            stroke: currentColor;
        }
    </style>
    <div class="vtchat-container">
        <header class="vtchat-header">
            <h1>VTChat Research Brief</h1>
            <div class="vtchat-meta" id="vtchat-meta">Waiting for VTChat to generate insights…</div>
        </header>
        <article class="vtchat-card">
            <p class="vtchat-summary" id="vtchat-summary"></p>
        </article>
        <section class="vtchat-grid">
            <article class="vtchat-card">
                <h2 class="vtchat-section-title">Key insights</h2>
                <ul class="vtchat-list" id="vtchat-insights"></ul>
            </article>
            <article class="vtchat-card">
                <h2 class="vtchat-section-title">Recommended actions</h2>
                <ul class="vtchat-list" id="vtchat-actions"></ul>
            </article>
            <article class="vtchat-card">
                <h2 class="vtchat-section-title">Follow-up prompts</h2>
                <ul class="vtchat-list" id="vtchat-followups"></ul>
            </article>
        </section>
        <footer class="vtchat-footer">
            <span id="vtchat-status"></span>
            <span>
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 19h16M4 5h16" stroke-width="1.5" stroke-linecap="round"></path>
                </svg>
                Powered by VTChat Apps SDK bridge
            </span>
        </footer>
    </div>
    <script type="module">
        const summaryEl = document.getElementById('vtchat-summary');
        const insightsEl = document.getElementById('vtchat-insights');
        const actionsEl = document.getElementById('vtchat-actions');
        const followUpsEl = document.getElementById('vtchat-followups');
        const metaEl = document.getElementById('vtchat-meta');
        const statusEl = document.getElementById('vtchat-status');

        const openaiBridge = window.openai ?? {};

        const renderList = (container, items) => {
            container.replaceChildren();

            if (!Array.isArray(items) || items.length === 0) {
                const empty = document.createElement('li');
                empty.className = 'vtchat-empty';
                empty.textContent = 'No data available yet.';
                container.appendChild(empty);
                return;
            }

            const safeItems = items
                .map(item => (typeof item === 'string' ? item : JSON.stringify(item)))
                .filter(Boolean);

            safeItems.forEach(text => {
                const element = document.createElement('li');
                element.textContent = text;
                container.appendChild(element);
            });
        };

        const renderPayload = payload => {
            if (!payload) {
                return;
            }

            const structured = payload.structuredContent ?? {};
            const meta = payload._meta ?? {};
            const summary = structured.summary ?? '';
            const insights = structured.insights ?? structured.keyFindings ?? [];
            const actions = structured.actionItems ?? structured.actions ?? [];
            const followUps = structured.followUps ?? structured.followUpQuestions ?? [];
            const timestamp = structured.generatedAt ?? structured.timestamp;

            summaryEl.textContent = summary || 'VTChat will populate this summary shortly.';
            renderList(insightsEl, insights);
            renderList(actionsEl, actions);
            renderList(followUpsEl, followUps);

            const audience = structured.audience ?? meta.audience ?? 'General';
            const model = meta.model ?? 'Unspecified model';
            const clock = timestamp ? new Date(timestamp).toLocaleString() : 'Pending response';
            metaEl.textContent = 'Audience: ' + audience + ' - Model: ' + model;
            statusEl.textContent = 'Last updated ' + clock;
        };

        const handleUpdate = detail => {
            if (!detail) {
                return;
            }

            if (detail.detail) {
                renderPayload(detail.detail);
                return;
            }

            renderPayload(detail);
        };

        if (typeof openaiBridge.subscribeToToolOutput === 'function') {
            openaiBridge.subscribeToToolOutput(event => handleUpdate(event));
        }

        if (typeof openaiBridge.subscribeToToolInvocation === 'function') {
            openaiBridge.subscribeToToolInvocation(event => handleUpdate(event));
        }

        if (openaiBridge.toolInvocation) {
            handleUpdate(openaiBridge.toolInvocation);
        }

        if (openaiBridge.toolOutput) {
            handleUpdate(openaiBridge.toolOutput);
        }
    </script>
</div>
`.trim();
