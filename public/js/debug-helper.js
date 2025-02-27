/**
 * debug-helper.js
 * A utility for capturing and displaying JavaScript errors
 */

(function() {
    // Create error container
    function createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'debug-error-container';
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.left = '10px';
        container.style.right = '10px';
        container.style.maxHeight = '50vh';
        container.style.overflow = 'auto';
        container.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        container.style.color = 'white';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        container.style.fontFamily = 'monospace';
        container.style.fontSize = '14px';
        container.style.zIndex = '9999';
        container.style.display = 'none';
        
        const heading = document.createElement('h2');
        heading.textContent = 'JavaScript Errors:';
        heading.style.margin = '0 0 10px 0';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = 'white';
        closeButton.style.color = 'red';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        
        closeButton.addEventListener('click', function() {
            container.style.display = 'none';
        });
        
        const errorList = document.createElement('div');
        errorList.id = 'error-list';
        
        container.appendChild(heading);
        container.appendChild(closeButton);
        container.appendChild(errorList);
        
        return container;
    }
    
    // Add error to the container
    function logError(error) {
        const container = document.getElementById('debug-error-container') || createErrorContainer();
        if (!document.body.contains(container)) {
            document.body.appendChild(container);
        }
        
        container.style.display = 'block';
        
        const errorList = document.getElementById('error-list');
        const errorItem = document.createElement('div');
        errorItem.style.marginBottom = '10px';
        errorItem.style.padding = '10px';
        errorItem.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
        
        // Format error message
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `<strong>${error.message || 'Unknown error'}</strong>`;
        errorItem.appendChild(errorMessage);
        
        // Format stack trace if available
        if (error.stack) {
            const stack = document.createElement('pre');
            stack.style.marginTop = '5px';
            stack.style.fontSize = '12px';
            stack.style.whiteSpace = 'pre-wrap';
            stack.style.color = 'rgba(255, 255, 255, 0.8)';
            stack.textContent = error.stack;
            errorItem.appendChild(stack);
        }
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.style.fontSize = '12px';
        timestamp.style.marginTop = '5px';
        timestamp.style.color = 'rgba(255, 255, 255, 0.6)';
        timestamp.textContent = new Date().toLocaleTimeString();
        errorItem.appendChild(timestamp);
        
        errorList.appendChild(errorItem);
    }
    
    // Capture global errors
    window.addEventListener('error', function(event) {
        logError(event.error || new Error(event.message));
        // Don't prevent default so errors still show in console
    });
    
    // Capture promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        logError(event.reason || new Error('Unhandled Promise rejection'));
    });
    
    // Log initialization issues
    window.addEventListener('DOMContentLoaded', function() {
        // Check for Core Components
        if (typeof window.EventBus === 'undefined') {
            logError(new Error('EventBus is not defined - check if components/common/EventBus.js is loaded'));
        }
        
        if (typeof window.ComponentBase === 'undefined') {
            logError(new Error('ComponentBase is not defined - check if components/common/ComponentBase.js is loaded'));
        }
        
        if (typeof window.ThemeManager === 'undefined') {
            logError(new Error('ThemeManager is not defined - check if components/common/ThemeManager.js is loaded'));
        }
        
        // Log a success message when debug is loaded
        console.log('Debug helper initialized!');
    });
    
    // Expose helper functions to global scope
    window.debugHelper = {
        logError: logError,
        checkComponents: function() {
            const componentList = [
                'Header', 
                'StonksTicker', 
                'ControlPanel', 
                'ChatWindow', 
                'MessageInput', 
                'Soundboard', 
                'MemeGallery', 
                'Disclaimer'
            ];
            
            console.log('Checking components...');
            componentList.forEach(function(comp) {
                if (typeof window[comp] === 'undefined') {
                    console.error(`Component ${comp} is not defined!`);
                    logError(new Error(`Component ${comp} is not defined - check if components/${comp}/${comp}.js is loaded`));
                } else {
                    console.log(`Component ${comp} is loaded.`);
                }
            });
        }
    };
})(); 