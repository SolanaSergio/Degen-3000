/**
 * mobile-enhancements.js
 * Mobile-specific JavaScript enhancements for DEGEN ROAST 3000
 */

document.addEventListener('DOMContentLoaded', function() {
  // Enhanced device detection with more robust iPad detection
  const isMobile = window.innerWidth <= 1024; // Include tablets in "mobile" category
  const isSmallMobile = window.innerWidth <= 480;
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isDesktop = window.innerWidth > 1024;
  
  // Skip mobile enhancements entirely on desktop
  if (isDesktop) {
    console.log('📱 Desktop detected, skipping mobile enhancements');
    
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
  
  // Device dimension info
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
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
  const isIPadMini = window.innerWidth === 768 && window.innerHeight === 1024;
  
  const isIPadByDimensions = iPadDimensions.some(dim => 
    (Math.abs(window.innerWidth - dim.width) < 10 && Math.abs(window.innerHeight - dim.height) < 10) || 
    (Math.abs(window.innerHeight - dim.width) < 10 && Math.abs(window.innerWidth - dim.height) < 10) // Account for orientation
  );
  
  const isDevToolsIPad = isIPadByDimensions;
  
  // Check user agent and dimensions
  const isIPad = isIPadByDimensions || 
                (navigator.userAgent.match(/iPad/i)) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                (navigator.userAgent.match(/Mac/i) && 'ontouchend' in document && window.innerWidth >= 768 && window.innerWidth <= 1024);
  
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
    width: window.innerWidth, 
    height: window.innerHeight,
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
  if (window.innerHeight < window.outerHeight * 0.75) {
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

// Update the load event handler to implement the new mobile-focused layout
window.addEventListener('load', function() {
  // Make sure viewport is properly set
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  }
  
  // Enhanced detection for iPad/tablets with improved logic
  const iPadDimensions = [
    {width: 820, height: 1180}, // iPad Air in DevTools
    {width: 768, height: 1024}, // Common iPad dimension
    {width: 834, height: 1112}, // iPad Air (3rd gen, 10.5-inch)
    {width: 810, height: 1080}, // Some iPad Air configurations
    {width: 834, height: 1194}  // iPad Air (4th/5th gen, 10.9-inch)
  ];
  
  // Specific check for iPad Mini dimensions
  const isIPadMini = window.innerWidth === 768 && window.innerHeight === 1024;
  
  const isIPadByDimensions = iPadDimensions.some(dim => 
    (Math.abs(window.innerWidth - dim.width) < 10 && Math.abs(window.innerHeight - dim.height) < 10) || 
    (Math.abs(window.innerHeight - dim.width) < 10 && Math.abs(window.innerWidth - dim.height) < 10)
  );
  
  // Better iPad detection
  const isDevToolsIPad = isIPadByDimensions;
  const isIPad = isIPadByDimensions || 
                (navigator.userAgent.match(/iPad/i)) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                (navigator.userAgent.match(/Mac/i) && 'ontouchend' in document && window.innerWidth >= 768 && window.innerWidth <= 1024);
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isMobile = window.innerWidth <= 1024;
  
  // Log detection for debugging
  console.log("Enhanced device detection on load:", { 
    width: window.innerWidth, 
    height: window.innerHeight,
    isIPadMini: isIPadMini,
    isIPadByDimensions: isIPadByDimensions,
    isDevToolsIPad: isDevToolsIPad,
    isIPad: isIPad, 
    isTablet: isTablet,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints || 0
  });
  
  // Add classes for CSS targeting
  if (isMobile) {
    document.body.classList.add('mobile-view');
    document.documentElement.classList.add('mobile-view');
  }
  
  if (isTablet) {
    document.body.classList.add('tablet-view');
    document.documentElement.classList.add('tablet-view');
  }
  
  if (isIPad) {
    document.body.classList.add('ipad-view');
    document.documentElement.classList.add('ipad-view');
    
    // Add data attribute for more robust targeting
    document.body.setAttribute('data-device', 'ipad');
    
    // Check if specifically iPad Air by dimensions
    if (isIPadByDimensions) {
      document.body.classList.add('ipad-air-view');
      document.body.setAttribute('data-device', 'ipad-air');
      console.log("✅ Detected iPad Air - Applied specific styles");
    }
  }
  
  // Special handling for iPad Mini
  if (isIPadMini) {
    document.body.classList.add('ipad-mini-view');
    document.body.setAttribute('data-device', 'ipad-mini');
    console.log("✅ Detected iPad Mini - Applying immediate fix");
    
    // Force direct fix for iPad Mini layout
    setTimeout(forceIPadMiniLayout, 0);
    // And again after a short delay
    setTimeout(forceIPadMiniLayout, 300);
    // And once more after DOM is fully loaded
    setTimeout(forceIPadMiniLayout, 1000);
  }
  
  // Apply the new mobile-focused layout
  if (isMobile) {
    // Set proper heights after all content has loaded
    const chatSection = document.querySelector('.chat-section');
    if (chatSection) {
      // Adjust height based on viewport and other elements
      const viewportHeight = window.innerHeight;
      const headerHeight = document.getElementById('header-container')?.offsetHeight || 0;
      const tickerHeight = document.getElementById('stonks-ticker')?.offsetHeight || 0;
      
      // For mobile, maximize chat height
      if (!isTablet && !isIPad) {
        chatSection.style.height = (viewportHeight * 0.75) + 'px';
        chatSection.style.minHeight = (viewportHeight * 0.7) + 'px';
        chatSection.style.maxHeight = (viewportHeight * 0.8) + 'px';
      } else {
        // For tablets, use a different approach based on orientation
        if (window.matchMedia('(orientation: portrait)').matches) {
          chatSection.style.height = (viewportHeight * 0.65) + 'px'; 
          chatSection.style.minHeight = (viewportHeight * 0.6) + 'px';
        } else {
          // In landscape, allocate more space to height
          chatSection.style.height = (viewportHeight - headerHeight - tickerHeight - 40) + 'px';
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
      // Make sure content grid fills the screen
      contentGrid.style.width = '100%';
      contentGrid.style.padding = '0';
      
      // For phones (not tablets), stack everything
      if (!isTablet && !isIPad) {
        // Ensure chat is first, followed by control panel
        const chatSection = document.querySelector('.chat-section');
        const leftSidebar = document.querySelector('.left-sidebar-wrapper');
        const rightSidebar = document.querySelector('.right-sidebar-wrapper');
        
        if (chatSection && leftSidebar) {
          contentGrid.style.display = 'flex';
          contentGrid.style.flexDirection = 'column';
          
          // Set order: chat first, then control panel, then other components
          chatSection.style.order = '1';
          leftSidebar.style.order = '2';
          if (rightSidebar) rightSidebar.style.order = '3';
          
          // Add padding below chat section
          chatSection.style.marginBottom = '10px';
        }
      } else if (isIPad || isTablet) {
        // For iPad/tablets, we have specific layouts for portrait/landscape
        if (window.matchMedia('(orientation: portrait)').matches) {
          // Portrait: Stack layout (chat on top, control panel below)
          contentGrid.style.display = 'grid';
          contentGrid.style.gridTemplateColumns = '100%';
          contentGrid.style.gap = '16px';
          contentGrid.style.padding = '16px';
          
          const chatSection = document.querySelector('.chat-section');
          const leftSidebar = document.querySelector('.left-sidebar-wrapper');
          
          if (chatSection && leftSidebar) {
            chatSection.style.order = '1';
            leftSidebar.style.order = '2';
          }
        } else {
          // Landscape: Side-by-side layout
          contentGrid.style.display = 'grid';
          contentGrid.style.gridTemplateColumns = '350px 1fr';
          contentGrid.style.gap = '20px';
          contentGrid.style.padding = '16px';
          
          const chatSection = document.querySelector('.chat-section');
          const leftSidebar = document.querySelector('.left-sidebar-wrapper');
          
          if (chatSection && leftSidebar) {
            chatSection.style.order = '2';
            leftSidebar.style.order = '1';
            
            // Set fixed heights
            const viewportHeight = window.innerHeight;
            const headerHeight = document.getElementById('header-container')?.offsetHeight || 0;
            const tickerHeight = document.getElementById('stonks-ticker')?.offsetHeight || 0;
            const availableHeight = viewportHeight - headerHeight - tickerHeight - 32;
            
            chatSection.style.height = availableHeight + 'px';
            chatSection.style.maxHeight = availableHeight + 'px';
            leftSidebar.style.height = availableHeight + 'px';
            leftSidebar.style.overflowY = 'auto';
          }
        }
      }
    }
    
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
  }
  
  // Set up orientation change handler
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      // Reapply mobile layout after orientation change
      const isMobile = window.innerWidth <= 1024;
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
      const isIPad = document.body.classList.contains('ipad-view');
      
      if (isMobile) {
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        const contentGrid = document.querySelector('.content-grid');
        const chatSection = document.querySelector('.chat-section');
        const leftSidebar = document.querySelector('.left-sidebar-wrapper');
        
        if (isTablet || isIPad) {
          // Different layout for tablet vs phone
          if (isLandscape) {
            // Side-by-side in landscape
            contentGrid.style.display = 'grid';
            contentGrid.style.gridTemplateColumns = '350px 1fr';
            
            if (chatSection && leftSidebar) {
              chatSection.style.order = '2';
              leftSidebar.style.order = '1';
            }
          } else {
            // Stacked in portrait
            contentGrid.style.display = 'grid';
            contentGrid.style.gridTemplateColumns = '100%';
            
            if (chatSection && leftSidebar) {
              chatSection.style.order = '1';
              leftSidebar.style.order = '2';
            }
          }
        } else {
          // Phone always has stacked layout
          contentGrid.style.display = 'flex';
          contentGrid.style.flexDirection = 'column';
        }
        
        // Adjust heights after orientation change
        if (chatSection) {
          const viewportHeight = window.innerHeight;
          
          if (!isTablet && !isIPad) {
            // Phone layout
            chatSection.style.height = (viewportHeight * 0.75) + 'px';
            chatSection.style.minHeight = (viewportHeight * 0.7) + 'px';
          } else if (isLandscape) {
            // Tablet landscape
            const headerHeight = document.getElementById('header-container')?.offsetHeight || 0;
            chatSection.style.height = (viewportHeight - headerHeight - 32) + 'px';
            
            if (leftSidebar) {
              leftSidebar.style.height = (viewportHeight - headerHeight - 32) + 'px';
              leftSidebar.style.overflowY = 'auto';
            }
          } else {
            // Tablet portrait
            chatSection.style.height = (viewportHeight * 0.65) + 'px';
            chatSection.style.minHeight = (viewportHeight * 0.6) + 'px';
          }
        }
      }
    }, 300);
  });
});

// Setup enhanced control panel for mobile devices
function setupMobileControlPanel() {
  const controlPanel = document.querySelector('.control-panel-component');
  if (!controlPanel) return;
  
  console.log("📱 Setting up enhanced mobile control panel");
  
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
  const isSmallScreen = window.innerWidth <= 480;
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

// Make sure we set up the enhanced mobile experience
document.addEventListener('DOMContentLoaded', function() {
  // Detect if we should use mobile enhancements
  const isMobile = window.innerWidth <= 1024;
  
  if (isMobile) {
    // Set up the mobile control panel
    setTimeout(setupMobileControlPanel, 500);
    
    // Check if we need a back-to-chat button
    setTimeout(checkChatScroll, 1000);
    
    // Set up scroll listener to check chat visibility
    window.addEventListener('scroll', checkChatScroll);
    
    // If we're not using our mobile styles, force them
    if (!document.body.classList.contains('mobile-view')) {
      document.body.classList.add('mobile-view');
    }
  }
});

// Ensure chat is scrolled to bottom
setTimeout(checkChatScroll, 500);
setTimeout(checkChatScroll, 1000);

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

// Add a new function to force the iPad Mini layout
function forceIPadMiniLayout() {
  console.log("📱 Enhancing iPad Mini layout - Using CSS-first approach");
  
  // Add data attributes and classes for CSS targeting
  // Rather than setting direct styles, we'll let CSS handle most styling
  document.documentElement.setAttribute('data-device', 'ipad-mini');
  document.documentElement.classList.add('ipad-mini-view', 'tablet-view');
  document.body.setAttribute('data-device', 'ipad-mini');
  document.body.classList.add('ipad-mini-view', 'tablet-view');
  
  // Add additional data attributes for CSS targeting
  document.documentElement.setAttribute('data-width', window.innerWidth);
  document.documentElement.setAttribute('data-height', window.innerHeight);
  document.documentElement.setAttribute('data-orientation', window.innerWidth < window.innerHeight ? 'portrait' : 'landscape');
  
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