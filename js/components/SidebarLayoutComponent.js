// SidebarLayoutComponent.js - Fixed to reliably create the base DOM structure
// This component should run before others that depend on the DOM structure

class SidebarLayout extends Component {
  constructor() {
    super('sidebarLayout');
    
    this.state = {
      initialized: false,
      sidebarVisible: true,
      mobileSidebarOpen: false,
      mobile: false,
      breakpoint: 768, // Mobile breakpoint in pixels,
      domStructureCreated: false
    };
    
    // DOM element references
    this.sidebar = null;
    this.mainContent = null;
    this.narrativeContainer = null;
  }
  
  initialize() {
    // Call base Component initialization
    super.initialize();
    
    console.log("SidebarLayout: Initializing...");
    
    // Create layout structure first - this is critical for other components
    this.createLayoutStructure();
    
    // Add layout styles
    this.addLayoutStyles();
    
    // Update with player data
    this.updateSidebar();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up resize handling for responsive behavior
    this.setupResizeHandling();
    
    // Subscribe to events
    this.setupEventSubscriptions();
    
    // Mark as initialized
    this.state.initialized = true;
    this.state.domStructureCreated = true;
    
    console.log("SidebarLayout: Initialized");
    
    // Publish initialization event with element references
    if (this.system && this.system.eventBus) {
      this.system.eventBus.publish('sidebar:initialized', {
        sidebar: this.sidebar,
        mainContent: this.mainContent,
        narrativeContainer: this.narrativeContainer
      });
      
      // Also publish a DOM ready event that other components can listen for
      this.system.eventBus.publish('dom:structure:ready', {
        sidebar: this.sidebar,
        mainContent: this.mainContent,
        narrativeContainer: this.narrativeContainer
      });
    }
    
    return true;
  }
  
  /**
   * Create the layout structure with sidebar and main content
   * This is the most critical function as other components depend on this structure
   */
  createLayoutStructure() {
    console.log("SidebarLayout: Creating layout structure");
    
    // Get game container
    const gameContainer = document.getElementById('gameContainer');
    if (!gameContainer) {
      console.error("SidebarLayout: Game container not found");
      return false;
    }
    
    // First check if sidebar and main content already exist
    const existingSidebar = gameContainer.querySelector('.game-sidebar');
    const existingMain = gameContainer.querySelector('.game-main');
    
    // If both exist, just store references
    if (existingSidebar && existingMain) {
      this.sidebar = existingSidebar;
      this.mainContent = existingMain;
      
      // Find narrative container
      this.narrativeContainer = existingMain.querySelector('.narrative-container');
      
      console.log("SidebarLayout: Using existing sidebar and main content");
      this.state.domStructureCreated = true;
      return true;
    }
    
    // Need to create layout structure
    console.log("SidebarLayout: Creating new layout structure");
    
    // Clear game container but preserve any header
    const header = gameContainer.querySelector('header');
    
    // Store all existing content to preserve
    const childNodes = Array.from(gameContainer.childNodes);
    gameContainer.innerHTML = '';
    
    // Add header back if it exists
    if (header) {
      gameContainer.appendChild(header);
    } else {
      // Create a new header if missing
      this.createHeader(gameContainer);
    }
    
    // Create sidebar
    this.sidebar = document.createElement('div');
    this.sidebar.className = 'game-sidebar';
    this.sidebar.setAttribute('data-created', Date.now());
    
    // Create main content container
    this.mainContent = document.createElement('div');
    this.mainContent.className = 'game-main';
    this.mainContent.setAttribute('data-created', Date.now());
    
    // Add sidebar and main content to game container
    gameContainer.appendChild(this.sidebar);
    gameContainer.appendChild(this.mainContent);
    
    // Create sidebar content
    this.createSidebarContent();
    
    // Create narrative container in main content
    this.narrativeContainer = document.createElement('div');
    this.narrativeContainer.className = 'narrative-container';
    this.mainContent.appendChild(this.narrativeContainer);
    
    // Find existing narrative and actions
    let narrative = null;
    let actions = null;
    
    childNodes.forEach(node => {
      if (node.id === 'narrative') narrative = node;
      if (node.id === 'actions') actions = node;
    });
    
    // Create narrative element if it doesn't exist
    if (!narrative) {
      narrative = document.createElement('div');
      narrative.id = 'narrative';
      narrative.className = 'narrative';
    }
    
    // Create actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';
    
    // Create actions element if it doesn't exist
    if (!actions) {
      actions = document.createElement('div');
      actions.id = 'actions';
    }
    
    // Add narrative to container
    this.narrativeContainer.appendChild(narrative);
    
    // Add actions container with actions element
    this.narrativeContainer.appendChild(actionsContainer);
    actionsContainer.appendChild(actions);
    
    // Add mobile sidebar toggle
    const sidebarToggle = document.createElement('div');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '☰';
    gameContainer.appendChild(sidebarToggle);
    
    console.log("SidebarLayout: Layout structure created successfully");
    this.state.domStructureCreated = true;
    return true;
  }
  
  /**
   * Create a header if it's missing
   */
  createHeader(gameContainer) {
    const header = document.createElement('header');
    header.innerHTML = `
      <h1>Kasvaari Camp</h1>
      <div id="location">Location: Kasvaari Camp, Western Hierarchate</div>
      <div class="time-display-container">
        <div id="dayNightIndicator" class="day-night-indicator"></div>
        <div class="time-info">
          <div id="timeDisplay">Time: 8:00 AM</div>
          <div id="dayDisplay">Day 1</div>
        </div>
      </div>
    `;
    gameContainer.appendChild(header);
    console.log("SidebarLayout: Created new header");
  }
  
  /**
   * Create the sidebar content
   */
  createSidebarContent() {
    console.log("SidebarLayout: Creating sidebar content");
    
    // Make sure we have the sidebar element
    if (!this.sidebar) {
      console.error("SidebarLayout: Sidebar element not found");
      return false;
    }
    
    // Initial HTML for sidebar
    let sidebarHtml = `
      <div class="character-summary">
        <div class="character-name">${window.player?.name || "Unknown Soldier"}</div>
        <div class="character-details">${window.player?.origin || ''} ${window.player?.career?.title || ''}</div>
      </div>
      
      <div class="quick-status">
        <div class="status-bar">
          <div class="status-label">Health</div>
          <div class="bar-container">
            <div id="sidebarHealthBar" class="bar health-bar" style="width: 100%;"></div>
          </div>
          <div id="sidebarHealthValue" class="bar-value">100/100</div>
        </div>
        <div class="status-bar">
          <div class="status-label">Stamina</div>
          <div class="bar-container">
            <div id="sidebarStaminaBar" class="bar stamina-bar" style="width: 100%;"></div>
          </div>
          <div id="sidebarStaminaValue" class="bar-value">100/100</div>
        </div>
        <div class="status-bar">
          <div class="status-label">Morale</div>
          <div class="bar-container">
            <div id="sidebarMoraleBar" class="bar morale-bar" style="width: 75%;"></div>
          </div>
          <div id="sidebarMoraleValue" class="bar-value">75/100</div>
        </div>
      </div>
      
      <div class="sidebar-nav">
        <button class="sidebar-nav-button" data-action="profile">
          <span class="nav-icon">👤</span> Profile
        </button>
        <button class="sidebar-nav-button" data-action="inventory">
          <span class="nav-icon">🎒</span> Inventory
        </button>
        <button class="sidebar-nav-button" data-action="questLog">
          <span class="nav-icon">📜</span> Quest Log
        </button>
      </div>
    `;
    
    // Set the sidebar content
    this.sidebar.innerHTML = sidebarHtml;
    
    return true;
  }
  
  /**
   * Update status bars with current game state
   */
  updateStatusBars() {
    // Skip if sidebar doesn't exist or game state isn't available
    if (!this.sidebar || !window.gameState) return;
    
    // Get sidebar bars
    const healthBar = document.getElementById('sidebarHealthBar');
    const staminaBar = document.getElementById('sidebarStaminaBar');
    const moraleBar = document.getElementById('sidebarMoraleBar');
    const healthValue = document.getElementById('sidebarHealthValue');
    const staminaValue = document.getElementById('sidebarStaminaValue');
    const moraleValue = document.getElementById('sidebarMoraleValue');
    
    // If any elements are missing, try to update via the status component
    if (!healthBar || !staminaBar || !moraleBar || 
        !healthValue || !staminaValue || !moraleValue) {
      // Defer to status component if available
      if (this.system && this.system.components && this.system.components.status) {
        this.system.components.status.update(window.gameState);
      }
      return;
    }
    
    // Update health bar
    const healthPercent = (window.gameState.health / window.gameState.maxHealth) * 100;
    healthBar.style.width = `${healthPercent}%`;
    healthValue.textContent = `${Math.round(window.gameState.health)}/${window.gameState.maxHealth}`;
    
    // Update stamina bar
    const staminaPercent = (window.gameState.stamina / window.gameState.maxStamina) * 100;
    staminaBar.style.width = `${staminaPercent}%`;
    staminaValue.textContent = `${Math.round(window.gameState.stamina)}/${window.gameState.maxStamina}`;
    
    // Update morale bar
    const moralePercent = window.gameState.morale;
    moraleBar.style.width = `${moralePercent}%`;
    moraleValue.textContent = `${Math.round(window.gameState.morale)}/100`;
  }
  
  /**
   * Set up event listeners for sidebar interactions
   */
  setupEventListeners() {
    // Set up sidebar nav buttons
    if (this.sidebar) {
      const navButtons = this.sidebar.querySelectorAll('.sidebar-nav-button');
      navButtons.forEach(button => {
        // Use event delegation instead of replacing elements
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const action = button.getAttribute('data-action');
          
          // Handle actions based on type
          if (action === 'profile' || action === 'inventory' || action === 'questLog') {
            // Use panel system if available
            if (this.system && this.system.eventBus) {
              this.system.eventBus.publish('panel:toggle', { id: action });
            } else if (typeof window[`handle${action.charAt(0).toUpperCase() + action.slice(1)}`] === 'function') {
              // Fallback to legacy functions
              window[`handle${action.charAt(0).toUpperCase() + action.slice(1)}`]();
            }
          } else if (typeof window.handleAction === 'function') {
            // Use action system for other actions
            window.handleAction(action);
          }
          
          // Close mobile sidebar after clicking an action
          if (this.state.mobile && this.state.mobileSidebarOpen) {
            this.toggleMobileSidebar(false);
          }
        });
      });
    }
    
    // Set up sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleMobileSidebar();
      });
    }
  }
  
  /**
   * Set up window resize handling for responsive behavior
   */
  setupResizeHandling() {
    // Set initial mobile state
    this.checkMobileState();
    
    // Add resize listener
    window.addEventListener('resize', () => {
      this.checkMobileState();
    });
  }
  
  /**
   * Check if we're in mobile mode based on window width
   */
  checkMobileState() {
    const wasInMobile = this.state.mobile;
    this.state.mobile = window.innerWidth <= this.state.breakpoint;
    
    // If transitioning to desktop from mobile, ensure sidebar is visible
    if (wasInMobile && !this.state.mobile) {
      this.state.mobileSidebarOpen = false;
      this.updateMobileSidebarVisibility();
    }
  }
  
  /**
   * Toggle mobile sidebar visibility
   * @param {boolean} state - Force a specific state (optional)
   */
  toggleMobileSidebar(state) {
    if (!this.state.mobile) return;
    
    if (state !== undefined) {
      this.state.mobileSidebarOpen = state;
    } else {
      this.state.mobileSidebarOpen = !this.state.mobileSidebarOpen;
    }
    
    this.updateMobileSidebarVisibility();
  }
  
  /**
   * Update the visibility of the sidebar in mobile mode
   */
  updateMobileSidebarVisibility() {
    if (!this.sidebar) return;
    
    if (this.state.mobile) {
      if (this.state.mobileSidebarOpen) {
        this.sidebar.classList.add('show');
      } else {
        this.sidebar.classList.remove('show');
      }
    } else {
      // Always show in desktop mode
      this.sidebar.classList.remove('show');
    }
  }
  
  /**
   * Setup event subscriptions
   */
  setupEventSubscriptions() {
    if (!this.system || !this.system.eventBus) return;
    
    // Subscribe to status bar update events
    this.system.eventBus.subscribe('status:update', (data) => {
      this.updateStatusBars();
    });
    
    // Subscribe to player update events
    this.system.eventBus.subscribe('player:updated', (data) => {
      this.updateSidebar();
    });
    
    // Subscribe to game start event
    this.system.eventBus.subscribe('game:started', (data) => {
      this.updateSidebar();
    });
    
    // Subscribe to DOM query events - other components can ask for elements
    this.system.eventBus.subscribe('dom:query', (query) => {
      if (query.type === 'getElement') {
        const element = this.getElement(query.id);
        this.system.eventBus.publish('dom:response', {
          requestId: query.requestId,
          element: element
        });
      }
    });
  }
  
  /**
   * Get a DOM element from the layout
   * @param {string} elementId - ID of the element to get
   * @returns {HTMLElement|null} - The requested element or null
   */
  getElement(elementId) {
    switch (elementId) {
      case 'sidebar':
        return this.sidebar;
      case 'mainContent':
        return this.mainContent;
      case 'narrativeContainer':
        return this.narrativeContainer;
      case 'narrative':
        return document.getElementById('narrative');
      case 'actions':
        return document.getElementById('actions');
      default:
        return document.getElementById(elementId);
    }
  }
  
  /**
   * Update the sidebar content with player data
   */
  updateSidebar() {
    // Only update if sidebar exists
    if (!this.sidebar) return;
    
    // Update character summary
    if (window.player) {
      const nameElem = this.sidebar.querySelector('.character-name');
      const detailsElem = this.sidebar.querySelector('.character-details');
      
      if (nameElem && window.player.name) {
        nameElem.textContent = window.player.name;
      }
      
      if (detailsElem) {
        const origin = window.player.origin || '';
        const career = window.player.career ? window.player.career.title || '' : '';
        detailsElem.textContent = `${origin} ${career}`;
      }
    }
    
    // Update status bars
    this.updateStatusBars();
    
    console.log("SidebarLayout: Sidebar content updated");
  }

  /**
   * Add CSS styles for the layout
   */
  addLayoutStyles() {
    // Check if styles already exist
    if (document.getElementById('sidebar-layout-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'sidebar-layout-styles';
    
    // Add CSS rules
    style.textContent = `
      /* Game container with sidebar and central content */
      #gameContainer {
        display: grid;
        grid-template-columns: 250px 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          "header header"
          "sidebar main";
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
        height: calc(100vh - 40px);
        padding: 20px;
        min-height: 100vh;
      }
      
      /* Header area */
      header {
        grid-area: header;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background: var(--panel-bg, #1e293b);
        border-bottom: 2px solid var(--paanic-gold, #c9a959);
        margin-bottom: 20px;
        border-radius: 8px;
      }
      
      /* Sidebar */
      .game-sidebar {
        grid-area: sidebar;
        background: var(--panel-bg, #1e293b);
        border: 1px solid var(--panel-border, #3a2e40);
        border-radius: 8px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        position: relative;
        transition: transform 0.3s ease;
      }
      
      /* Main content area */
      .game-main {
        grid-area: main;
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
      }
      
      /* Narrative container */
      .narrative-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      /* Actions container */
      .actions-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        background: var(--panel-bg, #1e293b);
        border-radius: 8px;
        padding: 15px;
      }
      
      /* Sidebar toggle button (mobile only) */
      .sidebar-toggle {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1001;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--paanic-accent, #b02e26);
        color: white;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        cursor: pointer;
      }
      
      /* Character summary in sidebar */
      .character-summary {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--panel-border, #3a2e40);
      }
      
      .character-name {
        font-size: 1.4em;
        font-weight: bold;
        color: var(--paanic-gold, #c9a959);
      }
      
      .character-details {
        font-size: 0.9em;
        color: var(--text-secondary, #a0a0a0);
      }
      
      /* Quick status in sidebar */
      .quick-status {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 15px 0;
      }
      
      .status-bar {
        display: flex;
        align-items: center;
      }
      
      .status-label {
        width: 60px;
        font-weight: bold;
        font-size: 0.9em;
      }
      
      .bar-container {
        flex-grow: 1;
        height: 12px;
        background: #333;
        border-radius: 6px;
        overflow: hidden;
        margin: 0 8px;
      }
      
      .bar {
        height: 100%;
        border-radius: 6px;
        transition: width 0.3s ease;
      }
      
      .health-bar { background: var(--health-color, linear-gradient(to right, #ff5f6d, #ffc371)); }
      .stamina-bar { background: var(--stamina-color, linear-gradient(to right, #56ab2f, #a8e063)); }
      .morale-bar { background: var(--morale-color, linear-gradient(to right, #4776E6, #8E54E9)); }
      
      .bar-value {
        width: 60px;
        text-align: right;
        font-size: 0.9em;
      }
      
      /* Sidebar navigation buttons */
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .sidebar-nav-button {
        text-align: left;
        padding: 10px 15px;
        background: var(--button-primary, #3a2e40);
        color: var(--text-primary, #e0e0e0);
        border: none;
        border-left: 3px solid transparent;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .sidebar-nav-button:hover {
        background: var(--button-hover, #4d3e54);
        border-left: 3px solid var(--paanic-gold, #c9a959);
      }
      
      .sidebar-nav-button.active {
        background: var(--button-active, #5d4b66);
        border-left: 3px solid var(--paanic-gold, #c9a959);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        #gameContainer {
          grid-template-columns: 1fr;
          grid-template-areas:
            "header"
            "main";
        }
        
        .game-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 250px;
          transform: translateX(-100%);
          z-index: 1000;
        }
        
        .game-sidebar.show {
          transform: translateX(0);
        }
        
        .game-main {
          margin-left: 0;
        }
        
        .sidebar-toggle {
          display: flex;
        }
      }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    console.log("SidebarLayout: Added layout styles");
  }

  /**
   * Update method called by the UI system
   */
  update(data) {
    // Update status bars
    this.updateStatusBars();
    
    // Update sidebar content if player data is included
    if (data && data.player) {
      this.updateSidebar();
    }
  }
}

// Export the component
window.SidebarLayout = SidebarLayout;
