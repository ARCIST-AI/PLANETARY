/**
 * WorkerManager class
 * Manages web workers for parallel processing
 */

import { EventSystem } from '../utils/index.js';

/**
 * WorkerManager class
 */
export class WorkerManager {
    /**
     * Create a new WorkerManager
     * @param {Object} options - Options for the WorkerManager
     */
    constructor(options = {}) {
        this.eventSystem = options.eventSystem || new EventSystem();
        this.workers = new Map();
        this.workerCount = options.workerCount || navigator.hardwareConcurrency || 4;
        this.workerScript = options.workerScript || 'src/workers/SimulationWorker.js';
        this.taskQueue = [];
        this.activeTasks = new Map();
        this.taskIdCounter = 0;
        this.initialized = false;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the WorkerManager
     */
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize workers
        this.initializeWorkers();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for worker task events
        this.eventSystem.on('worker:task', this.onTaskReceived.bind(this));
        
        // Listen for worker result events
        this.eventSystem.on('worker:result', this.onResultReceived.bind(this));
        
        // Listen for worker error events
        this.eventSystem.on('worker:error', this.onErrorReceived.bind(this));
    }
    
    /**
     * Initialize workers
     */
    initializeWorkers() {
        // Create workers
        for (let i = 0; i < this.workerCount; i++) {
            this.createWorker(i);
        }
        
        this.initialized = true;
        this.eventSystem.emit('worker:initialized', { workerCount: this.workerCount });
    }
    
    /**
     * Create a worker
     * @param {number} id - Worker ID
     */
    createWorker(id) {
        try {
            // Create worker
            const worker = new Worker(this.workerScript);
            
            // Set up worker event listeners
            worker.onmessage = (event) => {
                this.handleWorkerMessage(id, event.data);
            };
            
            worker.onerror = (event) => {
                this.handleWorkerError(id, event);
            };
            
            // Store worker
            this.workers.set(id, {
                worker,
                busy: false,
                currentTask: null
            });
            
            // Send initialization message
            worker.postMessage({
                type: 'init',
                id,
                data: {}
            });
            
            this.eventSystem.emit('worker:created', { id });
        } catch (error) {
            console.error(`Error creating worker ${id}:`, error);
            this.eventSystem.emit('worker:error', { id, error });
        }
    }
    
    /**
     * Handle worker message
     * @param {number} id - Worker ID
     * @param {Object} data - Message data
     */
    handleWorkerMessage(id, data) {
        const { type, taskId, result, error } = data;
        
        switch (type) {
            case 'result':
                this.handleWorkerResult(id, taskId, result);
                break;
            case 'error':
                this.handleWorkerTaskError(id, taskId, error);
                break;
            case 'ready':
                this.handleWorkerReady(id);
                break;
            default:
                console.warn(`Unknown message type from worker ${id}:`, type);
        }
    }
    
    /**
     * Handle worker error
     * @param {number} id - Worker ID
     * @param {ErrorEvent} event - Error event
     */
    handleWorkerError(id, event) {
        console.error(`Error in worker ${id}:`, event);
        
        const workerInfo = this.workers.get(id);
        if (workerInfo && workerInfo.currentTask) {
            const taskId = workerInfo.currentTask.id;
            this.handleWorkerTaskError(id, taskId, event.error);
        }
        
        this.eventSystem.emit('worker:error', { id, error: event.error });
    }
    
    /**
     * Handle worker result
     * @param {number} id - Worker ID
     * @param {string} taskId - Task ID
     * @param {*} result - Task result
     */
    handleWorkerResult(id, taskId, result) {
        const workerInfo = this.workers.get(id);
        if (workerInfo) {
            // Mark worker as not busy
            workerInfo.busy = false;
            workerInfo.currentTask = null;
            
            // Get task
            const task = this.activeTasks.get(taskId);
            if (task) {
                // Remove from active tasks
                this.activeTasks.delete(taskId);
                
                // Resolve task promise
                task.resolve(result);
                
                // Emit result event
                this.eventSystem.emit('worker:result', { id, taskId, result });
            }
            
            // Process next task in queue
            this.processNextTask();
        }
    }
    
    /**
     * Handle worker task error
     * @param {number} id - Worker ID
     * @param {string} taskId - Task ID
     * @param {*} error - Task error
     */
    handleWorkerTaskError(id, taskId, error) {
        const workerInfo = this.workers.get(id);
        if (workerInfo) {
            // Mark worker as not busy
            workerInfo.busy = false;
            workerInfo.currentTask = null;
            
            // Get task
            const task = this.activeTasks.get(taskId);
            if (task) {
                // Remove from active tasks
                this.activeTasks.delete(taskId);
                
                // Reject task promise
                task.reject(error);
                
                // Emit error event
                this.eventSystem.emit('worker:error', { id, taskId, error });
            }
            
            // Process next task in queue
            this.processNextTask();
        }
    }
    
    /**
     * Handle worker ready
     * @param {number} id - Worker ID
     */
    handleWorkerReady(id) {
        const workerInfo = this.workers.get(id);
        if (workerInfo) {
            // Mark worker as not busy
            workerInfo.busy = false;
            workerInfo.currentTask = null;
            
            // Process next task in queue
            this.processNextTask();
        }
    }
    
    /**
     * Handle task received event
     * @param {Object} eventData - Event data
     */
    onTaskReceived(eventData) {
        const { task } = eventData;
        this.addTask(task);
    }
    
    /**
     * Handle result received event
     * @param {Object} eventData - Event data
     */
    onResultReceived(eventData) {
        // Result is already handled by handleWorkerResult
    }
    
    /**
     * Handle error received event
     * @param {Object} eventData - Event data
     */
    onErrorReceived(eventData) {
        // Error is already handled by handleWorkerError
    }
    
    /**
     * Add a task to the queue
     * @param {Object} task - Task to add
     * @returns {Promise} Promise that resolves with the task result
     */
    addTask(task) {
        return new Promise((resolve, reject) => {
            // Generate task ID if not provided
            if (!task.id) {
                task.id = `task_${this.taskIdCounter++}`;
            }
            
            // Add promise handlers to task
            task.resolve = resolve;
            task.reject = reject;
            
            // Add to queue
            this.taskQueue.push(task);
            
            // Process next task
            this.processNextTask();
        });
    }
    
    /**
     * Process the next task in the queue
     */
    processNextTask() {
        if (this.taskQueue.length === 0) {
            return;
        }
        
        // Find available worker
        let availableWorkerId = null;
        for (const [id, workerInfo] of this.workers) {
            if (!workerInfo.busy) {
                availableWorkerId = id;
                break;
            }
        }
        
        if (availableWorkerId === null) {
            // No available workers
            return;
        }
        
        // Get next task
        const task = this.taskQueue.shift();
        
        // Get worker
        const workerInfo = this.workers.get(availableWorkerId);
        if (workerInfo) {
            // Mark worker as busy
            workerInfo.busy = true;
            workerInfo.currentTask = task;
            
            // Add to active tasks
            this.activeTasks.set(task.id, task);
            
            // Send task to worker
            workerInfo.worker.postMessage({
                type: 'task',
                taskId: task.id,
                data: task.data
            });
            
            // Emit task started event
            this.eventSystem.emit('worker:taskStarted', { id: availableWorkerId, taskId: task.id });
        }
    }
    
    /**
     * Execute a task on a specific worker
     * @param {number} workerId - Worker ID
     * @param {Object} task - Task to execute
     * @returns {Promise} Promise that resolves with the task result
     */
    executeOnWorker(workerId, task) {
        return new Promise((resolve, reject) => {
            // Generate task ID if not provided
            if (!task.id) {
                task.id = `task_${this.taskIdCounter++}`;
            }
            
            // Add promise handlers to task
            task.resolve = resolve;
            task.reject = reject;
            
            // Get worker
            const workerInfo = this.workers.get(workerId);
            if (!workerInfo) {
                reject(new Error(`Worker ${workerId} not found`));
                return;
            }
            
            if (workerInfo.busy) {
                reject(new Error(`Worker ${workerId} is busy`));
                return;
            }
            
            // Mark worker as busy
            workerInfo.busy = true;
            workerInfo.currentTask = task;
            
            // Add to active tasks
            this.activeTasks.set(task.id, task);
            
            // Send task to worker
            workerInfo.worker.postMessage({
                type: 'task',
                taskId: task.id,
                data: task.data
            });
            
            // Emit task started event
            this.eventSystem.emit('worker:taskStarted', { id: workerId, taskId: task.id });
        });
    }
    
    /**
     * Execute a task on all workers
     * @param {Object} task - Task to execute
     * @returns {Promise} Promise that resolves with an array of results
     */
    executeOnAllWorkers(task) {
        const promises = [];
        
        for (let i = 0; i < this.workerCount; i++) {
            // Clone task for each worker
            const workerTask = {
                ...task,
                id: `${task.id || 'task'}_${i}`
            };
            
            promises.push(this.executeOnWorker(i, workerTask));
        }
        
        return Promise.all(promises);
    }
    
    /**
     * Broadcast a message to all workers
     * @param {Object} message - Message to broadcast
     */
    broadcast(message) {
        for (const [id, workerInfo] of this.workers) {
            workerInfo.worker.postMessage(message);
        }
    }
    
    /**
     * Get worker count
     * @returns {number} Worker count
     */
    getWorkerCount() {
        return this.workerCount;
    }
    
    /**
     * Get busy worker count
     * @returns {number} Busy worker count
     */
    getBusyWorkerCount() {
        let count = 0;
        for (const workerInfo of this.workers.values()) {
            if (workerInfo.busy) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * Get available worker count
     * @returns {number} Available worker count
     */
    getAvailableWorkerCount() {
        return this.workerCount - this.getBusyWorkerCount();
    }
    
    /**
     * Get task queue length
     * @returns {number} Task queue length
     */
    getTaskQueueLength() {
        return this.taskQueue.length;
    }
    
    /**
     * Get active task count
     * @returns {number} Active task count
     */
    getActiveTaskCount() {
        return this.activeTasks.size;
    }
    
    /**
     * Check if all workers are busy
     * @returns {boolean} True if all workers are busy
     */
    areAllWorkersBusy() {
        return this.getAvailableWorkerCount() === 0;
    }
    
    /**
     * Check if any worker is available
     * @returns {boolean} True if any worker is available
     */
    isWorkerAvailable() {
        return this.getAvailableWorkerCount() > 0;
    }
    
    /**
     * Terminate a worker
     * @param {number} id - Worker ID
     */
    terminateWorker(id) {
        const workerInfo = this.workers.get(id);
        if (workerInfo) {
            // Terminate worker
            workerInfo.worker.terminate();
            
            // Remove from workers map
            this.workers.delete(id);
            
            // Emit worker terminated event
            this.eventSystem.emit('worker:terminated', { id });
        }
    }
    
    /**
     * Terminate all workers
     */
    terminateAllWorkers() {
        for (const [id, workerInfo] of this.workers) {
            // Terminate worker
            workerInfo.worker.terminate();
            
            // Emit worker terminated event
            this.eventSystem.emit('worker:terminated', { id });
        }
        
        // Clear workers map
        this.workers.clear();
        
        // Clear task queue
        this.taskQueue = [];
        
        // Clear active tasks
        this.activeTasks.clear();
    }
    
    /**
     * Restart a worker
     * @param {number} id - Worker ID
     */
    restartWorker(id) {
        // Terminate worker
        this.terminateWorker(id);
        
        // Create new worker
        this.createWorker(id);
    }
    
    /**
     * Restart all workers
     */
    restartAllWorkers() {
        // Terminate all workers
        this.terminateAllWorkers();
        
        // Initialize workers
        this.initializeWorkers();
    }
    
    /**
     * Destroy the WorkerManager
     */
    destroy() {
        // Terminate all workers
        this.terminateAllWorkers();
        
        // Remove event listeners
        this.eventSystem.off('worker:task', this.onTaskReceived);
        this.eventSystem.off('worker:result', this.onResultReceived);
        this.eventSystem.off('worker:error', this.onErrorReceived);
        
        // Reset state
        this.initialized = false;
    }
}