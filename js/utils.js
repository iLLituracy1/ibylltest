/**
 * Viking Legacy - Utility Functions
 * Contains helper functions used across the game
 */

const Utils = {
    /**
     * Generate a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random number between min and max
     */
    randomBetween: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Calculate the probability of an event occurring
     * @param {number} percentage - Chance of occurrence (0-100)
     * @returns {boolean} - Whether the event occurred
     */
    chanceOf: function(percentage) {
        return Math.random() * 100 < percentage;
    },
    
    /**
     * Safely update the text content of an element
     * @param {string} elementId - ID of the element to update
     * @param {string|number} value - New value for the element
     */
    updateElement: function(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
        // Removed the warning to avoid console spam
    },
    
    /**
     * Add a message to the game log
     * @param {string} message - Message to add
     * @param {string} [type="normal"] - Type of message (normal, important, success, danger)
     */
    log: function(message, type = "normal") {
        const gameLog = document.getElementById('game-log');
        
        if (!gameLog) {
            // Silently handle missing game log
            return;
        }
        
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        
        // Apply classes based on message type
        if (type === "important") {
            logEntry.classList.add('log-important');
        } else if (type === "success") {
            logEntry.classList.add('log-success');
        } else if (type === "danger") {
            logEntry.classList.add('log-danger');
        }
        
        // Add to the top of the log
        gameLog.insertBefore(logEntry, gameLog.firstChild);
        
        // Limit log entries to prevent excessive DOM nodes
        while (gameLog.children.length > 50) {
            gameLog.removeChild(gameLog.lastChild);
        }
    },
    
    /**
     * Format a date object into a game date string
     * @param {Object} gameDate - Object containing year, day, month, and season
     * @returns {string} - Formatted date string
     */
    formatGameDate: function(gameDate) {
        return `Year ${gameDate.year}, Day ${gameDate.day} - ${gameDate.monthName} (${gameDate.season})`;
    },
    
    /**
     * Generate a Viking name
     * @param {string} gender - Gender of the character ('male' or 'female')
     * @returns {string} - Generated name
     */
    generateVikingName: function(gender) {
        const maleNames = [
            "Ragnar", "Bjorn", "Leif", "Erik", "Harald", "Ivar", 
            "Olaf", "Rollo", "Gunnar", "Thorvald", "Ulf", "Orm"
        ];
        
        const femaleNames = [
            "Freya", "Astrid", "Sigrid", "Helga", "Ingrid", "Thyra", 
            "Gudrun", "Solveig", "Sif", "Svanhild", "Ragna", "Hilda"
        ];
        
        const surnames = [
            "Haraldson", "Erikson", "Bjornson", "Ragnarson", "Leifson",
            "Thorvaldson", "Ulfson", "Ormson", "Ivarson", "Olafson"
        ];
        
        // Select appropriate name list
        const nameList = gender === 'female' ? femaleNames : maleNames;
        
        // Generate name
        const firstName = nameList[this.randomBetween(0, nameList.length - 1)];
        const surname = surnames[this.randomBetween(0, surnames.length - 1)];
        
        return `${firstName} ${surname}`;
    },
    
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} - Cloned object
     */
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Toggle button state
     * @param {string} buttonId - ID of the button
     * @param {boolean} enabled - Whether the button should be enabled
     */
    toggleButton: function(buttonId, enabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !enabled;
        }
    },
    
    /**
     * Add event listeners to multiple elements
     * @param {string} selector - CSS selector for elements
     * @param {string} event - Event type to listen for
     * @param {Function} handler - Event handler function
     */
    addEventListeners: function(selector, event, handler) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener(event, handler);
        });
    }
};