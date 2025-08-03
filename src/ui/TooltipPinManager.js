/**
 * Tooltip Pin Manager for handling tooltip pin and dismiss functionality
 */

/**
 * Tooltip Pin Manager class
 */
export class TooltipPinManager {
    /**
     * Create a new Tooltip Pin Manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.config = {
            enablePinning: true,
            enableDismiss: true,
            pinButtonClass: 'tooltip-pin-button',
            dismissButtonClass: 'tooltip-dismiss-button',
            pinnedTooltipClass: 'tooltip-pinned',
            maxPinnedTooltips: 3,
            pinShortcut: 'p', // Keyboard shortcut to pin tooltip
            dismissShortcut: 'Escape', // Keyboard shortcut to dismiss tooltip
            autoDismissTimeout: 30000, // Auto-dismiss pinned tooltips after 30 seconds
            showPinButton: true,
            showDismissButton: true,
            ...config
        };

        // State
        this.isInitialized = false;
        this.tooltipManager = null;
        
        // Pinned tooltips
        this.pinnedTooltips = new Map();
        this.pinnedTooltipElements = new Map();
        
        // Auto-dismiss timers
        this.autoDismissTimers = new Map();
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Keyboard shortcuts
        this.keyboardShortcuts = new Map();
        
        // Pin positions
        this.pinPositions = [
            { top: '20px', left: '20px' },
            { top: '20px', right: '20px' },
            { bottom: '20px', left: '20px' },
            { bottom: '20px', right: '20px' }
        ];
        this.usedPinPositions = new Set();
    }

    /**
     * Initialize the pin manager
     * @param {Object} tooltipManager - Tooltip manager instance
     * @returns {Promise<void>}
     */
    async initialize(tooltipManager) {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Tooltip Pin Manager...');
            
            this.tooltipManager = tooltipManager;
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Create pin container
            this.createPinContainer();
            
            this.isInitialized = true;
            console.log('Tooltip Pin Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Tooltip Pin Manager:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.tooltipManager) return;
        
        // Listen for tooltip shown events
        this.tooltipManager.on('tooltipShown', (data) => {
            this.onTooltipShown(data);
        });
        
        // Listen for tooltip hidden events
        this.tooltipManager.on('tooltipHidden', (data) => {
            this.onTooltipHidden(data);
        });
        
        // Listen for tooltip updated events
        this.tooltipManager.on('tooltipUpdated', (data) => {
            this.onTooltipUpdated(data);
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        if (!this.config.enablePinning && !this.config.enableDismiss) return;
        
        const handleKeyDown = (event) => {
            // Pin tooltip with 'p' key
            if (this.config.enablePinning && event.key === this.config.pinShortcut) {
                this.pinActiveTooltip();
            }
            
            // Dismiss tooltip with 'Escape' key
            if (this.config.enableDismiss && event.key === this.config.dismissShortcut) {
                this.dismissActiveTooltip();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        this.eventListeners.set('keydown', handleKeyDown);
    }

    /**
     * Create pin container
     */
    createPinContainer() {
        let pinContainer = document.getElementById('tooltip-pin-container');
        
        if (!pinContainer) {
            pinContainer = document.createElement('div');
            pinContainer.id = 'tooltip-pin-container';
            pinContainer.className = 'tooltip-pin-container';
            document.body.appendChild(pinContainer);
        }
        
        this.pinContainer = pinContainer;
    }

    /**
     * Handle tooltip shown event
     * @param {Object} data - Event data
     */
    onTooltipShown(data) {
        if (!this.config.enablePinning) return;
        
        const { id, type, position } = data;
        
        // Add pin and dismiss buttons to tooltip
        this.addControlButtons(id);
    }

    /**
     * Handle tooltip hidden event
     * @param {Object} data - Event data
     */
    onTooltipHidden(data) {
        const { id } = data;
        
        // Remove from pinned tooltips if it was pinned
        if (this.pinnedTooltips.has(id)) {
            this.unpinTooltip(id);
        }
    }

    /**
     * Handle tooltip updated event
     * @param {Object} data - Event data
     */
    onTooltipUpdated(data) {
        const { id, updates } = data;
        
        // Update pinned tooltip if it exists
        if (this.pinnedTooltips.has(id) && updates.content) {
            this.updatePinnedTooltip(id, updates.content);
        }
    }

    /**
     * Add control buttons to tooltip
     * @param {string} tooltipId - Tooltip ID
     */
    addControlButtons(tooltipId) {
        const tooltipElement = document.getElementById(`tooltip-${tooltipId}`);
        if (!tooltipElement) return;
        
        // Check if buttons already exist
        if (tooltipElement.querySelector('.tooltip-controls')) return;
        
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'tooltip-controls';
        
        // Add pin button
        if (this.config.showPinButton && this.config.enablePinning) {
            const pinButton = document.createElement('button');
            pinButton.className = `tooltip-button ${this.config.pinButtonClass}`;
            pinButton.innerHTML = '📌';
            pinButton.title = 'Pin tooltip (P)';
            pinButton.setAttribute('aria-label', 'Pin tooltip');
            
            pinButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.pinTooltip(tooltipId);
            });
            
            controlsContainer.appendChild(pinButton);
        }
        
        // Add dismiss button
        if (this.config.showDismissButton && this.config.enableDismiss) {
            const dismissButton = document.createElement('button');
            dismissButton.className = `tooltip-button ${this.config.dismissButtonClass}`;
            dismissButton.innerHTML = '✕';
            dismissButton.title = 'Dismiss tooltip (Esc)';
            dismissButton.setAttribute('aria-label', 'Dismiss tooltip');
            
            dismissButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.dismissTooltip(tooltipId);
            });
            
            controlsContainer.appendChild(dismissButton);
        }
        
        tooltipElement.appendChild(controlsContainer);
    }

    /**
     * Pin tooltip
     * @param {string} tooltipId - Tooltip ID
     * @returns {boolean} True if successfully pinned
     */
    pinTooltip(tooltipId) {
        if (!this.config.enablePinning) return false;
        
        // Check if already pinned
        if (this.pinnedTooltips.has(tooltipId)) return false;
        
        // Check max pinned tooltips limit
        if (this.pinnedTooltips.size >= this.config.maxPinnedTooltips) {
            // Remove oldest pinned tooltip
            const oldestTooltipId = this.pinnedTooltips.keys().next().value;
            this.unpinTooltip(oldestTooltipId);
        }
        
        // Get original tooltip element
        const originalTooltip = document.getElementById(`tooltip-${tooltipId}`);
        if (!originalTooltip) return false;
        
        // Clone tooltip for pinning
        const pinnedTooltip = originalTooltip.cloneNode(true);
        pinnedTooltip.id = `pinned-tooltip-${tooltipId}`;
        pinnedTooltip.className += ` ${this.config.pinnedTooltipClass}`;
        
        // Get pin position
        const position = this.getPinPosition();
        
        // Apply position
        for (const [property, value] of Object.entries(position)) {
            pinnedTooltip.style[property] = value;
        }
        
        // Add to pin container
        this.pinContainer.appendChild(pinnedTooltip);
        
        // Store pinned tooltip data
        this.pinnedTooltips.set(tooltipId, {
            id: tooltipId,
            element: pinnedTooltip,
            position: position,
            timestamp: Date.now()
        });
        
        this.pinnedTooltipElements.set(tooltipId, pinnedTooltip);
        
        // Setup auto-dismiss timer
        if (this.config.autoDismissTimeout > 0) {
            this.setupAutoDismiss(tooltipId);
        }
        
        // Add event listeners to pinned tooltip
        this.setupPinnedTooltipEvents(pinnedTooltip, tooltipId);
        
        // Hide original tooltip
        if (this.tooltipManager) {
            this.tooltipManager.hide(tooltipId);
        }
        
        // Emit event
        if (this.tooltipManager) {
            this.tooltipManager.emit('tooltipPinned', { id: tooltipId, position });
        }
        
        return true;
    }

    /**
     * Unpin tooltip
     * @param {string} tooltipId - Tooltip ID
     * @returns {boolean} True if successfully unpinned
     */
    unpinTooltip(tooltipId) {
        if (!this.pinnedTooltips.has(tooltipId)) return false;
        
        // Get pinned tooltip data
        const pinnedData = this.pinnedTooltips.get(tooltipId);
        
        // Remove element
        if (pinnedData.element && pinnedData.element.parentNode) {
            pinnedData.element.remove();
        }
        
        // Free up position
        this.usedPinPositions.delete(pinnedData.position);
        
        // Clear auto-dismiss timer
        if (this.autoDismissTimers.has(tooltipId)) {
            clearTimeout(this.autoDismissTimers.get(tooltipId));
            this.autoDismissTimers.delete(tooltipId);
        }
        
        // Remove from storage
        this.pinnedTooltips.delete(tooltipId);
        this.pinnedTooltipElements.delete(tooltipId);
        
        // Emit event
        if (this.tooltipManager) {
            this.tooltipManager.emit('tooltipUnpinned', { id: tooltipId });
        }
        
        return true;
    }

    /**
     * Dismiss tooltip
     * @param {string} tooltipId - Tooltip ID
     * @returns {boolean} True if successfully dismissed
     */
    dismissTooltip(tooltipId) {
        if (!this.config.enableDismiss) return false;
        
        // Check if it's a pinned tooltip
        if (this.pinnedTooltips.has(tooltipId)) {
            return this.unpinTooltip(tooltipId);
        }
        
        // Otherwise, hide regular tooltip
        if (this.tooltipManager) {
            this.tooltipManager.hide(tooltipId);
            return true;
        }
        
        return false;
    }

    /**
     * Pin active tooltip
     * @returns {boolean} True if successfully pinned
     */
    pinActiveTooltip() {
        if (!this.tooltipManager) return false;
        
        // Get active tooltip
        const activeTooltip = this.tooltipManager.getActiveTooltip();
        if (!activeTooltip) return false;
        
        return this.pinTooltip(activeTooltip.id);
    }

    /**
     * Dismiss active tooltip
     * @returns {boolean} True if successfully dismissed
     */
    dismissActiveTooltip() {
        if (!this.tooltipManager) return false;
        
        // Get active tooltip
        const activeTooltip = this.tooltipManager.getActiveTooltip();
        if (!activeTooltip) return false;
        
        return this.dismissTooltip(activeTooltip.id);
    }

    /**
     * Get pin position
     * @returns {Object} Position object
     */
    getPinPosition() {
        // Find available position
        for (const position of this.pinPositions) {
            const positionKey = JSON.stringify(position);
            if (!this.usedPinPositions.has(positionKey)) {
                this.usedPinPositions.add(positionKey);
                return position;
            }
        }
        
        // If no positions available, use default
        return { top: '20px', left: '20px' };
    }

    /**
     * Setup auto-dismiss timer
     * @param {string} tooltipId - Tooltip ID
     */
    setupAutoDismiss(tooltipId) {
        const timer = setTimeout(() => {
            this.unpinTooltip(tooltipId);
        }, this.config.autoDismissTimeout);
        
        this.autoDismissTimers.set(tooltipId, timer);
    }

    /**
     * Setup pinned tooltip events
     * @param {HTMLElement} pinnedTooltip - Pinned tooltip element
     * @param {string} tooltipId - Tooltip ID
     */
    setupPinnedTooltipEvents(pinnedTooltip, tooltipId) {
        // Add click event to dismiss
        pinnedTooltip.addEventListener('click', (event) => {
            // Only dismiss if clicking on the tooltip background, not on content
            if (event.target === pinnedTooltip) {
                this.unpinTooltip(tooltipId);
            }
        });
        
        // Add mouse enter event to reset auto-dismiss timer
        pinnedTooltip.addEventListener('mouseenter', () => {
            if (this.autoDismissTimers.has(tooltipId)) {
                clearTimeout(this.autoDismissTimers.get(tooltipId));
                this.autoDismissTimers.delete(tooltipId);
            }
        });
        
        // Add mouse leave event to restart auto-dismiss timer
        pinnedTooltip.addEventListener('mouseleave', () => {
            if (this.config.autoDismissTimeout > 0) {
                this.setupAutoDismiss(tooltipId);
            }
        });
    }

    /**
     * Update pinned tooltip content
     * @param {string} tooltipId - Tooltip ID
     * @param {Object} content - New content
     */
    updatePinnedTooltip(tooltipId, content) {
        const pinnedTooltip = this.pinnedTooltipElements.get(tooltipId);
        if (!pinnedTooltip) return;
        
        // Update content (implementation depends on tooltip structure)
        const contentElement = pinnedTooltip.querySelector('.tooltip-content');
        if (contentElement) {
            // Update content based on structure
            if (content.name) {
                const nameElement = contentElement.querySelector('.tooltip-name');
                if (nameElement) nameElement.textContent = content.name;
            }
            
            if (content.description) {
                const descElement = contentElement.querySelector('.tooltip-description');
                if (descElement) descElement.textContent = content.description;
            }
            
            if (content.details) {
                const detailsElement = contentElement.querySelector('.tooltip-details');
                if (detailsElement) {
                    detailsElement.innerHTML = '';
                    if (Array.isArray(content.details)) {
                        for (const detail of content.details) {
                            const detailItem = document.createElement('div');
                            detailItem.className = 'tooltip-detail';
                            detailItem.textContent = detail;
                            detailsElement.appendChild(detailItem);
                        }
                    }
                }
            }
        }
    }

    /**
     * Get all pinned tooltips
     * @returns {Array} Array of pinned tooltip data
     */
    getPinnedTooltips() {
        return Array.from(this.pinnedTooltips.values());
    }

    /**
     * Check if tooltip is pinned
     * @param {string} tooltipId - Tooltip ID
     * @returns {boolean} True if pinned
     */
    isTooltipPinned(tooltipId) {
        return this.pinnedTooltips.has(tooltipId);
    }

    /**
     * Get number of pinned tooltips
     * @returns {number} Number of pinned tooltips
     */
    getPinnedTooltipCount() {
        return this.pinnedTooltips.size;
    }

    /**
     * Dismiss all pinned tooltips
     */
    dismissAllPinnedTooltips() {
        for (const tooltipId of this.pinnedTooltips.keys()) {
            this.unpinTooltip(tooltipId);
        }
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        
        // Update max pinned tooltips if reduced
        if (config.maxPinnedTooltips !== undefined && 
            config.maxPinnedTooltips < this.pinnedTooltips.size) {
            const tooltipsToRemove = this.pinnedTooltips.size - config.maxPinnedTooltips;
            const tooltipIds = Array.from(this.pinnedTooltips.keys()).slice(0, tooltipsToRemove);
            
            for (const tooltipId of tooltipIds) {
                this.unpinTooltip(tooltipId);
            }
        }
    }

    /**
     * Destroy the pin manager
     */
    destroy() {
        // Dismiss all pinned tooltips
        this.dismissAllPinnedTooltips();
        
        // Remove event listeners
        for (const [event, listener] of this.eventListeners) {
            document.removeEventListener(event, listener);
        }
        this.eventListeners.clear();
        
        // Clear auto-dismiss timers
        for (const timer of this.autoDismissTimers.values()) {
            clearTimeout(timer);
        }
        this.autoDismissTimers.clear();
        
        // Remove pin container
        if (this.pinContainer && this.pinContainer.parentNode) {
            this.pinContainer.remove();
        }
        
        // Clear storage
        this.pinnedTooltips.clear();
        this.pinnedTooltipElements.clear();
        this.usedPinPositions.clear();
        
        console.log('Tooltip Pin Manager destroyed');
    }
}