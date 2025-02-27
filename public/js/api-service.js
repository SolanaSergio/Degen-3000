/**
 * api-service.js
 * API service for DEGEN ROAST 3000
 * Handles communication with the backend server
 */

// Create an immediately invoked function expression (IIFE) to create a closed scope
(function() {
  /**
   * API Service class to handle all API interactions
   */
  class ApiService {
    /**
     * Initialize the API service
     */
    constructor() {
      // Base URL for API requests
      this.baseUrl = '/api';
      
      // Track in-flight requests
      this.pendingRequests = new Map();
      
      // Debug mode
      this.debug = true;
      
      // Request timeout (ms)
      this.timeout = 15000;
      
      // Initialize request ID counter
      this.requestIdCounter = 1;
      
      // Check if EventBus exists
      if (!window.EventBus) {
        console.error('ApiService: EventBus not found. API tracking will be limited.');
      }
      
      console.log('ApiService initialized');
    }
    
    /**
     * Log API actions with timestamps if debug mode is enabled
     * @param {string} action - The action being performed
     * @param {any} data - Data related to the action
     */
    log(action, data) {
      if (!this.debug) return;
      
      const timestamp = new Date().toISOString();
      
      // Use debugLogger if available
      if (window.debugLogger) {
        window.debugLogger.api('API', `${action}`, data);
      } else {
        console.log(`🔌 API [${timestamp}] ${action}:`, data);
      }
    }
    
    /**
     * Make a POST request to generate a roast
     * @param {string} message - User message
     * @param {number} level - Roast level (1-5)
     * @returns {Promise<object>} - Response object
     */
    async generateRoast(message, level = 3) {
      const requestId = `roast-${this.requestIdCounter++}`;
      const requestData = { message, level };
      
      try {
        this.log('REQUEST', { 
          id: requestId,
          endpoint: '/roast', 
          message: message.substring(0, 50) + (message.length > 50 ? '...' : ''), 
          level 
        });
        
        // Track this request with EventBus if available
        if (window.EventBus) {
          window.EventBus.trackMessage(requestId, {
            type: 'roast',
            message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            level
          });
        }
        
        // Start the request
        this.pendingRequests.set(requestId, { 
          type: 'roast',
          startTime: Date.now(),
          data: requestData
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.baseUrl}/roast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Request-ID': requestId
          },
          signal: controller.signal,
          body: JSON.stringify(requestData),
          credentials: 'same-origin'
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Calculate request duration
        const duration = Date.now() - this.pendingRequests.get(requestId).startTime;
        
        if (!response.ok) {
          let errorData;
          let errorMessage;
          
          try {
            // Check the content type to see if it's really JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              errorData = await response.json();
              errorMessage = errorData.message || `API error: ${response.status}`;
            } else {
              // It's not JSON, probably HTML error page
              const text = await response.text();
              errorMessage = `API error: ${response.status} - Endpoint not found`;
              errorData = { error: 'endpoint_not_found', text: text.substring(0, 100) };
            }
          } catch (jsonError) {
            // Error parsing the response, probably not JSON
            errorMessage = `API error: ${response.status} - Failed to parse response`;
            errorData = { error: 'parse_error' };
          }
          
          this.log('ERROR', { 
            id: requestId,
            status: response.status, 
            data: errorData,
            duration: `${duration}ms`
          });
          
          // Track error response with EventBus
          if (window.EventBus) {
            window.EventBus.trackResponse(requestId, {
              error: errorMessage,
              status: response.status,
              duration
            }, true);
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        this.log('RESPONSE', {
          id: requestId,
          status: response.status,
          duration: `${duration}ms`,
          data: {
            ...data,
            message: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : '')
          }
        });
        
        // Track successful response with EventBus
        if (window.EventBus) {
          window.EventBus.trackResponse(requestId, {
            message: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
            roastLevel: data.roastLevel,
            duration,
            status: response.status
          });
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        return data;
      } catch (error) {
        // Handle aborted requests due to timeout
        if (error.name === 'AbortError') {
          this.log('TIMEOUT', { id: requestId, duration: `${this.timeout}ms` });
          
          if (window.EventBus) {
            window.EventBus.trackResponse(requestId, {
              error: 'Request timed out',
              duration: this.timeout
            }, true);
          }
          
          throw new Error(`Request timed out after ${this.timeout}ms`);
        }
        
        this.log('EXCEPTION', { 
          id: requestId,
          message: error.message,
          stack: error.stack
        });
        
        // Track error with EventBus
        if (window.EventBus) {
          window.EventBus.trackResponse(requestId, {
            error: error.message
          }, true);
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        throw error;
      }
    }
    
    /**
     * Get current session info
     * @returns {Promise<object>} - Session data
     */
    async getSession() {
      const requestId = `session-${this.requestIdCounter++}`;
      
      try {
        this.log('REQUEST', { id: requestId, endpoint: '/session' });
        
        // Track this request with EventBus if available
        if (window.EventBus) {
          window.EventBus.trackMessage(requestId, {
            type: 'session'
          });
        }
        
        // Start the request
        this.pendingRequests.set(requestId, { 
          type: 'session',
          startTime: Date.now()
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.baseUrl}/session`, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Request-ID': requestId
          },
          signal: controller.signal,
          credentials: 'same-origin'
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Calculate request duration
        const duration = Date.now() - this.pendingRequests.get(requestId).startTime;
        
        if (!response.ok) {
          const errorData = await response.json();
          
          this.log('ERROR', { 
            id: requestId,
            status: response.status, 
            data: errorData,
            duration: `${duration}ms`
          });
          
          // Track error response with EventBus
          if (window.EventBus) {
            window.EventBus.trackResponse(requestId, {
              error: errorData.message || 'Unknown error',
              status: response.status,
              duration
            }, true);
          }
          
          throw new Error(errorData.message || 'Failed to get session');
        }
        
        const data = await response.json();
        
        this.log('RESPONSE', {
          id: requestId,
          status: response.status,
          duration: `${duration}ms`,
          data
        });
        
        // Track successful response with EventBus
        if (window.EventBus) {
          window.EventBus.trackResponse(requestId, {
            sessionId: data.id,
            roastLevel: data.roastLevel,
            duration,
            status: response.status
          });
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        return data;
      } catch (error) {
        // Handle aborted requests due to timeout
        if (error.name === 'AbortError') {
          this.log('TIMEOUT', { id: requestId, duration: `${this.timeout}ms` });
          
          if (window.EventBus) {
            window.EventBus.trackResponse(requestId, {
              error: 'Request timed out',
              duration: this.timeout
            }, true);
          }
          
          throw new Error(`Request timed out after ${this.timeout}ms`);
        }
        
        this.log('EXCEPTION', { 
          id: requestId,
          message: error.message,
          stack: error.stack
        });
        
        // Track error with EventBus
        if (window.EventBus) {
          window.EventBus.trackResponse(requestId, {
            error: error.message
          }, true);
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        throw error;
      }
    }
    
    /**
     * Update roast level
     * @param {number} level - New roast level (1-5)
     * @returns {Promise<object>} - Response data
     */
    async updateRoastLevel(level) {
      const requestId = `level-${this.requestIdCounter++}`;
      const requestData = { level };
      
      try {
        this.log('REQUEST', { id: requestId, endpoint: '/level', level });
        
        // Track this request with EventBus if available
        if (window.EventBus) {
          window.EventBus.trackMessage(requestId, {
            type: 'level',
            level
          });
        }
        
        // Start the request
        this.pendingRequests.set(requestId, { 
          type: 'level',
          startTime: Date.now(),
          data: requestData
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.baseUrl}/level`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Request-ID': requestId
          },
          signal: controller.signal,
          body: JSON.stringify(requestData),
          credentials: 'same-origin'
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Calculate request duration
        const duration = Date.now() - this.pendingRequests.get(requestId).startTime;
        
        if (!response.ok) {
          const errorData = await response.json();
          
          this.log('ERROR', { 
            id: requestId,
            status: response.status, 
            data: errorData,
            duration: `${duration}ms`
          });
          
          // Track error response with EventBus
          if (window.EventBus) {
            window.EventBus.trackResponse(requestId, {
              error: errorData.message || 'Unknown error',
              status: response.status,
              duration
            }, true);
          }
          
          throw new Error(errorData.message || 'Failed to update level');
        }
        
        const data = await response.json();
        
        this.log('RESPONSE', {
          id: requestId,
          status: response.status,
          duration: `${duration}ms`,
          data
        });
        
        // Track successful response with EventBus
        if (window.EventBus) {
          window.EventBus.trackResponse(requestId, {
            level: data.roastLevel,
            duration,
            status: response.status
          });
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        return data;
      } catch (error) {
        // Handle aborted requests due to timeout
        if (error.name === 'AbortError') {
          this.log('TIMEOUT', { id: requestId, duration: `${this.timeout}ms` });
          
          if (window.EventBus) {
            window.EventBus.trackResponse(requestId, {
              error: 'Request timed out',
              duration: this.timeout
            }, true);
          }
          
          throw new Error(`Request timed out after ${this.timeout}ms`);
        }
        
        this.log('EXCEPTION', { 
          id: requestId,
          message: error.message
        });
        
        // Track error with EventBus
        if (window.EventBus) {
          window.EventBus.trackResponse(requestId, {
            error: error.message
          }, true);
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        throw error;
      }
    }
    
    /**
     * Get a list of pending requests
     * @returns {Array} - Array of pending request objects
     */
    getPendingRequests() {
      const pendingArray = [];
      
      for (const [id, request] of this.pendingRequests.entries()) {
        pendingArray.push({
          id,
          type: request.type,
          startTime: request.startTime,
          duration: Date.now() - request.startTime,
          data: request.data
        });
      }
      
      return pendingArray;
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
      this.debug = enabled;
      console.log(`ApiService: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Test if the API is reachable and functioning
     * @returns {Promise<object>} - Test result
     */
    async testConnection() {
      const requestId = `test-${this.requestIdCounter++}`;
      
      try {
        this.log('TEST', { id: requestId, message: 'Testing API connection' });
        
        // Make a simple direct test rather than using getSession
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(`${this.baseUrl}/session`, {
            method: 'GET',
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'X-Request-ID': requestId
            },
            signal: controller.signal,
            credentials: 'same-origin'
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            
            if (response.status === 404) {
              return {
                success: false,
                error: 'api_not_found',
                message: 'API endpoints are not available (404 Not Found)',
                details: 'The app is running in local/demo mode. API requests will be simulated with local responses.'
              };
            }
            
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              return {
                success: false,
                error: 'api_error',
                status: response.status,
                message: errorData.message || `API error: ${response.status}`
              };
            }
            
            return {
              success: false,
              error: 'server_error',
              status: response.status,
              message: `Server returned error: ${response.status}`
            };
          }
          
          // Successfully connected
          return {
            success: true,
            status: response.status,
            message: 'API connection successful'
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            return {
              success: false,
              error: 'timeout',
              message: 'API connection timed out'
            };
          }
          
          throw fetchError;
        }
      } catch (error) {
        this.log('TEST_FAILED', { 
          id: requestId,
          message: error.message
        });
        
        return {
          success: false,
          error: error.name || 'unknown',
          message: `API connection failed: ${error.message}`,
          details: 'The app will run in local/demo mode. API requests will be simulated.'
        };
      }
    }
  }
  
  // Create a single instance of ApiService
  const apiService = new ApiService();
  
  // Expose the API service globally
  if (typeof window !== 'undefined') {
    window.apiService = apiService;
  }
  
  // For module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
  }
})(); 