/**
 * DataManager class
 * Handles data loading, saving, and management for the simulation
 */

import { EventSystem } from '../utils/index.js';
import { 
    createSolarSystem, 
    serializeSolarSystem, 
    deserializeSolarSystem 
} from '../celestial/index.js';

/**
 * DataManager class
 */
export class DataManager {
    /**
     * Create a new DataManager
     * @param {Object} options - Options for the DataManager
     */
    constructor(options = {}) {
        this.eventSystem = options.eventSystem || new EventSystem();
        this.data = {};
        this.loaded = false;
        this.autoSave = options.autoSave !== false;
        this.autoSaveInterval = options.autoSaveInterval || 60000; // 1 minute
        this.autoSaveTimer = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the DataManager
     */
    init() {
        // Set up auto-save
        if (this.autoSave) {
            this.startAutoSave();
        }
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for data change events
        this.eventSystem.on('data:changed', this.onDataChanged.bind(this));
        
        // Listen for save events
        this.eventSystem.on('data:save', this.save.bind(this));
        
        // Listen for load events
        this.eventSystem.on('data:load', this.load.bind(this));
        
        // Listen for export events
        this.eventSystem.on('data:export', this.exportData.bind(this));
        
        // Listen for import events
        this.eventSystem.on('data:import', this.importData.bind(this));
    }
    
    /**
     * Handle data changed event
     * @param {Object} eventData - Event data
     */
    onDataChanged(eventData) {
        const { key, value } = eventData;
        
        // Update data
        this.data[key] = value;
        
        // Emit data updated event
        this.eventSystem.emit('data:updated', { key, value });
    }
    
    /**
     * Start auto-save
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.save();
        }, this.autoSaveInterval);
    }
    
    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    /**
     * Save data to local storage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    saveToLocalStorage(key = 'simulationData') {
        try {
            const serializedData = JSON.stringify(this.data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Error saving to local storage:', error);
            this.eventSystem.emit('data:saveError', { error, storage: 'local' });
            return false;
        }
    }
    
    /**
     * Load data from local storage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    loadFromLocalStorage(key = 'simulationData') {
        try {
            const serializedData = localStorage.getItem(key);
            
            if (serializedData) {
                this.data = JSON.parse(serializedData);
                this.loaded = true;
                this.eventSystem.emit('data:loaded', { data: this.data, storage: 'local' });
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading from local storage:', error);
            this.eventSystem.emit('data:loadError', { error, storage: 'local' });
            return false;
        }
    }
    
    /**
     * Save data to a file
     * @param {string} filename - Filename to save to
     * @returns {boolean} True if successful
     */
    saveToFile(filename = 'simulation.json') {
        try {
            const serializedData = JSON.stringify(this.data, null, 2);
            const blob = new Blob([serializedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.eventSystem.emit('data:savedToFile', { filename });
            return true;
        } catch (error) {
            console.error('Error saving to file:', error);
            this.eventSystem.emit('data:saveError', { error, storage: 'file' });
            return false;
        }
    }
    
    /**
     * Load data from a file
     * @param {File} file - File to load from
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const serializedData = event.target.result;
                    this.data = JSON.parse(serializedData);
                    this.loaded = true;
                    this.eventSystem.emit('data:loaded', { data: this.data, storage: 'file', filename: file.name });
                    resolve(true);
                } catch (error) {
                    console.error('Error loading from file:', error);
                    this.eventSystem.emit('data:loadError', { error, storage: 'file', filename: file.name });
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                const error = new Error('Failed to read file');
                console.error('Error reading file:', error);
                this.eventSystem.emit('data:loadError', { error, storage: 'file', filename: file.name });
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Save data to a server
     * @param {string} url - Server URL
     * @param {Object} options - Fetch options
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    saveToServer(url, options = {}) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(this.data),
            ...options
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            this.eventSystem.emit('data:savedToServer', { url, data });
            return true;
        })
        .catch(error => {
            console.error('Error saving to server:', error);
            this.eventSystem.emit('data:saveError', { error, storage: 'server', url });
            throw error;
        });
    }
    
    /**
     * Load data from a server
     * @param {string} url - Server URL
     * @param {Object} options - Fetch options
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    loadFromServer(url, options = {}) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            this.data = data;
            this.loaded = true;
            this.eventSystem.emit('data:loaded', { data: this.data, storage: 'server', url });
            return true;
        })
        .catch(error => {
            console.error('Error loading from server:', error);
            this.eventSystem.emit('data:loadError', { error, storage: 'server', url });
            throw error;
        });
    }
    
    /**
     * Save data
     * @param {Object} options - Save options
     * @returns {boolean|Promise<boolean>} True if successful
     */
    save(options = {}) {
        const { storage = 'local', key, filename, url } = options;
        
        switch (storage) {
            case 'local':
                return this.saveToLocalStorage(key);
            case 'file':
                return this.saveToFile(filename);
            case 'server':
                return this.saveToServer(url, options);
            default:
                console.error(`Unknown storage type: ${storage}`);
                return false;
        }
    }
    
    /**
     * Load data
     * @param {Object} options - Load options
     * @returns {boolean|Promise<boolean>} True if successful
     */
    load(options = {}) {
        const { storage = 'local', key, file, url } = options;
        
        switch (storage) {
            case 'local':
                return this.loadFromLocalStorage(key);
            case 'file':
                return this.loadFromFile(file);
            case 'server':
                return this.loadFromServer(url, options);
            default:
                console.error(`Unknown storage type: ${storage}`);
                return false;
        }
    }
    
    /**
     * Export data
     * @param {Object} options - Export options
     * @returns {boolean|Promise<boolean>} True if successful
     */
    exportData(options = {}) {
        const { format = 'json', filename = 'simulation' } = options;
        
        switch (format) {
            case 'json':
                return this.saveToFile(`${filename}.json`);
            case 'csv':
                return this.exportToCSV(`${filename}.csv`);
            case 'xml':
                return this.exportToXML(`${filename}.xml`);
            default:
                console.error(`Unknown export format: ${format}`);
                return false;
        }
    }
    
    /**
     * Import data
     * @param {Object} options - Import options
     * @returns {boolean|Promise<boolean>} True if successful
     */
    importData(options = {}) {
        const { file } = options;
        
        if (!file) {
            console.error('No file provided for import');
            return false;
        }
        
        return this.loadFromFile(file);
    }
    
    /**
     * Export data to CSV
     * @param {string} filename - Filename to save to
     * @returns {boolean} True if successful
     */
    exportToCSV(filename) {
        try {
            let csvContent = '';
            
            // Convert data to CSV format
            if (this.data.solarSystem) {
                csvContent = this.solarSystemToCSV(this.data.solarSystem);
            } else {
                csvContent = this.objectToCSV(this.data);
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.eventSystem.emit('data:exported', { format: 'csv', filename });
            return true;
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            this.eventSystem.emit('data:exportError', { error, format: 'csv' });
            return false;
        }
    }
    
    /**
     * Export data to XML
     * @param {string} filename - Filename to save to
     * @returns {boolean} True if successful
     */
    exportToXML(filename) {
        try {
            let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
            
            // Convert data to XML format
            if (this.data.solarSystem) {
                xmlContent += this.solarSystemToXML(this.data.solarSystem);
            } else {
                xmlContent += this.objectToXML(this.data, 'data');
            }
            
            const blob = new Blob([xmlContent], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.eventSystem.emit('data:exported', { format: 'xml', filename });
            return true;
        } catch (error) {
            console.error('Error exporting to XML:', error);
            this.eventSystem.emit('data:exportError', { error, format: 'xml' });
            return false;
        }
    }
    
    /**
     * Convert solar system to CSV
     * @param {Object} solarSystem - Solar system object
     * @returns {string} CSV content
     */
    solarSystemToCSV(solarSystem) {
        let csv = 'Name,Type,Mass,Radius,Position X,Position Y,Position Z,Velocity X,Velocity Y,Velocity Z\n';
        
        for (const body of solarSystem.bodies) {
            csv += `${body.name},${body.type},${body.mass},${body.radius},${body.position.x},${body.position.y},${body.position.z},${body.velocity.x},${body.velocity.y},${body.velocity.z}\n`;
        }
        
        return csv;
    }
    
    /**
     * Convert object to CSV
     * @param {Object} obj - Object to convert
     * @returns {string} CSV content
     */
    objectToCSV(obj) {
        let csv = 'Key,Value\n';
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key];
                csv += `${key},"${value}"\n`;
            }
        }
        
        return csv;
    }
    
    /**
     * Convert solar system to XML
     * @param {Object} solarSystem - Solar system object
     * @returns {string} XML content
     */
    solarSystemToXML(solarSystem) {
        let xml = `<solarSystem name="${solarSystem.name}">\n`;
        
        for (const body of solarSystem.bodies) {
            xml += `  <body>\n`;
            xml += `    <name>${body.name}</name>\n`;
            xml += `    <type>${body.type}</type>\n`;
            xml += `    <mass>${body.mass}</mass>\n`;
            xml += `    <radius>${body.radius}</radius>\n`;
            xml += `    <position>\n`;
            xml += `      <x>${body.position.x}</x>\n`;
            xml += `      <y>${body.position.y}</y>\n`;
            xml += `      <z>${body.position.z}</z>\n`;
            xml += `    </position>\n`;
            xml += `    <velocity>\n`;
            xml += `      <x>${body.velocity.x}</x>\n`;
            xml += `      <y>${body.velocity.y}</y>\n`;
            xml += `      <z>${body.velocity.z}</z>\n`;
            xml += `    </velocity>\n`;
            xml += `  </body>\n`;
        }
        
        xml += `</solarSystem>\n`;
        
        return xml;
    }
    
    /**
     * Convert object to XML
     * @param {Object} obj - Object to convert
     * @param {string} rootName - Root element name
     * @returns {string} XML content
     */
    objectToXML(obj, rootName) {
        let xml = `<${rootName}>\n`;
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                if (typeof value === 'object' && value !== null) {
                    xml += this.objectToXML(value, key);
                } else {
                    xml += `  <${key}>${value}</${key}>\n`;
                }
            }
        }
        
        xml += `</${rootName}>\n`;
        
        return xml;
    }
    
    /**
     * Get data
     * @param {string} key - Data key
     * @returns {*} Data value
     */
    get(key) {
        return this.data[key];
    }
    
    /**
     * Set data
     * @param {string} key - Data key
     * @param {*} value - Data value
     */
    set(key, value) {
        this.data[key] = value;
        this.eventSystem.emit('data:changed', { key, value });
    }
    
    /**
     * Get all data
     * @returns {Object} All data
     */
    getAll() {
        return { ...this.data };
    }
    
    /**
     * Set all data
     * @param {Object} data - Data to set
     */
    setAll(data) {
        this.data = { ...data };
        this.loaded = true;
        this.eventSystem.emit('data:changed', { key: 'all', value: data });
    }
    
    /**
     * Clear data
     */
    clear() {
        this.data = {};
        this.loaded = false;
        this.eventSystem.emit('data:cleared');
    }
    
    /**
     * Check if data is loaded
     * @returns {boolean} True if data is loaded
     */
    isLoaded() {
        return this.loaded;
    }
    
    /**
     * Destroy the DataManager
     */
    destroy() {
        // Stop auto-save
        this.stopAutoSave();
        
        // Remove event listeners
        this.eventSystem.off('data:changed', this.onDataChanged);
        this.eventSystem.off('data:save', this.save);
        this.eventSystem.off('data:load', this.load);
        this.eventSystem.off('data:export', this.exportData);
        this.eventSystem.off('data:import', this.importData);
        
        // Clear data
        this.clear();
    }
}