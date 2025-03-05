const WebSocket = require('ws');
const chalk = require('chalk');
let wss;

// Log categories and their colors (using chalk for server-side coloring)
const LOG_CATEGORIES = {
    API: chalk.green,
    UI: chalk.blue,
    EVENT: chalk.magenta,
    SYSTEM: chalk.yellow,
    DEBUG: chalk.gray,
    ERROR: chalk.red,
    COMPONENT: chalk.cyan
};

// Format log message for server output
function formatServerLog(logData) {
    const timestamp = new Date().toLocaleTimeString();
    const category = logData.category || 'SYSTEM';
    const colorize = LOG_CATEGORIES[category] || chalk.white;
    
    let message = logData.message;
    if (typeof message === 'object') {
        message = JSON.stringify(message, null, 2);
    }

    // Clean up message if it's a JSON string
    try {
        const parsed = JSON.parse(message);
        if (parsed.Details || parsed.details) {
            message = JSON.stringify(parsed, null, 2);
        }
    } catch (e) {}

    return `${chalk.gray(`[${timestamp}]`)} ${colorize(`[${category}]`)} ${message}`;
}

function initializeWebSocketServer(server) {
    // Install chalk if not present
    try {
        require('chalk');
    } catch (e) {
        console.log('Installing chalk for better log formatting...');
        require('child_process').execSync('npm install chalk@4');
    }

    wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log(formatServerLog({
            category: 'SYSTEM',
            message: 'New client connected to console logger'
        }));
        
        ws.on('message', (message) => {
            try {
                const logData = JSON.parse(message);
                console.log(formatServerLog(logData));
                
                // Broadcast to all connected clients except sender
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(logData));
                    }
                });
            } catch (error) {
                console.error(formatServerLog({
                    category: 'ERROR',
                    message: `Error processing log message: ${error.message}`
                }));
            }
        });
        
        ws.on('close', () => {
            console.log(formatServerLog({
                category: 'SYSTEM',
                message: 'Client disconnected from console logger'
            }));
        });
    });
    
    return wss;
}

module.exports = {
    initializeWebSocketServer
}; 