(() => {
    const ws = new WebSocket(`ws://${window.location.host}`);
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
    };

    // Log categories and their colors
    const LOG_CATEGORIES = {
        API: '#4CAF50',      // Green
        UI: '#2196F3',       // Blue
        EVENT: '#9C27B0',    // Purple
        SYSTEM: '#FF9800',   // Orange
        DEBUG: '#607D8B',    // Blue Grey
        ERROR: '#F44336',    // Red
        COMPONENT: '#00BCD4' // Cyan
    };

    // Format timestamp
    function getTimestamp() {
        return new Date().toLocaleTimeString();
    }

    // Format message based on type
    function formatMessage(args, category = 'SYSTEM') {
        const timestamp = getTimestamp();
        const color = LOG_CATEGORIES[category] || '#777777';
        
        let message = Array.from(args).map(arg => {
            if (typeof arg === 'object') {
                if (arg instanceof Error) {
                    return `${arg.name}: ${arg.message}\n${arg.stack}`;
                }
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');

        // If message is a details object, format it nicely
        if (message.includes('"Details"')) {
            try {
                const details = JSON.parse(message);
                if (details.component) category = 'COMPONENT';
                message = JSON.stringify(details, null, 2);
            } catch (e) {}
        }

        return {
            formatted: `%c[${timestamp}] [${category}] ${message}`,
            style: `color: ${color}; font-weight: ${category === 'ERROR' ? 'bold' : 'normal'}`,
            raw: {
                timestamp,
                category,
                message,
                level: category === 'ERROR' ? 'error' : 'info'
            }
        };
    }

    // Detect log category from message
    function detectCategory(args) {
        const message = args[0]?.toString() || '';
        
        if (message.includes('API') || message.includes('request') || message.includes('response')) return 'API';
        if (message.includes('📱') || message.includes('UI') || message.includes('layout')) return 'UI';
        if (message.includes('event') || message.includes('click') || message.includes('focus')) return 'EVENT';
        if (message.includes('component') || message.includes('initialized')) return 'COMPONENT';
        if (message.includes('debug') || message.includes('🔍')) return 'DEBUG';
        
        return 'SYSTEM';
    }

    // Override console methods
    console.log = function() {
        const category = detectCategory(arguments);
        const formatted = formatMessage(arguments, category);
        originalConsole.log(formatted.formatted, formatted.style);
        sendLog(formatted.raw);
    };

    console.error = function() {
        const formatted = formatMessage(arguments, 'ERROR');
        originalConsole.error(formatted.formatted, formatted.style);
        sendLog(formatted.raw);
    };

    console.warn = function() {
        const formatted = formatMessage(arguments, 'SYSTEM');
        originalConsole.warn(formatted.formatted, formatted.style);
        sendLog(formatted.raw);
    };

    console.info = function() {
        const formatted = formatMessage(arguments, 'SYSTEM');
        originalConsole.info(formatted.formatted, formatted.style);
        sendLog(formatted.raw);
    };

    console.debug = function() {
        const formatted = formatMessage(arguments, 'DEBUG');
        originalConsole.debug(formatted.formatted, formatted.style);
        sendLog(formatted.raw);
    };

    // Add category-specific logging methods
    Object.keys(LOG_CATEGORIES).forEach(category => {
        console[category.toLowerCase()] = function() {
            const formatted = formatMessage(arguments, category);
            originalConsole.log(formatted.formatted, formatted.style);
            sendLog(formatted.raw);
        };
    });

    function sendLog(logData) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                ...logData,
                url: window.location.href
            }));
        }
    }

    // Handle connection events
    ws.onopen = () => {
        console.info('Console logger connected to server');
    };

    ws.onclose = () => {
        console.warn('Console logger disconnected from server');
    };

    ws.onerror = (error) => {
        originalConsole.error('Console logger WebSocket error:', error);
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
        console.error(`Unhandled error: ${event.message} at ${event.filename}:${event.lineno}`);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error(`Unhandled promise rejection: ${event.reason}`);
    });

    // Expose logger configuration
    window.loggerConfig = {
        categories: LOG_CATEGORIES,
        setCategory: (category, color) => {
            if (category && color) {
                LOG_CATEGORIES[category.toUpperCase()] = color;
            }
        }
    };
})(); 