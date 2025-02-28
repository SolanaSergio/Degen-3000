/**
 * mobile-enhancements.js
 * Mobile-specific JavaScript enhancements for DEGEN ROAST 3000
 */

// IMMEDIATE EXECUTION ZONE - Runs before anything else
(function() {
  // Quick mobile detection
  const isMobile = window.innerWidth <= 1024 || 
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                  ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
  
  if (isMobile) {
    console.log("🚨 IMMEDIATE MOBILE DETECTION - Adding basic mobile classes");
    // Add classes ASAP
    document.documentElement.classList.add('mobile-view');
    if (document.body) document.body.classList.add('mobile-view');
    
    // Add viewport meta immediately if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
    
    // Add basic mobile stylesheet ASAP
    const style = document.createElement('style');
    style.textContent = `
      /* Immediate mobile styles */
      .mobile-view .content-grid, body.mobile-view .content-grid {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
      }
      .mobile-view .chat-section, body.mobile-view .chat-section {
        width: 100% !important;
        order: 1 !important;
      }
      .mobile-view .left-sidebar-wrapper, body.mobile-view .left-sidebar-wrapper {
        width: 100% !important;
        order: 2 !important;
      }
    `;
    document.head.appendChild(style);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  console.log("📱 Mobile enhancements script loaded - starting device detection");
  
  // ENHANCED DEVICE DETECTION - More robust for browser emulators
  // Get accurate dimensions regardless of zoom level or dev tools
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Enhanced detection rules - Check multiple factors
  const isMobileByWidth = viewportWidth <= 1024;
  const isMobileByUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isMobileByTouchPoints = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
  const isMobileByScreenWidth = screenWidth <= 1024;
  
  // Combined detection - If ANY of these are true, consider it mobile
  const isMobile = isMobileByWidth || isMobileByUserAgent || isMobileByTouchPoints || isMobileByScreenWidth;
  
  const isSmallMobile = viewportWidth <= 480;
  const isTablet = viewportWidth >= 768 && viewportWidth <= 1024;
  const isDesktop = viewportWidth > 1024 && !isMobileByUserAgent && !isMobileByTouchPoints;
  
  // Log detection details for debugging
  console.log("📊 Enhanced device detection details:", {
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,
    isMobileByWidth,
    isMobileByUserAgent,
    isMobileByTouchPoints,
    isMobileByScreenWidth,
    isMobile,
    isSmallMobile,
    isTablet,
    isDesktop,
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints || 0
  });
  
  // ALWAYS ensure proper viewport meta tag - force it even if it exists
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  } else {
    // Update existing viewport meta tag to ensure correct settings
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
  
  // Skip mobile enhancements entirely on desktop
  if (isDesktop && !isMobile) {
    console.log('🖥️ Desktop detected, skipping mobile enhancements');
    
    // Add desktop classes
    document.documentElement.classList.add('desktop-view');
    document.body.classList.add('desktop-view');
    document.documentElement.setAttribute('data-device', 'desktop');
    document.body.setAttribute('data-device', 'desktop');
    
    // Remove any mobile classes that might have been erroneously applied
    document.documentElement.classList.remove('mobile-view', 'tablet-view', 'ipad-view', 'ipad-mini-view');
    document.body.classList.remove('mobile-view', 'tablet-view', 'ipad-view', 'ipad-mini-view');
    
    // Return early - don't apply any mobile enhancements
    return;
  }
  
  // If we get here, we're on mobile - log this
  console.log('📱 Mobile device detected - applying mobile enhancements');
  
  // Force mobile classes immediately
  document.documentElement.classList.add('mobile-view');
  document.body.classList.add('mobile-view');
  
  // Add debugging indicator for troubleshooting
  const mobileIndicator = document.createElement('div');
  mobileIndicator.className = 'mobile-debug-indicator';
  mobileIndicator.style.position = 'fixed';
  mobileIndicator.style.bottom = '5px';
  mobileIndicator.style.right = '5px';
  mobileIndicator.style.background = 'rgba(0,0,0,0.5)';
  mobileIndicator.style.color = 'white';
  mobileIndicator.style.padding = '5px';
  mobileIndicator.style.fontSize = '10px';
  mobileIndicator.style.zIndex = '9999';
  mobileIndicator.style.borderRadius = '3px';
  mobileIndicator.textContent = `Mobile View (${viewportWidth}x${viewportHeight})`;
  document.body.appendChild(mobileIndicator);
  
  // ============================================================
  // RESPONSIVE ARCHITECTURE - DEVICE DETECTION
  // ============================================================
  /**
   * Our responsive design architecture follows these principles:
   * 1. CSS defines the base styles and layout for desktop
   * 2. CSS media queries handle most responsive behavior
   * 3. JavaScript adds functional behavior and device-specific classes
   * 4. We try to avoid direct style application in JS whenever possible
   */

  // Standard responsive breakpoints
  const BREAKPOINTS = {
    smallMobile: 576,
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };
  
  // Enhanced iPad/tablet detection - more robust checking for various iPad models
  // iPad Air dimensions can be 820x1180, 768x1024, or various other sizes
  const iPadDimensions = [
    {width: 820, height: 1180}, // iPad Air in DevTools
    {width: 768, height: 1024}, // Common iPad dimension (iPad Mini)
    {width: 834, height: 1112}, // iPad Air (3rd gen, 10.5-inch)
    {width: 810, height: 1080}, // Some iPad Air configurations
    {width: 834, height: 1194}  // iPad Air (4th/5th gen, 10.9-inch)
  ];
  
  // Specific flag for iPad Mini
  const isIPadMini = viewportWidth === 768 && viewportHeight === 1024;
  
  const isIPadByDimensions = iPadDimensions.some(dim => 
    (Math.abs(viewportWidth - dim.width) < 10 && Math.abs(viewportHeight - dim.height) < 10) || 
    (Math.abs(viewportHeight - dim.width) < 10 && Math.abs(viewportWidth - dim.height) < 10) // Account for orientation
  );
  
  const isDevToolsIPad = isIPadByDimensions;
  
  // Check user agent and dimensions
  const isIPad = isIPadByDimensions || 
                (navigator.userAgent.match(/iPad/i)) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                (navigator.userAgent.match(/Mac/i) && 'ontouchend' in document && viewportWidth >= 768 && viewportWidth <= 1024);
  
  // ============================================================
  // ADD DEVICE CLASSES - This enables CSS targeting
  // ============================================================
  // Add feature classes to both html and body for flexibility in CSS targeting
  function addDeviceClasses() {
    const html = document.documentElement;
    const body = document.body;
    
    // Clear any existing classes to prevent conflicts
    const classesToRemove = ['mobile-view', 'small-mobile-view', 'tablet-view', 
                           'ipad-view', 'ipad-mini-view', 'desktop-view'];
    
    classesToRemove.forEach(cls => {
      html.classList.remove(cls);
      body.classList.remove(cls);
    });
    
    // Add appropriate device classes based on detection
    if (isMobile) {
      html.classList.add('mobile-view');
      body.classList.add('mobile-view');
      
      if (isSmallMobile) {
        html.classList.add('small-mobile-view');
        body.classList.add('small-mobile-view');
      }
      
      if (isTablet) {
        html.classList.add('tablet-view');
        body.classList.add('tablet-view');
      }
      
      if (isIPad) {
        html.classList.add('ipad-view');
        body.classList.add('ipad-view');
        
        // Add data attributes for CSS targeting
        html.setAttribute('data-device', 'ipad');
        body.setAttribute('data-device', 'ipad');
      }
      
      if (isIPadMini) {
        html.classList.add('ipad-mini-view');
        body.classList.add('ipad-mini-view');
        
        // Add data attributes for CSS targeting
        html.setAttribute('data-device', 'ipad-mini');
        body.setAttribute('data-device', 'ipad-mini');
      }
    } else {
      // Explicitly add desktop classes when not mobile
      html.classList.add('desktop-view');
      body.classList.add('desktop-view');
      
      // Set data attribute for desktop
      html.setAttribute('data-device', 'desktop');
      body.setAttribute('data-device', 'desktop');
      
      // Remove any inline styles that might be affecting the desktop layout
      const container = document.querySelector('.container.enhanced-ui');
      const contentGrid = document.querySelector('.content-grid');
      const chatSection = document.querySelector('.chat-section');
      const leftSidebar = document.querySelector('.left-sidebar-wrapper');
      const rightSidebar = document.querySelector('.right-sidebar-wrapper');
      
      // Reset any styles that might have been applied dynamically
      if (container) container.removeAttribute('style');
      if (contentGrid) contentGrid.removeAttribute('style');
      if (chatSection) chatSection.removeAttribute('style');
      if (leftSidebar) leftSidebar.removeAttribute('style');
      if (rightSidebar) rightSidebar.removeAttribute('style');
      
      // Ensure fallback content is hidden
      const fallbackContent = document.getElementById('fallback-content');
      if (fallbackContent) fallbackContent.style.display = 'none';
    }
    
    // Add orientation class
    const orientation = viewportHeight > viewportWidth ? 'portrait' : 'landscape';
    html.classList.add(`orientation-${orientation}`);
    body.classList.add(`orientation-${orientation}`);
  }
  
  // Initialize device classes
  addDeviceClasses();

  console.log("Enhanced Device detection:", { 
    width: viewportWidth, 
    height: viewportHeight,
    isIPadMini: isIPadMini,
    isIPadByDimensions: isIPadByDimensions,
    isDevToolsIPad: isDevToolsIPad,
    isIPad: isIPad, 
    isTablet: isTablet,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints
  });
  
  // Re-check device on resize or orientation change
  window.addEventListener('resize', function() {
    // Update classes based on new dimensions
    addDeviceClasses();
    
    // Let CSS handle most of the layout changes via media queries
    // Only apply special fixes when absolutely necessary
  });
  
  // ============================================================
  // RESPONSIVE ADAPTATION FUNCTIONS - Below we organize by feature
  // ============================================================
  
  // 1. Tablet-specific Layout Enhancements
  if (isTablet || isIPad) {
    setupTabletSpecificLayout();
  }
  
  // 2. Mobile Input and Interaction Improvements
  if (isMobile) {
    setupMobileInputHandling();
    improveScrolling();
    fixLayoutIssues();
    setupOrientationHandling();
    setupBackButtonHandling();
    setupDoubleTapDetection();
    hideDebugElements();
    setupKeyboardDetection();
  }
  
  // 3. Fullscreen Mode and Exit Button
  if (isMobile) {
    setupFullscreenMode();
  }
  
  // 4. Enhanced Control Panel
  if (isMobile) {
    setupMobileControlPanel();
  }
  
  // 5. Back to Chat Button
  if (isMobile) {
    createBackToChatButton();
  }
  
  // 6. Scroll and Chat Visibility
  if (isMobile) {
    checkChatScroll();
  }
  
  // 7. DevTools Detection
  if (viewportHeight < window.outerHeight * 0.75) {
    document.body.classList.add('devtools-open');
  }
});

// Add after DOMContentLoaded event handler and before Load event handler
function createBackToChatButton() {
  // Create the "back to chat" button if it doesn't exist yet
  if (!document.querySelector('.back-to-chat-button')) {
    const backButton = document.createElement('button');
    backButton.className = 'back-to-chat-button';
    backButton.innerHTML = '💬';
    backButton.setAttribute('aria-label', 'Back to chat');
    backButton.setAttribute('title', 'Return to chat');
    document.body.appendChild(backButton);
    
    // Scroll back to chat when clicked
    backButton.addEventListener('click', function() {
      const chatSection = document.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    // Show/hide button based on chat visibility
    const checkChatVisibility = function() {
      const chatSection = document.querySelector('.chat-section');
      if (!chatSection) return;
      
      const rect = chatSection.getBoundingClientRect();
      // Show button only when chat is out of viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        backButton.classList.add('visible');
        document.body.classList.add('chat-section-out-of-view');
      } else {
        backButton.classList.remove('visible');
        document.body.classList.remove('chat-section-out-of-view');
      }
    };
    
    // Check visibility on scroll
    window.addEventListener('scroll', checkChatVisibility);
    // Initial check
    setTimeout(checkChatVisibility, 500);
  }
}

// Create and inject mobile-specific CSS that will override desktop styles
function injectMobileCSS() {
  // Don't add if already exists
  if (document.querySelector('#mobile-override-css')) return;
  
  console.log("💉 Injecting mobile-specific CSS overrides");
  
  const css = `
    /* Mobile-specific CSS that will override desktop styles */
    @media (max-width: 1024px) {
      .mobile-view .content-grid,
      .tablet-view .content-grid,
      body.mobile-view .content-grid,
      html.mobile-view .content-grid {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
      }
      
      .mobile-view .container,
      body.mobile-view .container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 auto !important;
      }
      
      .mobile-view .chat-section,
      body.mobile-view .chat-section {
        width: 100% !important;
        max-width: 100% !important;
        order: 1 !important;
      }
      
      .mobile-view .left-sidebar-wrapper,
      body.mobile-view .left-sidebar-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        order: 2 !important;
      }
      
      .mobile-view .right-sidebar-wrapper,
      body.mobile-view .right-sidebar-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        order: 3 !important;
      }
      
      /* Hide elements that shouldn't appear on mobile */
      .mobile-view .desktop-only,
      body.mobile-view .desktop-only {
        display: none !important;
      }
      
      /* Mobile debug indicator */
      .mobile-debug-indicator {
        display: block !important;
        visibility: visible !important;
        z-index: 9999 !important;
      }
      
      /* Ensure back-to-chat button is visible */
      .back-to-chat-button.visible {
        display: flex !important;
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 9999 !important;
        background: rgba(0,0,0,0.7) !important;
        color: white !important;
        border-radius: 50% !important;
        width: 50px !important;
        height: 50px !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 24px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      }
    }
    
    /* Tablet-specific overrides */
    @media (min-width: 768px) and (max-width: 1024px) {
      .tablet-view .content-grid,
      body.tablet-view .content-grid {
        display: flex !important;
        flex-direction: column !important;
      }
      
      /* Landscape orientation for tablets */
      @media (orientation: landscape) {
        .tablet-view .content-grid,
        body.tablet-view .content-grid,
        .tablet-view[data-tablet-orientation="landscape"] .content-grid,
        body.tablet-view[data-tablet-orientation="landscape"] .content-grid {
          display: grid !important;
          grid-template-columns: 350px 1fr !important;
          padding: 16px !important;
          gap: 20px !important;
        }
        
        .tablet-view .chat-section,
        body.tablet-view .chat-section {
          order: 2 !important;
        }
        
        .tablet-view .left-sidebar-wrapper,
        body.tablet-view .left-sidebar-wrapper {
          order: 1 !important;
        }
      }
    }
  `;
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'mobile-override-css';
  style.textContent = css;
  
  // Add to document head
  document.head.appendChild(style);
  
  // Add enhanced UI styles for better visual appearance
  enhanceMobileUIAndLayout();
}

// Function to enhance mobile UI with better visual styling and space usage
function enhanceMobileUIAndLayout() {
  // Don't add if already enhanced
  if (document.querySelector('#enhanced-mobile-ui-css')) return;
  
  console.log("✨ Enhancing mobile UI for better aesthetics and space usage");
  
  // Create enhanced mobile UI stylesheet
  const css = `
    /* Enhanced Mobile UI with better spacing and visuals */
    
    /* General improvements */
    body.mobile-view {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    }
    
    /* Improve container spacing */
    .mobile-view .container {
      padding: 10px !important;
    }
    
    /* Chat section improvements */
    .mobile-view .chat-section {
      border-radius: 12px !important;
      background: rgba(30, 30, 50, 0.8) !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
      margin-bottom: 10px !important;
      overflow: hidden !important;
    }
    
    /* Messages container improvements */
    .mobile-view .messages-container {
      padding: 12px !important;
    }
    
    /* Message styling */
    .mobile-view .user-message,
    .mobile-view .bot-message {
      border-radius: 18px !important;
      padding: 12px 15px !important;
      margin-bottom: 10px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      max-width: 85% !important;
      position: relative !important;
      overflow-wrap: break-word !important;
    }
    
    .mobile-view .user-message {
      background: linear-gradient(135deg, #2c5364, #203a43) !important;
      margin-left: auto !important;
      border-bottom-right-radius: 5px !important;
    }
    
    .mobile-view .bot-message {
      background: linear-gradient(135deg, #5c2774, #410d62) !important;
      margin-right: auto !important;
      border-bottom-left-radius: 5px !important;
    }
    
    /* Improve chat input area */
    .mobile-view .chat-input-container {
      padding: 10px !important;
      background: rgba(25, 25, 40, 0.9) !important;
      border-top: 1px solid rgba(100, 100, 140, 0.3) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    
    .mobile-view .chat-input,
    .mobile-view textarea.chat-input,
    .mobile-view input.chat-input {
      border-radius: 18px !important;
      padding: 12px 16px !important;
      background: rgba(40, 40, 60, 0.6) !important;
      border: 1px solid rgba(100, 100, 140, 0.3) !important;
      flex-grow: 1 !important;
      margin: 0 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      font-size: 16px !important; /* Prevents zoom on iOS */
    }
    
    .mobile-view .send-button {
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important; /* Mobile touch target */
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: linear-gradient(135deg, #ff2e63, #ff0844) !important;
      box-shadow: 0 2px 8px rgba(255, 50, 100, 0.4) !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    /* Control panel improvements */
    .mobile-view .control-panel-component {
      border-radius: 12px !important;
      background: rgba(30, 30, 50, 0.8) !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
      padding: 0 !important;
      overflow: hidden !important;
      margin-bottom: 20px !important;
    }
    
    /* Control panel toggle styling */
    .mobile-view .control-panel-toggle {
      padding: 12px 15px !important;
      background: rgba(40, 40, 70, 0.9) !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      font-weight: bold !important;
      border-bottom: 1px solid rgba(100, 100, 140, 0.3) !important;
    }
    
    /* Collapsed control panel */
    .mobile-view .control-panel-component.collapsed .control-panel-section,
    .mobile-view .control-panel-component.collapsed .theme-section,
    .mobile-view .control-panel-component.collapsed .level-section,
    .mobile-view .control-panel-component.collapsed .mode-section {
      display: none !important;
    }
    
    /* Theme section improvements */
    .mobile-view .theme-section {
      padding: 12px !important;
    }
    
    .mobile-view .theme-options {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 8px !important;
      margin-top: 10px !important;
    }
    
    .mobile-view .theme-button {
      aspect-ratio: 1/1 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 10px !important;
      font-size: 0.9em !important;
      padding: 5px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      border: 2px solid transparent !important;
    }
    
    .mobile-view .theme-button.active {
      border-color: #ff2e63 !important;
      box-shadow: 0 0 15px rgba(255, 46, 99, 0.4) !important;
    }
    
    /* Level controls improvements */
    .mobile-view .level-section {
      padding: 12px !important;
    }
    
    .mobile-view .level-controls {
      display: grid !important;
      grid-template-columns: repeat(5, 1fr) !important;
      gap: 5px !important;
      margin-top: 10px !important;
    }
    
    .mobile-view .level-button {
      padding: 10px 5px !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15) !important;
      font-size: 0.9em !important;
      border: 2px solid transparent !important;
    }
    
    .mobile-view .level-button.active {
      border-color: #ff2e63 !important;
      box-shadow: 0 0 10px rgba(255, 46, 99, 0.4) !important;
    }
    
    /* Section headers */
    .mobile-view .control-panel-section-title,
    .mobile-view .section-title {
      padding: 10px 5px !important;
      display: flex !important;
      justify-content: space-between !important;
      font-weight: bold !important;
    }
    
    /* Mode section improvements */
    .mobile-view .mode-section {
      padding: 12px !important;
    }
    
    /* Stonks ticker improvements */
    .mobile-view #stonks-ticker {
      border-radius: 8px !important;
      overflow: hidden !important;
      background: rgba(25, 25, 40, 0.8) !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
      margin: 8px 0 !important;
    }
    
    /* Header improvements */
    .mobile-view #header-container {
      padding: 10px !important;
      margin-bottom: 10px !important;
      border-radius: 12px !important;
      background: rgba(25, 25, 40, 0.8) !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
    }
    
    /* Back to chat button improvements */
    .mobile-view .back-to-chat-button.visible {
      background: linear-gradient(145deg, #ff2e63, #ff0844) !important;
      box-shadow: 0 3px 15px rgba(255, 46, 99, 0.5) !important;
      border: none !important;
      animation: pulseBeat 2s infinite !important;
    }
    
    @keyframes pulseBeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    /* Smooth transitions */
    .mobile-view * {
      transition: all 0.2s ease-out !important;
    }
    
    /* Add quick action buttons floating bar */
    .mobile-view .quick-actions-bar {
      position: fixed !important;
      bottom: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      display: flex !important;
      gap: 10px !important;
      background: rgba(30, 30, 50, 0.8) !important;
      backdrop-filter: blur(5px) !important;
      -webkit-backdrop-filter: blur(5px) !important;
      padding: 8px 12px !important;
      border-radius: 25px !important;
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.3) !important;
      z-index: 9998 !important;
    }
    
    .mobile-view .quick-action-button {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: rgba(60, 60, 80, 0.8) !important;
      color: white !important;
      font-size: 18px !important;
      border: none !important;
    }
    
    /* Visible scrollbar styling */
    .mobile-view ::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }
    
    .mobile-view ::-webkit-scrollbar-track {
      background: rgba(30, 30, 50, 0.3) !important;
      border-radius: 10px !important;
    }
    
    .mobile-view ::-webkit-scrollbar-thumb {
      background: rgba(255, 46, 99, 0.5) !important;
      border-radius: 10px !important;
    }
    
    /* Loading indicator improvement */
    .mobile-view .loading-indicator {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 10px !important;
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .mobile-view .user-message,
    .mobile-view .bot-message {
      animation: fadeIn 0.3s ease-out !important;
    }
  `;
  
  // Create and add stylesheet
  const style = document.createElement('style');
  style.id = 'enhanced-mobile-ui-css';
  style.textContent = css;
  document.head.appendChild(style);
  
  // Add quick action buttons to enhance mobile experience
  addQuickActionButtons();
  
  // Add interactive animations and features
  enhanceInteractiveElements();
}

// Add quick action buttons bar for easy access to common functions
function addQuickActionButtons() {
  // Wait for DOM to fully load
  setTimeout(() => {
    // Only add if doesn't exist already
    if (!document.querySelector('.quick-actions-bar')) {
      console.log("📱 Adding quick action buttons for mobile");
      
      // Create quick actions bar
      const quickActionsBar = document.createElement('div');
      quickActionsBar.className = 'quick-actions-bar';
      
      // Clear chat button
      const clearButton = document.createElement('button');
      clearButton.className = 'quick-action-button clear-chat';
      clearButton.innerHTML = '🗑️';
      clearButton.setAttribute('aria-label', 'Clear conversation');
      clearButton.setAttribute('title', 'Clear conversation');
      
      // Toggle theme button
      const themeButton = document.createElement('button');
      themeButton.className = 'quick-action-button toggle-theme';
      themeButton.innerHTML = '🌙';
      themeButton.setAttribute('aria-label', 'Toggle theme');
      themeButton.setAttribute('title', 'Toggle theme');
      
      // Scroll to top button
      const scrollTopButton = document.createElement('button');
      scrollTopButton.className = 'quick-action-button scroll-top';
      scrollTopButton.innerHTML = '⬆️';
      scrollTopButton.setAttribute('aria-label', 'Scroll to top');
      scrollTopButton.setAttribute('title', 'Scroll to top');
      
      // Add buttons to bar
      quickActionsBar.appendChild(clearButton);
      quickActionsBar.appendChild(themeButton);
      quickActionsBar.appendChild(scrollTopButton);
      
      // Add bar to document
      document.body.appendChild(quickActionsBar);
      
      // Add event listeners
      clearButton.addEventListener('click', function() {
        // Find and click existing clear button if available
        const existingClearButton = document.querySelector('.clear-chat-button, button[data-action="clear"]');
        if (existingClearButton) {
          existingClearButton.click();
        } else {
          // If no existing button, try to clear via JavaScript
          const messagesContainer = document.querySelector('.messages-container');
          if (messagesContainer) {
            // Keep first greeting message if exists
            const messages = messagesContainer.querySelectorAll('.message-bubble, .user-message, .bot-message');
            if (messages.length > 1) {
              const firstMessage = messages[0];
              while (messagesContainer.firstChild) {
                messagesContainer.removeChild(messagesContainer.firstChild);
              }
              messagesContainer.appendChild(firstMessage);
            }
          }
        }
        
        // Show confirmation
        showMobileToast('Conversation cleared');
      });
      
      themeButton.addEventListener('click', function() {
        // Try to find theme buttons and toggle between first two
        const themeButtons = document.querySelectorAll('.theme-button');
        if (themeButtons.length > 1) {
          // Find active button
          const activeButton = document.querySelector('.theme-button.active');
          const activeIndex = Array.from(themeButtons).indexOf(activeButton);
          const nextIndex = (activeIndex + 1) % themeButtons.length;
          
          // Click next button
          themeButtons[nextIndex].click();
          
          // Show confirmation
          showMobileToast(`Theme changed`);
        }
      });
      
      scrollTopButton.addEventListener('click', function() {
        // Scroll chat to top
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Scroll page to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // Initially hide the bar when chat is in view
      updateQuickActionsVisibility();
      
      // Listen for scroll to show/hide the bar
      window.addEventListener('scroll', updateQuickActionsVisibility);
    }
  }, 1500);
}

// Update quick actions bar visibility based on scroll position
function updateQuickActionsVisibility() {
  const quickActionsBar = document.querySelector('.quick-actions-bar');
  const backButton = document.querySelector('.back-to-chat-button');
  
  if (quickActionsBar) {
    // Hide when back button is visible (prevents overlap)
    if (backButton && backButton.classList.contains('visible')) {
      quickActionsBar.style.opacity = '0';
      quickActionsBar.style.pointerEvents = 'none';
    } else {
      quickActionsBar.style.opacity = '1';
      quickActionsBar.style.pointerEvents = 'auto';
    }
  }
}

// Show toast notification on mobile
function showMobileToast(message, duration = 2000) {
  // Remove existing toast if present
  const existingToast = document.querySelector('.mobile-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'mobile-toast';
  toast.textContent = message;
  
  // Style the toast
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'rgba(40, 40, 60, 0.9)';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '20px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  toast.style.zIndex = '10000';
  toast.style.textAlign = 'center';
  toast.style.fontSize = '14px';
  toast.style.animation = 'fadeIn 0.3s ease-out';
  
  // Add to document
  document.body.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 20px)';
    toast.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Enhance interactive elements for better mobile experience
function enhanceInteractiveElements() {
  // Make sure control panel toggle is improved
  setTimeout(() => {
    const controlPanelToggle = document.querySelector('.control-panel-toggle');
    if (controlPanelToggle) {
      if (!controlPanelToggle.querySelector('.toggle-text')) {
        // Improve toggle with better text
        controlPanelToggle.innerHTML = `
          <span class="toggle-text">Control Panel</span>
          <span class="toggle-icon">▼</span>
        `;
      }
    }
    
    // Improve theme buttons with color indicators
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
      // Add hover effect for touch feedback
      button.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
      });
      
      button.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
      });
    });
    
    // Improve level buttons with better indicators
    const levelButtons = document.querySelectorAll('.level-button');
    levelButtons.forEach((button, index) => {
      // Add hover effect for touch feedback
      button.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
      });
      
      button.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
      });
    });
  }, 1000);
}

// Update the load event handler to implement the new mobile-focused layout
window.addEventListener('load', function() {
  // Get current dimensions for layout calculations
  const currentViewportWidth = window.innerWidth;
  const currentViewportHeight = window.innerHeight;
  
  // Enhanced detection rules for load event
  const isMobileByWidth = currentViewportWidth <= 1024;
  const isMobileByUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isMobileByTouchPoints = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
  const isMobileByScreenWidth = window.screen.width <= 1024;
  
  // Combined detection - If ANY of these are true, consider it mobile
  const isMobileDevice = isMobileByWidth || isMobileByUserAgent || isMobileByTouchPoints || isMobileByScreenWidth;
  
  console.log("📱 Load event - Mobile detection:", isMobileDevice, "Width:", currentViewportWidth);
  
  // Make sure viewport is properly set
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  } else {
    // Force update existing viewport meta
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
  
  // FORCE MOBILE MODE for certain devices regardless of any other detection
  // This is our fallback to ensure mobile devices get mobile layout
  if (isMobileDevice || currentViewportWidth <= 1024) {
    console.log("🚨 FORCING MOBILE MODE - Width detection or user agent indicates mobile device");
    
    // Inject mobile-specific CSS
    injectMobileCSS();
    
    // Force mobile classes
    document.documentElement.classList.add('mobile-view');
    document.body.classList.add('mobile-view');
    document.documentElement.setAttribute('data-device', 'mobile');
    document.body.setAttribute('data-device', 'mobile');
    
    // Remove desktop classes
    document.documentElement.classList.remove('desktop-view');
    document.body.classList.remove('desktop-view');
    
    // Check for tablet/iPad specifically
    const isTabletDevice = currentViewportWidth >= 768 && currentViewportWidth <= 1024;
    if (isTabletDevice) {
      document.documentElement.classList.add('tablet-view');
      document.body.classList.add('tablet-view');
    }
    
    // Apply the mobile-focused layout
    applyMobileLayout(currentViewportWidth, currentViewportHeight, isTabletDevice);
  }
});

// Extract mobile layout application to a separate function for reuse
function applyMobileLayout(width, height, isTablet) {
  console.log("📱 Applying mobile layout:", width, "x", height);
  
  // Ensure mobile classes are properly applied
  document.documentElement.classList.add('mobile-view');
  document.body.classList.add('mobile-view');
  document.documentElement.classList.remove('desktop-view');
  document.body.classList.remove('desktop-view');
  
  // FORCE mobile layout with !important inline styles
  document.documentElement.style.setProperty('--is-mobile', 'true', 'important');
  document.body.style.setProperty('--is-mobile', 'true', 'important');
  
  // Set proper heights after all content has loaded
  const chatSection = document.querySelector('.chat-section');
  if (chatSection) {
    // Adjust height based on viewport and other elements
    const headerHeight = document.getElementById('header-container')?.offsetHeight || 0;
    const tickerHeight = document.getElementById('stonks-ticker')?.offsetHeight || 0;
    
    // For mobile, maximize chat height
    if (!isTablet) {
      chatSection.style.height = (height * 0.75) + 'px';
      chatSection.style.minHeight = (height * 0.7) + 'px';
      chatSection.style.maxHeight = (height * 0.8) + 'px';
    } else {
      // For tablets, use a different approach based on orientation
      if (height > width) { // portrait
        chatSection.style.height = (height * 0.65) + 'px'; 
        chatSection.style.minHeight = (height * 0.6) + 'px';
      } else { // landscape
        // In landscape, allocate more space to height
        chatSection.style.height = (height - headerHeight - tickerHeight - 40) + 'px';
      }
    }
    
    // Ensure messages container scrolls to bottom
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }
  }
  
  // Restructure the DOM for mobile layout with full-width components
  const contentGrid = document.querySelector('.content-grid');
  if (contentGrid) {
    // Make sure content grid fills the screen with !important
    contentGrid.style.setProperty('width', '100%', 'important');
    contentGrid.style.setProperty('padding', '0', 'important');
    contentGrid.style.setProperty('margin', '0 auto', 'important');
    contentGrid.style.setProperty('max-width', '100%', 'important');
    
    // Remove any existing grid/layout styles
    contentGrid.style.setProperty('display', 'block', 'important');
    contentGrid.style.setProperty('grid-template-columns', 'none', 'important');
    contentGrid.style.setProperty('grid-template-rows', 'none', 'important');
    
    // For phones (not tablets), stack everything
    if (!isTablet) {
      // Ensure chat is first, followed by control panel
      const chatSection = document.querySelector('.chat-section');
      const leftSidebar = document.querySelector('.left-sidebar-wrapper');
      const rightSidebar = document.querySelector('.right-sidebar-wrapper');
      
      if (chatSection && leftSidebar) {
        // Force flex column layout with !important
        contentGrid.style.setProperty('display', 'flex', 'important');
        contentGrid.style.setProperty('flex-direction', 'column', 'important');
        
        // Set order: chat first, then control panel, then other components
        chatSection.style.setProperty('order', '1', 'important');
        chatSection.style.setProperty('width', '100%', 'important');
        chatSection.style.setProperty('max-width', '100%', 'important');
        
        leftSidebar.style.setProperty('order', '2', 'important');
        leftSidebar.style.setProperty('width', '100%', 'important');
        leftSidebar.style.setProperty('max-width', '100%', 'important');
        
        if (rightSidebar) {
          rightSidebar.style.setProperty('order', '3', 'important');
          rightSidebar.style.setProperty('width', '100%', 'important');
          rightSidebar.style.setProperty('max-width', '100%', 'important');
        }
        
        // Add padding below chat section
        chatSection.style.setProperty('margin-bottom', '10px', 'important');
      }
    } else {
      // For iPad/tablets, we have specific layouts for portrait/landscape
      const isPortrait = height > width;
      if (isPortrait) {
        // Portrait: Stack layout (chat on top, control panel below)
        contentGrid.style.setProperty('display', 'grid', 'important');
        contentGrid.style.setProperty('grid-template-columns', '100%', 'important');
        contentGrid.style.setProperty('gap', '16px', 'important');
        contentGrid.style.setProperty('padding', '16px', 'important');
        
        const chatSection = document.querySelector('.chat-section');
        const leftSidebar = document.querySelector('.left-sidebar-wrapper');
        
        if (chatSection && leftSidebar) {
          chatSection.style.setProperty('order', '1', 'important');
          leftSidebar.style.setProperty('order', '2', 'important');
        }
      } else {
        // Landscape: Side-by-side layout
        contentGrid.style.setProperty('display', 'grid', 'important');
        contentGrid.style.setProperty('grid-template-columns', '350px 1fr', 'important');
        contentGrid.style.setProperty('gap', '20px', 'important');
        contentGrid.style.setProperty('padding', '16px', 'important');
        
        const chatSection = document.querySelector('.chat-section');
        const leftSidebar = document.querySelector('.left-sidebar-wrapper');
        
        if (chatSection && leftSidebar) {
          chatSection.style.setProperty('order', '2', 'important');
          leftSidebar.style.setProperty('order', '1', 'important');
          
          // Set fixed heights
          const availableHeight = height - document.getElementById('header-container')?.offsetHeight - 
                                  document.getElementById('stonks-ticker')?.offsetHeight - 32;
          
          chatSection.style.setProperty('height', availableHeight + 'px', 'important');
          chatSection.style.setProperty('max-height', availableHeight + 'px', 'important');
          leftSidebar.style.setProperty('height', availableHeight + 'px', 'important');
          leftSidebar.style.setProperty('overflow-y', 'auto', 'important');
        }
      }
    }
  }
  
  // Force main elements to be visible on mobile
  const mainElements = [
    '.chat-section', 
    '.control-panel-component', 
    '.left-sidebar-wrapper', 
    '.content-grid',
    '.container'
  ];
  
  mainElements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.setProperty('display', selector === '.content-grid' ? 'flex' : 'block', 'important');
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('opacity', '1', 'important');
    }
  });
  
  // Create the "back to chat" button for mobile
  createBackToChatButton();
  
  // Hide the console/debug panel in mobile view
  setTimeout(() => {
    const consolePanel = document.querySelector('.panel.console');
    if (consolePanel) {
      consolePanel.style.display = 'none';
    }
  }, 500);
  
  // Add a class when mobile layout is ready
  document.body.classList.add('mobile-ready');
  
  // Setup appropriate mobile enhancements
  setTimeout(setupMobileControlPanel, 500);
  setTimeout(checkChatScroll, 800);
  
  // Force reflow to ensure styles are applied
  void document.body.offsetHeight;
}

// Add a new function to ensure mobile layout is applied even after 
// other scripts might have modified the layout
function forceReapplyMobileLayout() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTablet = width >= 768 && width <= 1024;
  
  console.log("🔄 Force reapplying mobile layout:", width, "x", height);
  applyMobileLayout(width, height, isTablet);
}

// Ensure mobile layout is applied even after DOM changes
window.addEventListener('DOMContentLoaded', function() {
  // Initial application
  setTimeout(function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width <= 1024) {
      forceReapplyMobileLayout();
    }
  }, 100);
  
  // Secondary check after potential JS modifications
  setTimeout(function() {
    const width = window.innerWidth;
    if (width <= 1024) {
      forceReapplyMobileLayout();
    }
  }, 1000);
});

// Reapply mobile layout periodically to catch any overrides
window.addEventListener('load', function() {
  const reapplyInterval = setInterval(function() {
    const width = window.innerWidth;
    if (width <= 1024 && !document.body.classList.contains('mobile-ready')) {
      forceReapplyMobileLayout();
    }
  }, 2000); // Check every 2 seconds for first 10 seconds
  
  // Clear interval after 10 seconds
  setTimeout(function() {
    clearInterval(reapplyInterval);
  }, 10000);
});

// Apply one final time after page is fully loaded
window.addEventListener('load', function() {
  setTimeout(function() {
    const width = window.innerWidth;
    if (width <= 1024) {
      forceReapplyMobileLayout();
    }
  }, 1500);
});

// Set up enhanced orientation change handler
window.addEventListener('orientationchange', function() {
  console.log("📱 Orientation change detected!");
  
  // Wait a moment for the browser to adjust
  setTimeout(() => {
    // Get new dimensions
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newOrientation = newHeight > newWidth ? 'portrait' : 'landscape';
    
    console.log(`📱 New orientation: ${newOrientation} (${newWidth}x${newHeight})`);
    
    // Update orientation classes
    document.documentElement.classList.remove('orientation-portrait', 'orientation-landscape');
    document.body.classList.remove('orientation-portrait', 'orientation-landscape');
    document.documentElement.classList.add(`orientation-${newOrientation}`);
    document.body.classList.add(`orientation-${newOrientation}`);
    
    // Set orientation data attribute
    document.documentElement.setAttribute('data-orientation', newOrientation);
    document.body.setAttribute('data-orientation', newOrientation);
    
    // Force viewport reset (helps on iOS)
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
      // Force reflow
      document.body.style.display = 'none';
      // Trigger reflow
      void document.body.offsetHeight;
      // Restore display
      document.body.style.display = '';
      // Reset viewport with no-scale
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }
    
    // Determine if this is a tablet
    const isTabletDevice = newWidth >= 768 && newWidth <= 1024;
    
    // Force reapply mobile layout with new dimensions
    forceReapplyMobileLayout();
    
    // Scroll to top after orientation change
    window.scrollTo(0, 0);
    
    // Update mobile debug indicator if it exists
    const debugIndicator = document.querySelector('.mobile-debug-indicator');
    if (debugIndicator) {
      debugIndicator.textContent = `Mobile View (${newWidth}x${newHeight}) - ${newOrientation}`;
    }
  }, 300);
});

/**
 * Tablet-specific layout enhancements
 * Optimizes the layout for tablets (iPad, etc.)
 */
function setupTabletSpecificLayout() {
  console.log("📱 Setting up tablet-specific layout");
  
  // Get viewport dimensions
  const currentViewportWidth = window.innerWidth;
  const currentViewportHeight = window.innerHeight;
  const isLandscape = currentViewportWidth > currentViewportHeight;
  
  // Add specific class for tablet layout
  document.documentElement.classList.add('tablet-optimized');
  document.body.classList.add('tablet-optimized');
  
  // Set orientation attribute
  const orientation = isLandscape ? 'landscape' : 'portrait';
  document.documentElement.setAttribute('data-tablet-orientation', orientation);
  document.body.setAttribute('data-tablet-orientation', orientation);
  
  // Layout adjustments for tablets
  const contentGrid = document.querySelector('.content-grid');
  const chatSection = document.querySelector('.chat-section');
  const leftSidebar = document.querySelector('.left-sidebar-wrapper');
  
  if (contentGrid && chatSection && leftSidebar) {
    // Different layouts based on orientation
    if (isLandscape) {
      // Landscape: Side-by-side layout
      contentGrid.style.display = 'grid';
      contentGrid.style.gridTemplateColumns = '350px 1fr';
      contentGrid.style.gap = '20px';
      
      // Adjust element order
      chatSection.style.order = '2';
      leftSidebar.style.order = '1';
      
      // Set appropriate heights
      const headerHeight = document.getElementById('header-container')?.offsetHeight || 0;
      const tickerHeight = document.getElementById('stonks-ticker')?.offsetHeight || 0;
      const availableHeight = currentViewportHeight - headerHeight - tickerHeight - 32;
      
      leftSidebar.style.height = availableHeight + 'px';
      leftSidebar.style.overflowY = 'auto';
      chatSection.style.height = availableHeight + 'px';
    } else {
      // Portrait: Stacked layout with different proportions
      contentGrid.style.display = 'grid';
      contentGrid.style.gridTemplateColumns = '100%';
      contentGrid.style.gap = '16px';
      
      // Adjust element order for portrait
      chatSection.style.order = '1';
      leftSidebar.style.order = '2';
      
      // Set appropriate heights for portrait
      chatSection.style.height = (currentViewportHeight * 0.6) + 'px';
    }
  }
  
  // Optimize button sizes for touch on tablets
  const buttons = document.querySelectorAll('button, .control-button');
  buttons.forEach(button => {
    if (!button.classList.contains('tablet-optimized')) {
      button.classList.add('tablet-optimized');
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
    }
  });
  
  // Adjust font sizes for better readability on tablets
  document.body.style.fontSize = '16px';
  
  // Add a class when tablet layout is ready
  document.body.classList.add('tablet-layout-ready');
}

// Setup enhanced control panel for mobile devices
function setupMobileControlPanel() {
  const controlPanel = document.querySelector('.control-panel-component');
  if (!controlPanel) return;
  
  console.log("📱 Setting up enhanced mobile control panel");
  
  // Get current viewport width for this function
  const currentViewportWidth = window.innerWidth;
  
  // Add toggle button if not already present
  if (!controlPanel.querySelector('.control-panel-toggle')) {
    const toggle = document.createElement('div');
    toggle.className = 'control-panel-toggle';
    toggle.innerHTML = '<span>Control Panel</span><span class="toggle-icon">▼</span>';
    
    // Insert at the top of control panel
    if (controlPanel.firstChild) {
      controlPanel.insertBefore(toggle, controlPanel.firstChild);
    } else {
      controlPanel.appendChild(toggle);
    }
    
    // Add click handler to toggle collapsed state
    toggle.addEventListener('click', function() {
      controlPanel.classList.toggle('collapsed');
      
      // Update toggle icon
      const icon = toggle.querySelector('.toggle-icon');
      if (icon) {
        icon.textContent = controlPanel.classList.contains('collapsed') ? '▼' : '▲';
      }
      
      // Save preference
      localStorage.setItem('controlPanelCollapsed', controlPanel.classList.contains('collapsed'));
    });
    
    // Apply saved preference
    if (localStorage.getItem('controlPanelCollapsed') === 'true') {
      controlPanel.classList.add('collapsed');
      const icon = toggle.querySelector('.toggle-icon');
      if (icon) icon.textContent = '▼';
    }
  }
  
  // Setup tabbed sections for smaller screens
  const isSmallScreen = currentViewportWidth <= 480;
  if (isSmallScreen) {
    setupTabbedSections(controlPanel);
  } else {
    // For larger screens, use collapsible sections
    setupCollapsibleSections(controlPanel);
  }
  
  // Apply mobile-optimized styles to common elements
  applyMobileStyles(controlPanel);
}

// Setup collapsible sections for control panel
function setupCollapsibleSections(controlPanel) {
  // Add collapsible functionality to each section
  const sections = controlPanel.querySelectorAll('.control-panel-section, .theme-section, .level-section, .mode-section');
  sections.forEach(section => {
    // Check if already processed
    if (section.classList.contains('collapsible-ready')) return;
    
    // Find section header (various possible elements)
    const header = section.querySelector('h2, h3, h4, .section-title, .control-panel-section-title');
    if (!header) return;
    
    // Create toggle icon
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'section-toggle-icon';
    toggleIcon.textContent = '▼';
    header.appendChild(toggleIcon);
    
    // Mark as collapsible
    section.classList.add('collapsible-section', 'collapsible-ready');
    
    // Add click handler
    header.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') return; // Don't trigger on button clicks
      
      section.classList.toggle('collapsed');
      toggleIcon.textContent = section.classList.contains('collapsed') ? '▼' : '▲';
    });
  });
}

// Setup tabbed interface for small screens
function setupTabbedSections(controlPanel) {
  // Create tabs container if not exists
  let tabsContainer = controlPanel.querySelector('.control-panel-tabs');
  if (!tabsContainer) {
    tabsContainer = document.createElement('div');
    tabsContainer.className = 'control-panel-tabs';
    
    // Insert after toggle
    const toggle = controlPanel.querySelector('.control-panel-toggle');
    if (toggle && toggle.nextSibling) {
      controlPanel.insertBefore(tabsContainer, toggle.nextSibling);
    } else {
      controlPanel.appendChild(tabsContainer);
    }
  }
  
  // Get all sections and create tabs
  const sections = controlPanel.querySelectorAll('.control-panel-section, .theme-section, .level-section, .mode-section');
  sections.forEach((section, index) => {
    // Skip if already processed
    if (section.classList.contains('tab-ready')) return;
    
    // Find section title
    const title = section.querySelector('h2, h3, h4, .section-title, .control-panel-section-title');
    const tabTitle = title ? title.textContent.trim() : `Section ${index + 1}`;
    
    // Create tab
    const tab = document.createElement('div');
    tab.className = 'control-panel-tab';
    tab.textContent = tabTitle;
    tab.dataset.sectionId = section.id || `section-${index}`;
    
    // Set an ID on the section if it doesn't have one
    if (!section.id) section.id = `section-${index}`;
    
    tabsContainer.appendChild(tab);
    
    // Set first tab active by default
    if (index === 0 && !controlPanel.querySelector('.control-panel-tab.active')) {
      tab.classList.add('active');
      section.classList.add('active');
    }
    
    // Add click handler
    tab.addEventListener('click', function() {
      // Deactivate all tabs and sections
      controlPanel.querySelectorAll('.control-panel-tab').forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Activate current tab and section
      tab.classList.add('active');
      section.classList.add('active');
      
      // Store preference
      localStorage.setItem('activeControlPanelTab', tab.dataset.sectionId);
    });
    
    // Mark as processed
    section.classList.add('tab-ready');
  });
  
  // Apply saved tab preference
  const savedTabId = localStorage.getItem('activeControlPanelTab');
  if (savedTabId) {
    const savedTab = controlPanel.querySelector(`.control-panel-tab[data-section-id="${savedTabId}"]`);
    if (savedTab) savedTab.click();
  }
}

// Apply mobile-optimized styles
function applyMobileStyles(controlPanel) {
  // Enhance theme buttons
  const themeButtons = controlPanel.querySelectorAll('.theme-button');
  themeButtons.forEach(button => {
    button.style.display = 'flex';
    button.style.flexDirection = 'column';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.borderRadius = '8px';
  });
  
  // Enhance level controls
  const levelButtons = controlPanel.querySelectorAll('.level-button');
  levelButtons.forEach(button => {
    button.style.borderRadius = '6px';
    button.style.textAlign = 'center';
  });
  
  // Make mode toggles touch-friendly
  const modeToggles = controlPanel.querySelectorAll('.mode-toggle');
  modeToggles.forEach(toggle => {
    toggle.style.padding = '12px 10px';
    toggle.style.margin = '8px 0';
    toggle.style.borderRadius = '8px';
  });
}

// Check if we need to scroll back to chat after certain operations
function checkChatScroll() {
  // If the chat is not visible, check if we should add a back button
  const chatSection = document.querySelector('.chat-section');
  if (chatSection) {
    const rect = chatSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      // Chat is out of view, make sure we have a back button
      createBackToChatButton();
      
      // Mark document as having chat out of view for CSS targeting
      document.body.classList.add('chat-section-out-of-view');
      
      // Make sure button is visible
      const backButton = document.querySelector('.back-to-chat-button');
      if (backButton) {
        backButton.classList.add('visible');
      }
    } else {
      // Chat is in view
      document.body.classList.remove('chat-section-out-of-view');
      
      // Hide button if it exists
      const backButton = document.querySelector('.back-to-chat-button');
      if (backButton) {
        backButton.classList.remove('visible');
      }
    }
  }
}

/**
 * Functions to improve scrolling on mobile devices
 */
function improveScrolling() {
  // Apply smooth scrolling to the whole page
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Fix momentum scrolling on iOS
  const scrollableElements = document.querySelectorAll('.messages-container, .chat-section, .control-panel-component');
  scrollableElements.forEach(el => {
    el.style.webkitOverflowScrolling = 'touch';
    el.style.overflowY = 'auto';
  });
}

/**
 * Fix common layout issues on mobile devices
 */
function fixLayoutIssues() {
  // Fix any fixed position elements to account for iOS safari viewport issues
  const fixedElements = document.querySelectorAll('.fixed-element, .fixed-header, .fixed-footer');
  fixedElements.forEach(el => {
    // Fix iOS position:fixed inside transform elements issue
    el.style.transform = 'translateZ(0)';
  });
  
  // Fix content overflow issues
  document.querySelectorAll('pre, code').forEach(el => {
    el.style.maxWidth = '100%';
    el.style.overflowX = 'auto';
    el.style.whiteSpace = 'pre-wrap';
  });
}

/**
 * Handle orientation changes
 */
function setupOrientationHandling() {
  window.addEventListener('orientationchange', function() {
    // Re-apply styles after orientation change
    setTimeout(function() {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      window.scrollTo(0, 0);
    }, 300);
  });
}

/**
 * Handle back button on mobile devices
 */
function setupBackButtonHandling() {
  // Set up history state for back button handling
  window.history.pushState({ page: 'roastbot' }, 'Degen Roast 3000');
  
  window.addEventListener('popstate', function(e) {
    // Prevent exit on back button press
    window.history.pushState({ page: 'roastbot' }, 'Degen Roast 3000');
    
    // Show a toast notification
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = 'Use controls to exit Degen Roast 3000';
    document.body.appendChild(toast);
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  });
}

/**
 * Add double tap detection for mobile
 */
function setupDoubleTapDetection() {
  let lastTap = 0;
  
  document.addEventListener('touchend', function(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
      // Double tap detected
      e.preventDefault();
    }
    
    lastTap = currentTime;
  });
}

/**
 * Hide debug elements on mobile
 */
function hideDebugElements() {
  const debugElements = document.querySelectorAll('.debug-only, .debug-panel, .console-output');
  debugElements.forEach(el => {
    el.style.display = 'none';
  });
}

/**
 * Setup fullscreen mode for better mobile experience
 */
function setupFullscreenMode() {
  // Add fullscreen button if not present
  if (!document.querySelector('.fullscreen-toggle')) {
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fullscreen-toggle';
    fullscreenBtn.innerHTML = '⛶';
    fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    document.body.appendChild(fullscreenBtn);
    
    fullscreenBtn.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }
}

// Add a new function to force the iPad Mini layout
function forceIPadMiniLayout() {
  console.log("📱 Enhancing iPad Mini layout - Using CSS-first approach");
  
  // Get current dimensions
  const currentViewportWidth = window.innerWidth;
  const currentViewportHeight = window.innerHeight;
  
  // Add data attributes and classes for CSS targeting
  // Rather than setting direct styles, we'll let CSS handle most styling
  document.documentElement.setAttribute('data-device', 'ipad-mini');
  document.documentElement.classList.add('ipad-mini-view', 'tablet-view');
  document.body.setAttribute('data-device', 'ipad-mini');
  document.body.classList.add('ipad-mini-view', 'tablet-view');
  
  // Add additional data attributes for CSS targeting
  document.documentElement.setAttribute('data-width', currentViewportWidth);
  document.documentElement.setAttribute('data-height', currentViewportHeight);
  document.documentElement.setAttribute('data-orientation', currentViewportWidth < currentViewportHeight ? 'portrait' : 'landscape');
  
  // Get key elements
  const container = document.querySelector('.container.enhanced-ui');
  const contentGrid = document.querySelector('.content-grid');
  const chatSection = document.querySelector('.chat-section');
  const leftSidebar = document.querySelector('.left-sidebar-wrapper');
  const rightSidebar = document.querySelector('.right-sidebar-wrapper');
  const controlPanel = document.querySelector('.control-panel-component');
  
  // Reset inline styles on layout elements to let CSS take control
  if (contentGrid) resetInlineStyles(contentGrid);
  if (chatSection) resetInlineStyles(chatSection);
  if (leftSidebar) resetInlineStyles(leftSidebar);
  if (rightSidebar) resetInlineStyles(rightSidebar);
  if (controlPanel) resetInlineStyles(controlPanel);
  
  // Additionally reset any theme-related elements
  if (controlPanel) {
    const themeOptions = controlPanel.querySelector('.theme-options');
    const levelControls = controlPanel.querySelector('.level-controls');
    const themeButtons = controlPanel.querySelectorAll('.theme-button');
    
    if (themeOptions) resetInlineStyles(themeOptions);
    if (levelControls) resetInlineStyles(levelControls);
    if (themeButtons) resetInlineStyles(themeButtons);
  }
  
  // Only add marker class if not already present
  if (container && !container.classList.contains('ipad-mini-enhanced')) {
    container.classList.add('ipad-mini-enhanced');
  }
  
  // Ensure all collapsible sections are expanded but use CSS for styling
  const collapsibleSections = document.querySelectorAll('.collapsible-section');
  collapsibleSections.forEach(section => {
    section.classList.remove('collapsed');
    resetInlineStyles(section);
  });
  
  // Ensure all control panel sections are visible
  const controlPanelSections = document.querySelectorAll('.control-panel-section');
  controlPanelSections.forEach(section => {
    if (section.style.display === 'none') {
      section.style.display = ''; // Reset to default instead of forcing a specific value
    }
    resetInlineStyles(section);
  });
  
  // Log success
  console.log("✅ iPad Mini layout enhanced - Using CSS media queries and minimal JS");
}

/**
 * Resets inline styles on elements and marks them for CSS control
 * Use this when you need to clear existing inline styles and let CSS take over
 * @param {NodeList|Array|Element} elements - Elements to reset styles for
 * @param {boolean} useCssControl - Whether to add the data-css-controlled attribute
 */
function resetInlineStyles(elements, useCssControl = true) {
  // Convert single element to array for consistent handling
  const elementsArray = elements instanceof Element ? [elements] : elements;
  
  // Process each element
  Array.from(elementsArray).forEach(element => {
    if (element && element instanceof Element) {
      // Remove all inline styles
      element.classList.add('style-reset');
      
      // Mark for CSS control if requested
      if (useCssControl) {
        element.setAttribute('data-css-controlled', 'true');
      }
      
      // Double-check that problematic properties are cleared
      // This handles cases where the style-reset class might not catch everything
      const criticalProperties = [
        'display', 'width', 'height', 'position', 
        'margin', 'padding', 'visibility', 'opacity'
      ];
      
      criticalProperties.forEach(prop => {
        if (element.style[prop]) {
          element.style[prop] = '';
        }
      });
    }
  });
}

// Add a function to handle mobile input improvements
function setupMobileInputHandling() {
  console.log("📱 Setting up enhanced mobile input handling");
  
  // Find the chat input field - more comprehensive selector to ensure we find it
  const chatInput = document.querySelector('.chat-input textarea, .chat-input input, #chat-input, #user-input, .input-field, .message-form textarea');
  
  if (chatInput) {
    console.log("📱 Found chat input field, enhancing mobile keyboard handling");
    
    // Set font size to prevent zoom on iOS
    chatInput.style.fontSize = '16px';
    
    // Is this an iOS device?
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // Enhanced focus behavior for better keyboard handling
    chatInput.addEventListener('focus', function() {
      console.log("📱 Input field focused");
      
      // Mark input as active for CSS targeting
      chatInput.classList.add('active-input');
      document.body.classList.add('input-focused');
      
      // iOS-specific adjustments
      if (isIOS) {
        document.body.classList.add('ios-keyboard-open');
        
        // Ensure the chat section is visible and sized correctly
        const chatSection = document.querySelector('.chat-section');
        if (chatSection) {
          chatSection.style.maxHeight = '50vh';
          chatSection.style.height = '50vh';
        }
        
        // Only after a delay to let keyboard appear
        setTimeout(() => {
          // Scroll the input into view
          chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Additional scroll adjustment for iOS
          setTimeout(() => {
            window.scrollTo(0, window.scrollY + 100);
          }, 200);
        }, 300);
      } else {
        // For Android/other devices
        setTimeout(() => {
          // Scroll the page to ensure the input is visible
          const rect = chatInput.getBoundingClientRect();
          const isInView = (rect.top >= 0 && rect.bottom <= window.innerHeight);
          
          if (!isInView) {
            chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    });
    
    // Enhanced blur handler
    chatInput.addEventListener('blur', function() {
      console.log("📱 Input field blurred");
      
      // Don't remove classes immediately - check if we're focusing another input
      setTimeout(() => {
        const stillFocused = document.activeElement === chatInput || 
                            (document.activeElement && 
                             (document.activeElement.tagName === 'INPUT' || 
                              document.activeElement.tagName === 'TEXTAREA'));
                              
        if (!stillFocused) {
          // Not focusing any input - remove active classes
          chatInput.classList.remove('active-input');
          document.body.classList.remove('input-focused', 'ios-keyboard-open');
          
          // Reset chat section height
          if (isIOS) {
            const chatSection = document.querySelector('.chat-section');
            if (chatSection) {
              chatSection.style.maxHeight = '80vh';
              chatSection.style.height = '75vh';
            }
          }
          
          // Scroll back to chat area when input loses focus
          const messagesContainer = document.querySelector('.messages-container');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }, 100);
    });
    
    // Enhanced input handler to adjust height as typing occurs
    chatInput.addEventListener('input', function() {
      // Auto-resize the textarea to fit content
      if (chatInput.tagName === 'TEXTAREA') {
        chatInput.style.height = 'auto';
        
        // Limit max height to avoid excessive growth
        const newHeight = Math.min(chatInput.scrollHeight, 120);
        chatInput.style.height = newHeight + 'px';
      }
      
      // Ensure input remains visible as content grows
      setTimeout(() => {
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    });
    
    // Override form submission to prevent keyboard issues
    const messageForm = document.querySelector('.message-form, #message-form');
    if (messageForm) {
      // Add a special handler just before form submission
      messageForm.addEventListener('submit', function(e) {
        console.log("📱 Form submitted");
        
        // Store the input text
        const inputText = chatInput.value.trim();
        
        // Only proceed if we have text
        if (inputText) {
          // Clear the input field immediately to prevent double-sends
          chatInput.value = '';
          
          // Reset height if it's a textarea
          if (chatInput.tagName === 'TEXTAREA') {
            chatInput.style.height = 'auto';
          }
          
          // If this is iOS, we use a special approach
          if (isIOS) {
            // Don't refocus immediately - let keyboard dismiss
            setTimeout(() => {
              // Only after keyboard is dismissed, refocus the input
              chatInput.focus();
              
              // Scroll to ensure it's visible
              chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
          } else {
            // For non-iOS, refocus immediately
            chatInput.focus();
          }
        }
      });
    }
  } else {
    console.warn("📱 Chat input field not found - can't set up mobile handling");
  }
  
  // Improve buttons for touch interaction
  const buttons = document.querySelectorAll('button, .control-panel button, .send-button, .action-button');
  buttons.forEach(button => {
    if (!button.classList.contains('touch-enhanced')) {
      // Increase tap target size for mobile
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
      
      // Add tactile feedback class
      button.classList.add('touch-enhanced');
      
      // Prevent double-tap zoom on iOS
      button.addEventListener('touchend', function(e) {
        // Only prevent default if this is a simple tap, not a scroll or multi-touch
        if (!this.touchMoved && e.touches.length <= 1) {
          e.preventDefault();
          // Trigger click after preventing default
          setTimeout(() => button.click(), 0);
        }
      });
      
      // Track if touch moved (to avoid preventing scrolling)
      button.addEventListener('touchstart', function() {
        this.touchMoved = false;
      });
      
      button.addEventListener('touchmove', function() {
        this.touchMoved = true;
      });
    }
  });
}

// Add keyboard detection and auto-adjustment for mobile devices
function setupKeyboardDetection() {
  console.log("📱 Setting up enhanced keyboard detection for mobile");
  
  // Determine if we're on iOS for special handling
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  // Use Visual Viewport API if available (modern browsers)
  if (window.visualViewport) {
    console.log("📱 Visual Viewport API available - using for keyboard detection");
    
    let keyboardVisible = false;
    let keyboardHeight = 0;
    let lastViewportHeight = window.visualViewport.height;
    
    const viewportHandler = () => {
      // Get current viewport dimensions
      const currentHeight = window.visualViewport.height;
      
      // More accurate keyboard detection that handles orientation changes
      if (lastViewportHeight > currentHeight && 
          (window.innerHeight - currentHeight) > 150) {
        // Significant height reduction = keyboard is likely visible
        keyboardVisible = true;
        keyboardHeight = window.innerHeight - currentHeight;
        
        // Apply keyboard open classes
        document.body.classList.add('keyboard-open');
        if (isIOS) {
          document.body.classList.add('ios-keyboard-open');
        }
        
        // Find active input and add classes to parent containers
        const activeInput = document.activeElement;
        if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
          // Add class to parent containers for styling
          let parent = activeInput.parentElement;
          while (parent && parent !== document.body) {
            parent.classList.add('input-active');
            parent = parent.parentElement;
          }
          
          // iOS requires special handling to ensure input is visible
          if (isIOS) {
            // Create space at the bottom to push content up
            document.body.style.paddingBottom = `${keyboardHeight}px`;
            
            // Ensure the input is scrolled into view
            setTimeout(() => {
              activeInput.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }, 100);
          }
        }
      } 
      else if (currentHeight > lastViewportHeight || 
               currentHeight >= window.innerHeight - 50) {
        // Height increased back to near window height = keyboard likely hidden
        if (keyboardVisible) {
          keyboardVisible = false;
          
          // Remove keyboard classes
          document.body.classList.remove('keyboard-open', 'ios-keyboard-open');
          document.body.style.paddingBottom = '';
          
          // Remove active input classes
          document.querySelectorAll('.input-active').forEach(el => {
            el.classList.remove('input-active');
          });
          
          // Scroll to bottom of messages after keyboard closes
          setTimeout(() => {
            const messagesContainer = document.querySelector('.messages-container');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      }
      
      // Save current height for next comparison
      lastViewportHeight = currentHeight;
      
      // Special handling for iOS to fix position:fixed elements when keyboard is open
      if (isIOS && keyboardVisible) {
        const messageInputComponent = document.querySelector('.message-input-component');
        if (messageInputComponent) {
          // Calculate bottom position based on keyboard height
          const bottomOffset = keyboardHeight;
          
          // Only apply if keyboard is definitely showing
          if (bottomOffset > 100) {
            // For iOS we need to adjust position differently
            messageInputComponent.style.position = 'absolute';
            messageInputComponent.style.bottom = `${bottomOffset}px`;
            
            // Force GPU acceleration for smoother transitions
            messageInputComponent.style.transform = 'translateZ(0)';
          }
        }
      }
    };
    
    // Listen for viewport changes with high sensitivity
    window.visualViewport.addEventListener('resize', viewportHandler);
    window.visualViewport.addEventListener('scroll', viewportHandler);
    
    // Also listen to window resize as a fallback
    window.addEventListener('resize', viewportHandler);
    
  } else {
    // Fallback for older browsers
    console.log("📱 Using enhanced fallback keyboard detection method");
    
    // Improved resize-based detection
    let windowHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
      // Get new height
      const newHeight = window.innerHeight;
      
      // Check for significant height change that would indicate keyboard
      if (newHeight < windowHeight * 0.8) {
        // Keyboard likely appeared
        document.body.classList.add('keyboard-open');
        if (isIOS) {
          document.body.classList.add('ios-keyboard-open');
          
          // Create space at the bottom for iOS
          const keyboardHeight = windowHeight - newHeight;
          document.body.style.paddingBottom = `${keyboardHeight}px`;
        }
        
        // Find any active input
        const activeInput = document.activeElement;
        if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
          // Add class to parent containers
          let parent = activeInput.parentElement;
          while (parent && parent !== document.body) {
            parent.classList.add('input-active');
            parent = parent.parentElement;
          }
          
          // Ensure input is visible
          setTimeout(() => {
            activeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } 
      else if (newHeight > windowHeight * 0.9 || Math.abs(newHeight - window.screen.height) < 100) {
        // Keyboard likely disappeared
        document.body.classList.remove('keyboard-open', 'ios-keyboard-open');
        document.body.style.paddingBottom = '';
        
        // Remove input active classes
        document.querySelectorAll('.input-active').forEach(el => {
          el.classList.remove('input-active');
        });
        
        // Scroll to messages
        setTimeout(() => {
          const messagesContainer = document.querySelector('.messages-container');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      }
      
      // Update stored height
      windowHeight = newHeight;
    });
  }
  
  // Enhanced focus/blur handling for all browsers
  document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      // For iOS, we want to immediately apply some classes
      if (isIOS) {
        document.body.classList.add('ios-keyboard-open');
      }
      
      // Mark the input and its parents as active
      e.target.classList.add('input-active');
      let parent = e.target.parentElement;
      while (parent && parent !== document.body) {
        parent.classList.add('input-active');
        parent = parent.parentElement;
      }
      
      // Improved scrolling that works on all browsers
      setTimeout(() => {
        // First try native scrollIntoView with a delay
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Then add an additional adjustment for iOS
        if (isIOS) {
          setTimeout(() => {
            window.scrollTo(0, window.scrollY + 100);
          }, 300);
        }
      }, 300);
    }
  });
  
  document.addEventListener('focusout', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      // Only remove classes if we're not focusing another input
      setTimeout(() => {
        const newFocusIsInput = document.activeElement && 
                               (document.activeElement.tagName === 'INPUT' || 
                                document.activeElement.tagName === 'TEXTAREA');
        
        if (!newFocusIsInput) {
          // No longer focusing any input, remove classes
          document.body.classList.remove('ios-keyboard-open');
          e.target.classList.remove('input-active');
          
          let parent = e.target.parentElement;
          while (parent && parent !== document.body) {
            parent.classList.remove('input-active');
            parent = parent.parentElement;
          }
          
          // Scroll to bottom of messages
          setTimeout(() => {
            const messagesContainer = document.querySelector('.messages-container');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 300);
        }
      }, 100);
    }
  });
  
  // Add a test button for keyboard visibility on iOS
  if (isIOS) {
    const testButton = document.createElement('button');
    testButton.textContent = '📱 Test Input';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.left = '10px';
    testButton.style.zIndex = '9999';
    testButton.style.padding = '8px 12px';
    testButton.style.background = 'rgba(0,0,0,0.7)';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '5px';
    testButton.style.fontSize = '14px';
    
    testButton.addEventListener('click', () => {
      // Focus on input field
      const inputField = document.querySelector('#user-input, .input-field');
      if (inputField) {
        inputField.focus();
      } else {
        alert('No input field found!');
      }
    });
    
    document.body.appendChild(testButton);
  }
} 