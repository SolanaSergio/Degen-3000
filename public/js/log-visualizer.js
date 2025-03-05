const LOG_CATEGORIES = {
    'ui': '#4CAF50',      // Green
    'message': '#2196F3', // Blue
    'level': '#FFC107',   // Amber
    'meme': '#E91E63',    // Pink
    'system': '#9C27B0',  // Purple
    'api': '#FF5722',     // Deep Orange
    'component': '#795548', // Brown
    'debug': '#607D8B'    // Blue Grey
};

class LogVisualizer {
    constructor() {
        this.logs = [];
        this.filters = {
            categories: new Set(Object.keys(LOG_CATEGORIES)),
            search: '',
            timeRange: {
                start: null,
                end: null
            }
        };
        this.isExpanded = false;
        this.createInterface();
        this.attachWebSocket();
    }

    createInterface() {
        const container = document.createElement('div');
        container.id = 'log-visualizer';
        container.innerHTML = `
            <div class="log-viz-header">
                <div class="log-viz-title">
                    <h3>📊 Console Logger</h3>
                    <div class="log-viz-controls">
                        <button class="clear-logs" title="Clear logs">🗑️</button>
                        <button class="export-logs" title="Export logs">💾</button>
                        <button class="toggle-auto-scroll" data-active="true" title="Auto-scroll">📜</button>
                        <button class="toggle-expanded" title="Toggle size">⚡</button>
                    </div>
                </div>
                <div class="filters-bar">
                    <div class="category-filters">
                        ${Object.entries(LOG_CATEGORIES).map(([cat, color]) => `
                            <label class="category-filter" style="--category-color: ${color}">
                                <input type="checkbox" value="${cat}" checked>
                                <span class="category-label">${cat}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="search-box">
                        <input type="text" placeholder="Search logs..." id="log-search">
                    </div>
                </div>
            </div>
            <div class="log-viz-content">
                <div class="log-list"></div>
                <div class="log-details"></div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #log-visualizer {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 80vw;
                max-width: 1200px;
                height: 600px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 12px;
                display: none;
                flex-direction: column;
                font-family: system-ui, -apple-system, sans-serif;
                color: #fff;
                z-index: 9998;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                overflow: hidden;
            }

            .log-viz-header {
                padding: 16px;
                background: #2d2d2d;
                border-bottom: 1px solid #333;
                cursor: move;
            }

            .log-viz-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .log-viz-title h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .log-viz-controls {
                display: flex;
                gap: 8px;
            }

            .log-viz-controls button {
                padding: 8px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 6px;
                color: #fff;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
            }

            .log-viz-controls button:hover {
                background: #333;
                transform: translateY(-1px);
            }

            .log-viz-controls button[data-active="true"] {
                background: #4CAF50;
                border-color: #45a049;
            }

            .filters-bar {
                display: flex;
                gap: 12px;
                align-items: center;
                background: #1a1a1a;
                padding: 12px;
                border-radius: 8px;
            }

            .category-filters {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .category-filter {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                background: #2d2d2d;
                border: 1px solid #333;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .category-filter:hover {
                background: #333;
            }

            .category-filter input:checked + .category-label {
                opacity: 1;
            }

            .category-label {
                color: var(--category-color);
                opacity: 0.5;
            }

            .log-viz-content {
                flex: 1;
                display: flex;
                overflow: hidden;
                background: #1a1a1a;
            }

            .log-list {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }

            .log-entry {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                padding: 8px 12px;
                background: #2d2d2d;
                border: 1px solid #333;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 8px;
                transition: all 0.2s ease;
            }

            .log-entry:hover {
                background: #333;
                transform: translateX(2px);
            }

            .log-entry.selected {
                background: #2d2d2d;
                border-color: #4CAF50;
            }

            .log-time {
                color: #888;
                font-family: monospace;
                white-space: nowrap;
            }

            .category-badge {
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                text-transform: uppercase;
                font-weight: 600;
                background: var(--category-color);
                color: #000;
            }

            .log-message {
                flex: 1;
                word-break: break-word;
                font-family: monospace;
            }

            .log-details {
                width: 350px;
                padding: 16px;
                background: #2d2d2d;
                border-left: 1px solid #333;
                overflow-y: auto;
                font-size: 13px;
            }

            .detail-row {
                margin-bottom: 12px;
            }

            .detail-key {
                display: block;
                color: #888;
                margin-bottom: 4px;
                font-size: 12px;
                text-transform: uppercase;
            }

            .json-view {
                font-family: monospace;
                white-space: pre-wrap;
                background: #1a1a1a;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #333;
                font-size: 12px;
                line-height: 1.4;
            }

            .log-list::-webkit-scrollbar,
            .log-details::-webkit-scrollbar {
                width: 8px;
            }

            .log-list::-webkit-scrollbar-track,
            .log-details::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .log-list::-webkit-scrollbar-thumb,
            .log-details::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }

            #log-search {
                background: #2d2d2d;
                border: 1px solid #333;
                color: #fff;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                width: 200px;
                transition: all 0.2s ease;
            }

            #log-search:focus {
                background: #333;
                border-color: #4CAF50;
                outline: none;
            }

            #log-search::placeholder {
                color: #666;
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(container);

        this.elements = {
            container,
            logList: container.querySelector('.log-list'),
            logDetails: container.querySelector('.log-details'),
            searchInput: container.querySelector('#log-search'),
            categoryFilters: container.querySelectorAll('.category-filter input'),
            clearBtn: container.querySelector('.clear-logs'),
            exportBtn: container.querySelector('.export-logs'),
            autoScrollBtn: container.querySelector('.toggle-auto-scroll'),
            expandBtn: container.querySelector('.toggle-expanded')
        };

        this.bindEvents();
    }

    bindEvents() {
        // Category filters
        this.elements.categoryFilters.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.filters.categories.add(checkbox.value);
                } else {
                    this.filters.categories.delete(checkbox.value);
                }
                this.renderLogs();
            });
        });

        // Search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.renderLogs();
        });

        // Clear logs
        this.elements.clearBtn.addEventListener('click', () => {
            this.logs = [];
            this.renderLogs();
        });

        // Export logs
        this.elements.exportBtn.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logs-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Auto-scroll toggle
        this.elements.autoScrollBtn.addEventListener('click', () => {
            const current = this.elements.autoScrollBtn.dataset.active === 'true';
            this.elements.autoScrollBtn.dataset.active = !current;
            this.elements.autoScrollBtn.style.opacity = current ? '0.5' : '1';
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Toggle expanded mode
        this.elements.expandBtn.addEventListener('click', () => {
            this.elements.container.classList.toggle('expanded');
            if (this.elements.container.classList.contains('expanded')) {
                this.elements.container.style.transform = 'translate(50%, -50%)';
                this.elements.container.style.left = '50%';
                this.elements.container.style.top = '50%';
                this.elements.container.style.right = 'auto';
            } else {
                this.elements.container.style.transform = 'none';
                this.elements.container.style.right = '20px';
                this.elements.container.style.top = '70px';
                this.elements.container.style.left = 'auto';
            }
        });

        // Make draggable only when not expanded
        let isDragging = false;
        let startX, startY;

        const dragStart = (e) => {
            if (e.target.closest('.log-viz-header') && !this.elements.container.classList.contains('expanded')) {
                isDragging = true;
                const rect = this.elements.container.getBoundingClientRect();
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                const x = e.clientX - startX;
                const y = e.clientY - startY;
                
                // Keep within viewport bounds
                const maxX = window.innerWidth - this.elements.container.offsetWidth;
                const maxY = window.innerHeight - this.elements.container.offsetHeight;
                
                this.elements.container.style.left = Math.min(Math.max(0, x), maxX) + 'px';
                this.elements.container.style.top = Math.min(Math.max(0, y), maxY) + 'px';
                this.elements.container.style.right = 'auto';
            }
        };

        const dragEnd = () => {
            isDragging = false;
        };

        this.elements.container.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.elements.container.classList.contains('expanded')) {
                this.elements.container.style.transform = 'translate(50%, -50%)';
                this.elements.container.style.left = '50%';
                this.elements.container.style.top = '50%';
            } else {
                const rect = this.elements.container.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    this.elements.container.style.left = (window.innerWidth - rect.width - 20) + 'px';
                }
                if (rect.bottom > window.innerHeight) {
                    this.elements.container.style.top = (window.innerHeight - rect.height - 20) + 'px';
                }
            }
        });
    }

    attachWebSocket() {
        const ws = new WebSocket(`ws://${window.location.host}`);
        
        ws.onmessage = (event) => {
            const log = JSON.parse(event.data);
            this.addLog(log);
        };
    }

    addLog(log) {
        // Ensure log has all required properties
        const formattedLog = {
            timestamp: log.timestamp || new Date().toISOString(),
            category: log.category || 'debug',
            message: log.message || '',
            details: log.details || null
        };

        // Format the log message if it's an object
        if (typeof formattedLog.message === 'object') {
            formattedLog.details = formattedLog.message;
            formattedLog.message = this.summarizeObject(formattedLog.message);
        }

        this.logs.push(formattedLog);
        
        // Always try to render the log immediately
        this.renderLog(formattedLog);
        
        if (this.elements.autoScrollBtn.dataset.active === 'true') {
            requestAnimationFrame(() => {
                this.elements.logList.scrollTop = this.elements.logList.scrollHeight;
            });
        }
    }

    summarizeObject(obj) {
        if (!obj) return 'null';
        
        if (Array.isArray(obj)) {
            return `Array(${obj.length})`;
        }

        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';

        // Try to find meaningful keys to display
        const importantKeys = ['id', 'type', 'name', 'message', 'status'];
        const foundKey = importantKeys.find(key => obj[key]);
        
        if (foundKey) {
            return `{ ${foundKey}: ${JSON.stringify(obj[foundKey])} ... }`;
        }

        return `{ ${keys[0]}: ${JSON.stringify(obj[keys[0]])} ... }`;
    }

    shouldShowLog(log) {
        // Category filter
        if (this.filters.categories.size > 0 && !this.filters.categories.has(log.category)) {
            return false;
        }

        // Search filter
        if (this.filters.search && !JSON.stringify(log).toLowerCase().includes(this.filters.search)) {
            return false;
        }

        // Time range filter
        const logTime = new Date(log.timestamp);
        if (this.filters.timeRange.start && logTime < this.filters.timeRange.start) {
            return false;
        }
        if (this.filters.timeRange.end && logTime > this.filters.timeRange.end) {
            return false;
        }

        return true;
    }

    renderLog(log) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        // Format timestamp
        const time = new Date(log.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });

        // Create category badge
        const category = document.createElement('span');
        category.className = 'category-badge';
        category.style.backgroundColor = LOG_CATEGORIES[log.category] || '#607D8B';
        category.textContent = log.category;

        // Format the message
        const messageEl = document.createElement('span');
        messageEl.className = 'log-message';
        messageEl.textContent = typeof log.message === 'string' ? log.message : JSON.stringify(log.message);

        // Create timestamp element
        const timeEl = document.createElement('span');
        timeEl.className = 'log-time';
        timeEl.textContent = time;

        // Assemble the entry
        entry.appendChild(timeEl);
        entry.appendChild(category);
        entry.appendChild(messageEl);
        
        entry.addEventListener('click', () => {
            const details = {
                timestamp: new Date(log.timestamp).toISOString(),
                category: log.category,
                message: log.message,
                ...(log.details && { details: log.details })
            };

            this.elements.logDetails.innerHTML = this.formatLogDetails(details);
            document.querySelectorAll('.log-entry.selected').forEach(el => el.classList.remove('selected'));
            entry.classList.add('selected');
        });

        this.elements.logList.appendChild(entry);
    }

    formatLogDetails(details) {
        const formatValue = (value) => {
            if (typeof value === 'object' && value !== null) {
                return `<div class="json-view">${this.formatJSON(value)}</div>`;
            }
            return `<span class="string-value">${value}</span>`;
        };

        return Object.entries(details)
            .map(([key, value]) => `
                <div class="detail-row">
                    <span class="detail-key">${key}:</span>
                    ${formatValue(value)}
                </div>
            `).join('');
    }

    formatJSON(obj, level = 0) {
        const indent = '  '.repeat(level);
        const entries = Object.entries(obj);
        
        if (entries.length === 0) return '{}';
        
        return `{
${entries.map(([key, value]) => {
            const formattedValue = typeof value === 'object' && value !== null
                ? this.formatJSON(value, level + 1)
                : JSON.stringify(value);
            return `${indent}  "${key}": ${formattedValue}`;
        }).join(',\n')}
${indent}}`;
    }

    renderLogs() {
        this.elements.logList.innerHTML = '';
        this.elements.logDetails.innerHTML = '';
        
        this.logs.forEach(log => {
            if (this.shouldShowLog(log)) {
                this.renderLog(log);
            }
        });
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        this.elements.container.style.display = this.isExpanded ? 'flex' : 'none';
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('load', () => {
    window.logVisualizer = new LogVisualizer();
}); 