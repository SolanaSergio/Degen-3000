class DevTools {
    constructor() {
        this.isOpen = false;
        this.createToggleButton();
        this.createInterface();
        this.tools = [];
        this.initializeTools();
        this.removeDebugHeader();
    }

    removeDebugHeader() {
        // Remove all possible debug components from header
        const debugElements = document.querySelectorAll('.debug-component, .debug-button, #debug-button, [id*="debug-comp"], .debug-comp');
        debugElements.forEach(el => el.remove());

        // Add style to hide any debug components that might be added dynamically
        const style = document.createElement('style');
        style.textContent = `
            .debug-component,
            .debug-button,
            #debug-button,
            [id*="debug-comp"],
            [class*="debug-comp"],
            .debug-comp {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -1 !important;
            }
        `;
        document.head.appendChild(style);

        // Also remove any inline debug text/elements
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            const debugText = Array.from(headerContent.childNodes).find(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent.includes('Debug Comp')
            );
            if (debugText) {
                debugText.remove();
            }
        }
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'dev-tools-toggle';
        button.innerHTML = '🛠️ DevTools';
        button.title = 'Toggle Developer Tools (Ctrl+D)';
        
        const buttonStyle = document.createElement('style');
        buttonStyle.textContent = `
            #dev-tools-toggle {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                background: #2d2d2d;
                color: #fff;
                border: 1px solid #3d3d3d;
                border-radius: 8px;
                cursor: pointer;
                font-family: system-ui, -apple-system, sans-serif;
                z-index: 10000;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #dev-tools-toggle:hover {
                background: #3d3d3d;
                transform: translateY(-1px);
            }
            #dev-tools-toggle.active {
                background: #4CAF50;
                border-color: #45a049;
            }

            /* Hide any debug components in header */
            .debug-component {
                display: none !important;
            }
        `;
        
        document.head.appendChild(buttonStyle);
        document.body.appendChild(button);
        
        button.addEventListener('click', () => this.toggle());
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    createInterface() {
        const container = document.createElement('div');
        container.id = 'dev-tools';
        
        const styles = document.createElement('style');
        styles.textContent = `
            #dev-tools {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 300px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 12px;
                color: #fff;
                font-family: system-ui, -apple-system, sans-serif;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: none;
                overflow: hidden;
            }

            .dev-tools-header {
                padding: 16px;
                background: #2d2d2d;
                border-bottom: 1px solid #333;
            }

            .dev-tools-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .dev-tools-content {
                padding: 8px;
            }

            .tool-button {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 12px;
                background: #2d2d2d;
                border: 1px solid #333;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
                margin-bottom: 8px;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .tool-button:hover {
                background: #3d3d3d;
                transform: translateY(-1px);
            }

            .tool-button.active {
                background: #4CAF50;
                border-color: #45a049;
            }

            .tool-button .icon {
                font-size: 18px;
            }

            .tool-button .label {
                flex: 1;
            }

            .tool-button .shortcut {
                font-size: 12px;
                color: #888;
                padding: 2px 6px;
                background: #222;
                border-radius: 4px;
            }
        `;

        container.innerHTML = `
            <div class="dev-tools-header">
                <h3>🛠️ Developer Tools</h3>
            </div>
            <div class="dev-tools-content">
                <!-- Tool buttons will be added here -->
            </div>
        `;

        document.head.appendChild(styles);
        document.body.appendChild(container);
        
        this.container = container;
        this.toolsContainer = container.querySelector('.dev-tools-content');
    }

    initializeTools() {
        // Add Console Logger
        this.addTool({
            id: 'console',
            icon: '📊',
            label: 'Console Logger',
            shortcut: 'Ctrl+L',
            onClick: () => {
                if (window.logVisualizer) {
                    window.logVisualizer.toggle();
                }
            }
        });

        // Add Debug Console
        this.addTool({
            id: 'debug',
            icon: '🔧',
            label: 'Debug Console',
            shortcut: 'Alt+D',
            onClick: () => {
                if (window.debugDegen) {
                    window.debugDegen.runDiagnostics();
                }
            }
        });

        // Add Component Inspector
        this.addTool({
            id: 'components',
            icon: '🔍',
            label: 'Component Inspector',
            shortcut: 'Alt+C',
            onClick: () => {
                if (window.debugDegen) {
                    window.debugDegen.inspectComponents();
                }
            }
        });

        // Add API Monitor
        this.addTool({
            id: 'api',
            icon: '🌐',
            label: 'API Monitor',
            shortcut: 'Alt+A',
            onClick: () => {
                if (window.apiMonitor) {
                    window.apiMonitor.toggle();
                }
            }
        });

        // Add Performance Monitor
        this.addTool({
            id: 'performance',
            icon: '⚡',
            label: 'Performance',
            shortcut: 'Alt+P',
            onClick: () => {
                if (window.debugDegen) {
                    window.debugDegen.showPerformance();
                }
            }
        });
    }

    addTool(tool) {
        const button = document.createElement('button');
        button.className = 'tool-button';
        button.dataset.tool = tool.id;  // Add data attribute for identification
        button.innerHTML = `
            <span class="icon">${tool.icon}</span>
            <span class="label">${tool.label}</span>
            <span class="shortcut">${tool.shortcut}</span>
        `;
        
        button.addEventListener('click', () => {
            tool.onClick();
            // Toggle active state for this button
            button.classList.toggle('active');
            
            // If this is the debug tool, sync its state with the debug container
            if (tool.id === 'debug') {
                const debugContainer = document.getElementById('debug-error-container');
                if (debugContainer) {
                    debugContainer.style.display = button.classList.contains('active') ? 'block' : 'none';
                }
            }
        });

        this.toolsContainer.appendChild(button);
        this.tools.push({ ...tool, element: button });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'block' : 'none';
        document.getElementById('dev-tools-toggle').classList.toggle('active', this.isOpen);
    }
}

// Initialize DevTools when the page loads
window.addEventListener('load', () => {
    window.devTools = new DevTools();
}); 