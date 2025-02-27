/**
 * api-debug.js - API Debugging Tools for DEGEN ROAST 3000
 */

const ApiDebugger = {
  /**
   * Test message API with sample message
   * @returns {Promise} - API response
   */
  testMessageAPI: async function() {
    try {
      console.log('Testing message API...');
      const data = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          message: 'This is a test message from API debugger',
          level: 1
        })
      });
      
      if (!data.ok) {
        const errorText = await data.text();
        console.error('API Error:', data.status, errorText);
        return { 
          success: false, 
          status: data.status, 
          error: errorText 
        };
      }
      
      const response = await data.json();
      console.log('API Response:', response);
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      console.error('API Exception:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
  
  /**
   * Test session API
   * @returns {Promise} - API response
   */
  testSessionAPI: async function() {
    try {
      console.log('Testing session API...');
      const data = await fetch('/api/session', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!data.ok) {
        const errorText = await data.text();
        console.error('API Error:', data.status, errorText);
        return { 
          success: false, 
          status: data.status, 
          error: errorText 
        };
      }
      
      const response = await data.json();
      console.log('Session Response:', response);
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      console.error('API Exception:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
  
  /**
   * Test level API
   * @param {number} [level=2] - Roast level to set
   * @returns {Promise} - API response
   */
  testLevelAPI: async function(level = 2) {
    try {
      console.log(`Testing level API with level ${level}...`);
      const data = await fetch('/api/level', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ level })
      });
      
      if (!data.ok) {
        const errorText = await data.text();
        console.error('API Error:', data.status, errorText);
        return { 
          success: false, 
          status: data.status, 
          error: errorText 
        };
      }
      
      const response = await data.json();
      console.log('Level Response:', response);
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      console.error('API Exception:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
  
  /**
   * Run all API tests
   * @returns {Promise} - Test results
   */
  runAllTests: async function() {
    console.group('🧪 API Debugging Tests');
    
    console.log('1. Testing Session API...');
    const sessionResult = await this.testSessionAPI();
    
    console.log('2. Testing Level API...');
    const levelResult = await this.testLevelAPI(3);
    
    console.log('3. Testing Message API...');
    const messageResult = await this.testMessageAPI();
    
    console.log('----------------------------');
    console.log(`📊 Test Results:`);
    console.log(`Session API: ${sessionResult.success ? '✅' : '❌'}`);
    console.log(`Level API: ${levelResult.success ? '✅' : '❌'}`);
    console.log(`Message API: ${messageResult.success ? '✅' : '❌'}`);
    console.log(`Overall: ${(sessionResult.success && levelResult.success && messageResult.success) ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.groupEnd();
    
    return {
      session: sessionResult,
      level: levelResult,
      message: messageResult,
      overallSuccess: sessionResult.success && levelResult.success && messageResult.success
    };
  },
  
  /**
   * Inspect network traffic for API calls
   */
  inspectNetworkTraffic: function() {
    if (!window.apiMonitor) {
      console.warn('API monitor not available. Make sure debug-helper.js is loaded.');
      return;
    }
    
    // Show API monitor
    window.apiMonitor.toggle();
    
    console.log('API Monitor activated. You can also press Alt+D to toggle it.');
  },
  
  /**
   * Get EventBus API events
   * @param {number} [count=10] - Number of events to return
   * @returns {Array} - API events
   */
  getApiEvents: function(count = 10) {
    if (!window.EventBus || !window.EventBus.getApiEvents) {
      console.warn('EventBus not available or missing getApiEvents method.');
      return [];
    }
    
    return window.EventBus.getApiEvents(count);
  },
  
  /**
   * Show instructions
   */
  help: function() {
    console.group('🔧 API Debugger Help');
    console.log('Available commands:');
    console.log('- ApiDebugger.testSessionAPI() - Test the session API');
    console.log('- ApiDebugger.testLevelAPI(level) - Test the level API (default level: 2)');
    console.log('- ApiDebugger.testMessageAPI() - Test the message API with a sample message');
    console.log('- ApiDebugger.runAllTests() - Run all API tests');
    console.log('- ApiDebugger.inspectNetworkTraffic() - Toggle API monitor');
    console.log('- ApiDebugger.getApiEvents(count) - Get recent API events from EventBus');
    console.log('- ApiDebugger.help() - Show this help message');
    console.groupEnd();
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.ApiDebugger = ApiDebugger;
  console.log('🔧 API Debugger loaded. Type ApiDebugger.help() for instructions.');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiDebugger;
} 