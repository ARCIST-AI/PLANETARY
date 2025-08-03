/**
 * Utils module exports
 */

export { MathUtils } from './MathUtils.js';
export { DateUtils } from './DateUtils.js';
export { EventSystem } from './EventSystem.js';
export { PerformanceMonitor } from './PerformanceMonitor.js';
export { Constants } from './Constants.js';

/**
 * Utility functions
 */
export const Utils = {
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        
        return obj;
    },
    
    /**
     * Merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    merge(target, source) {
        const result = this.deepClone(target);
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    typeof source[key] === 'object' && 
                    source[key] !== null && 
                    !Array.isArray(source[key]) &&
                    !(source[key] instanceof Date)
                ) {
                    result[key] = this.merge(result[key] || {}, source[key]);
                } else {
                    result[key] = this.deepClone(source[key]);
                }
            }
        }
        
        return result;
    },
    
    /**
     * Check if two objects are equal
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {boolean} True if objects are equal
     */
    isEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        
        if (obj1 === null || obj2 === null) return false;
        
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
        
        if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
        
        if (obj1 instanceof Date && obj2 instanceof Date) {
            return obj1.getTime() === obj2.getTime();
        }
        
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) return false;
        
        for (const key of keys1) {
            if (!obj2.hasOwnProperty(key)) return false;
            
            if (typeof obj1[key] === 'object' && obj1[key] !== null) {
                if (!this.isEqual(obj1[key], obj2[key])) return false;
            } else {
                if (obj1[key] !== obj2[key]) return false;
            }
        }
        
        return true;
    },
    
    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Object
     * @param {string} path - Path to value
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Value at path or default value
     */
    get(obj, path, defaultValue = undefined) {
        if (typeof path !== 'string' || path === '') {
            return defaultValue;
        }
        
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result;
    },
    
    /**
     * Set nested value in object using dot notation
     * @param {Object} obj - Object
     * @param {string} path - Path to value
     * @param {*} value - Value to set
     * @returns {Object} Updated object
     */
    set(obj, path, value) {
        if (typeof path !== 'string' || path === '') {
            return obj;
        }
        
        const keys = path.split('.');
        let result = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            if (!result.hasOwnProperty(key) || typeof result[key] !== 'object') {
                result[key] = {};
            }
            
            result = result[key];
        }
        
        result[keys[keys.length - 1]] = value;
        
        return obj;
    },
    
    /**
     * Check if object has property at path
     * @param {Object} obj - Object
     * @param {string} path - Path to check
     * @returns {boolean} True if object has property at path
     */
    has(obj, path) {
        if (typeof path !== 'string' || path === '') {
            return false;
        }
        
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return false;
            }
            result = result[key];
        }
        
        return true;
    },
    
    /**
     * Delete property at path
     * @param {Object} obj - Object
     * @param {string} path - Path to delete
     * @returns {boolean} True if property was deleted
     */
    delete(obj, path) {
        if (typeof path !== 'string' || path === '') {
            return false;
        }
        
        const keys = path.split('.');
        let result = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            if (!result.hasOwnProperty(key) || typeof result[key] !== 'object') {
                return false;
            }
            
            result = result[key];
        }
        
        const lastKey = keys[keys.length - 1];
        
        if (result.hasOwnProperty(lastKey)) {
            delete result[lastKey];
            return true;
        }
        
        return false;
    },
    
    /**
     * Pick properties from object
     * @param {Object} obj - Object
     * @param {Array} paths - Paths to pick
     * @returns {Object} New object with picked properties
     */
    pick(obj, paths) {
        const result = {};
        
        for (const path of paths) {
            if (this.has(obj, path)) {
                this.set(result, path, this.get(obj, path));
            }
        }
        
        return result;
    },
    
    /**
     * Omit properties from object
     * @param {Object} obj - Object
     * @param {Array} paths - Paths to omit
     * @returns {Object} New object without omitted properties
     */
    omit(obj, paths) {
        const result = this.deepClone(obj);
        
        for (const path of paths) {
            this.delete(result, path);
        }
        
        return result;
    },
    
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        
        return function(...args) {
            const context = this;
            
            clearTimeout(timeout);
            
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    },
    
    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit time in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        
        return function(...args) {
            const context = this;
            
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    },
    
    /**
     * Memoize function
     * @param {Function} func - Function to memoize
     * @param {Function} resolver - Resolver function
     * @returns {Function} Memoized function
     */
    memoize(func, resolver) {
        const cache = new Map();
        
        return function(...args) {
            const key = resolver ? resolver.apply(this, args) : JSON.stringify(args);
            
            if (cache.has(key)) {
                return cache.get(key);
            }
            
            const result = func.apply(this, args);
            cache.set(key, result);
            
            return result;
        };
    },
    
    /**
     * Curry function
     * @param {Function} func - Function to curry
     * @param {number} arity - Arity of function
     * @returns {Function} Curried function
     */
    curry(func, arity = func.length) {
        return function curried(...args) {
            if (args.length >= arity) {
                return func.apply(this, args);
            }
            
            return function(...moreArgs) {
                return curried.apply(this, args.concat(moreArgs));
            };
        };
    },
    
    /**
     * Compose functions
     * @param {...Function} functions - Functions to compose
     * @returns {Function} Composed function
     */
    compose(...functions) {
        return function(...args) {
            return functions.reduceRight((result, func) => {
                return Array.isArray(result) ? func.apply(this, result) : func.call(this, result);
            }, args);
        };
    },
    
    /**
     * Pipe functions
     * @param {...Function} functions - Functions to pipe
     * @returns {Function} Piped function
     */
    pipe(...functions) {
        return function(...args) {
            return functions.reduce((result, func) => {
                return Array.isArray(result) ? func.apply(this, result) : func.call(this, result);
            }, args);
        };
    },
    
    /**
     * Partial application
     * @param {Function} func - Function to partially apply
     * @param {...*} args - Arguments to partially apply
     * @returns {Function} Partially applied function
     */
    partial(func, ...args) {
        return function(...moreArgs) {
            return func.apply(this, args.concat(moreArgs));
        };
    },
    
    /**
     * Create a range of numbers
     * @param {number} start - Start of range
     * @param {number} end - End of range
     * @param {number} step - Step size
     * @returns {Array} Range of numbers
     */
    range(start, end, step = 1) {
        const result = [];
        
        if (step > 0) {
            for (let i = start; i < end; i += step) {
                result.push(i);
            }
        } else if (step < 0) {
            for (let i = start; i > end; i += step) {
                result.push(i);
            }
        }
        
        return result;
    },
    
    /**
     * Create an array of repeated values
     * @param {*} value - Value to repeat
     * @param {number} count - Number of times to repeat
     * @returns {Array} Array of repeated values
     */
    repeat(value, count) {
        const result = [];
        
        for (let i = 0; i < count; i++) {
            result.push(this.deepClone(value));
        }
        
        return result;
    },
    
    /**
     * Create an array of numbers from 0 to n-1
     * @param {number} n - Number of elements
     * @returns {Array} Array of numbers
     */
    times(n) {
        return this.range(0, n);
    },
    
    /**
     * Zip arrays together
     * @param {...Array} arrays - Arrays to zip
     * @returns {Array} Zipped array
     */
    zip(...arrays) {
        const maxLength = Math.max(...arrays.map(arr => arr.length));
        const result = [];
        
        for (let i = 0; i < maxLength; i++) {
            const group = [];
            
            for (const arr of arrays) {
                group.push(arr[i]);
            }
            
            result.push(group);
        }
        
        return result;
    },
    
    /**
     * Unzip array
     * @param {Array} array - Array to unzip
     * @returns {Array} Unzipped arrays
     */
    unzip(array) {
        const result = [];
        const maxLength = Math.max(...array.map(group => group.length));
        
        for (let i = 0; i < maxLength; i++) {
            const group = [];
            
            for (const arr of array) {
                group.push(arr[i]);
            }
            
            result.push(group);
        }
        
        return result;
    },
    
    /**
     * Chunk array into groups of size n
     * @param {Array} array - Array to chunk
     * @param {number} size - Size of chunks
     * @returns {Array} Chunked array
     */
    chunk(array, size) {
        const result = [];
        
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        
        return result;
    },
    
    /**
     * Flatten array
     * @param {Array} array - Array to flatten
     * @returns {Array} Flattened array
     */
    flatten(array) {
        const result = [];
        
        for (const item of array) {
            if (Array.isArray(item)) {
                result.push(...this.flatten(item));
            } else {
                result.push(item);
            }
        }
        
        return result;
    },
    
    /**
     * Flatten array to specified depth
     * @param {Array} array - Array to flatten
     * @param {number} depth - Depth to flatten
     * @returns {Array} Flattened array
     */
    flattenDepth(array, depth) {
        if (depth === 0) {
            return array;
        }
        
        const result = [];
        
        for (const item of array) {
            if (Array.isArray(item)) {
                result.push(...this.flattenDepth(item, depth - 1));
            } else {
                result.push(item);
            }
        }
        
        return result;
    },
    
    /**
     * Group array by key
     * @param {Array} array - Array to group
     * @param {Function|string} key - Key function or property name
     * @returns {Object} Grouped object
     */
    groupBy(array, key) {
        const result = {};
        
        for (const item of array) {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            
            result[groupKey].push(item);
        }
        
        return result;
    },
    
    /**
     * Key array by key
     * @param {Array} array - Array to key
     * @param {Function|string} key - Key function or property name
     * @returns {Object} Keyed object
     */
    keyBy(array, key) {
        const result = {};
        
        for (const item of array) {
            const itemKey = typeof key === 'function' ? key(item) : item[key];
            result[itemKey] = item;
        }
        
        return result;
    },
    
    /**
     * Sort array by key
     * @param {Array} array - Array to sort
     * @param {Function|string} key - Key function or property name
     * @param {string} order - Sort order ('asc' or 'desc')
     * @returns {Array} Sorted array
     */
    sortBy(array, key, order = 'asc') {
        const sorted = [...array];
        
        sorted.sort((a, b) => {
            const valueA = typeof key === 'function' ? key(a) : a[key];
            const valueB = typeof key === 'function' ? key(b) : b[key];
            
            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1;
            }
            
            return 0;
        });
        
        return sorted;
    },
    
    /**
     * Shuffle array
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffle(array) {
        const shuffled = [...array];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    },
    
    /**
     * Sample random element from array
     * @param {Array} array - Array to sample from
     * @returns {*} Random element
     */
    sample(array) {
        if (array.length === 0) {
            return undefined;
        }
        
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    },
    
    /**
     * Sample n random elements from array
     * @param {Array} array - Array to sample from
     * @param {number} n - Number of elements to sample
     * @returns {Array} Sampled elements
     */
    sampleSize(array, n) {
        const shuffled = this.shuffle(array);
        return shuffled.slice(0, Math.min(n, shuffled.length));
    },
    
    /**
     * Remove duplicates from array
     * @param {Array} array - Array to deduplicate
     * @returns {Array} Deduplicated array
     */
    uniq(array) {
        return [...new Set(array)];
    },
    
    /**
     * Remove duplicates from array by key
     * @param {Array} array - Array to deduplicate
     * @param {Function|string} key - Key function or property name
     * @returns {Array} Deduplicated array
     */
    uniqBy(array, key) {
        const seen = new Set();
        const result = [];
        
        for (const item of array) {
            const itemKey = typeof key === 'function' ? key(item) : item[key];
            
            if (!seen.has(itemKey)) {
                seen.add(itemKey);
                result.push(item);
            }
        }
        
        return result;
    },
    
    /**
     * Find difference between arrays
     * @param {Array} array - First array
     * @param {Array} values - Second array
     * @returns {Array} Difference
     */
    difference(array, values) {
        const valuesSet = new Set(values);
        return array.filter(item => !valuesSet.has(item));
    },
    
    /**
     * Find intersection of arrays
     * @param {...Array} arrays - Arrays to intersect
     * @returns {Array} Intersection
     */
    intersection(...arrays) {
        if (arrays.length === 0) {
            return [];
        }
        
        const [first, ...rest] = arrays;
        const firstSet = new Set(first);
        
        for (const arr of rest) {
            const arrSet = new Set(arr);
            
            for (const item of firstSet) {
                if (!arrSet.has(item)) {
                    firstSet.delete(item);
                }
            }
        }
        
        return [...firstSet];
    },
    
    /**
     * Find union of arrays
     * @param {...Array} arrays - Arrays to union
     * @returns {Array} Union
     */
    union(...arrays) {
        const set = new Set();
        
        for (const arr of arrays) {
            for (const item of arr) {
                set.add(item);
            }
        }
        
        return [...set];
    },
    
    /**
     * Partition array into two arrays based on predicate
     * @param {Array} array - Array to partition
     * @param {Function} predicate - Predicate function
     * @returns {Array} Partitioned arrays
     */
    partition(array, predicate) {
        const truthy = [];
        const falsy = [];
        
        for (const item of array) {
            if (predicate(item)) {
                truthy.push(item);
            } else {
                falsy.push(item);
            }
        }
        
        return [truthy, falsy];
    },
    
    /**
     * Find index of element in array
     * @param {Array} array - Array to search
     * @param {*} value - Value to find
     * @param {number} fromIndex - Index to start search from
     * @returns {number} Index of element or -1
     */
    indexOf(array, value, fromIndex = 0) {
        for (let i = fromIndex; i < array.length; i++) {
            if (this.isEqual(array[i], value)) {
                return i;
            }
        }
        
        return -1;
    },
    
    /**
     * Find last index of element in array
     * @param {Array} array - Array to search
     * @param {*} value - Value to find
     * @param {number} fromIndex - Index to start search from
     * @returns {number} Last index of element or -1
     */
    lastIndexOf(array, value, fromIndex = array.length - 1) {
        for (let i = fromIndex; i >= 0; i--) {
            if (this.isEqual(array[i], value)) {
                return i;
            }
        }
        
        return -1;
    },
    
    /**
     * Find element in array
     * @param {Array} array - Array to search
     * @param {Function} predicate - Predicate function
     * @returns {*} Found element or undefined
     */
    find(array, predicate) {
        for (const item of array) {
            if (predicate(item)) {
                return item;
            }
        }
        
        return undefined;
    },
    
    /**
     * Find last element in array
     * @param {Array} array - Array to search
     * @param {Function} predicate - Predicate function
     * @returns {*} Found element or undefined
     */
    findLast(array, predicate) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i])) {
                return array[i];
            }
        }
        
        return undefined;
    },
    
    /**
     * Find index of element in array
     * @param {Array} array - Array to search
     * @param {Function} predicate - Predicate function
     * @returns {number} Index of element or -1
     */
    findIndex(array, predicate) {
        for (let i = 0; i < array.length; i++) {
            if (predicate(array[i])) {
                return i;
            }
        }
        
        return -1;
    },
    
    /**
     * Find last index of element in array
     * @param {Array} array - Array to search
     * @param {Function} predicate - Predicate function
     * @returns {number} Last index of element or -1
     */
    findLastIndex(array, predicate) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i])) {
                return i;
            }
        }
        
        return -1;
    },
    
    /**
     * Check if array includes element
     * @param {Array} array - Array to search
     * @param {*} value - Value to find
     * @param {number} fromIndex - Index to start search from
     * @returns {boolean} True if array includes element
     */
    includes(array, value, fromIndex = 0) {
        return this.indexOf(array, value, fromIndex) !== -1;
    },
    
    /**
     * Check if array all elements satisfy predicate
     * @param {Array} array - Array to check
     * @param {Function} predicate - Predicate function
     * @returns {boolean} True if all elements satisfy predicate
     */
    every(array, predicate) {
        for (const item of array) {
            if (!predicate(item)) {
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Check if array any element satisfies predicate
     * @param {Array} array - Array to check
     * @param {Function} predicate - Predicate function
     * @returns {boolean} True if any element satisfies predicate
     */
    some(array, predicate) {
        for (const item of array) {
            if (predicate(item)) {
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Check if array no element satisfies predicate
     * @param {Array} array - Array to check
     * @param {Function} predicate - Predicate function
     * @returns {boolean} True if no element satisfies predicate
     */
    none(array, predicate) {
        return !this.some(array, predicate);
    },
    
    /**
     * Create a delay
     * @param {number} ms - Delay in milliseconds
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    },
    
    /**
     * Create a timeout
     * @param {Function} func - Function to timeout
     * @param {number} ms - Timeout in milliseconds
     * @returns {Promise} Promise that resolves with function result or rejects on timeout
     */
    timeout(func, ms) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Timeout after ${ms}ms`));
            }, ms);
            
            func()
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    },
    
    /**
     * Retry function
     * @param {Function} func - Function to retry
     * @param {number} times - Number of times to retry
     * @param {number} delay - Delay between retries in milliseconds
     * @returns {Promise} Promise that resolves with function result or rejects after all retries
     */
    async retry(func, times = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < times; i++) {
            try {
                return await func();
            } catch (error) {
                lastError = error;
                
                if (i < times - 1) {
                    await this.delay(delay);
                }
            }
        }
        
        throw lastError;
    },
    
    /**
     * Create a rate-limited function
     * @param {Function} func - Function to rate limit
     * @param {number} limit - Rate limit in calls per interval
     * @param {number} interval - Interval in milliseconds
     * @returns {Function} Rate-limited function
     */
    rateLimit(func, limit, interval) {
        const queue = [];
        let currentCalls = 0;
        let lastReset = Date.now();
        
        return function(...args) {
            return new Promise((resolve, reject) => {
                const now = Date.now();
                
                // Reset counter if interval has passed
                if (now - lastReset > interval) {
                    currentCalls = 0;
                    lastReset = now;
                }
                
                const execute = () => {
                    currentCalls++;
                    
                    func.apply(this, args)
                        .then(resolve)
                        .catch(reject)
                        .finally(() => {
                            // Process next in queue
                            if (queue.length > 0) {
                                const next = queue.shift();
                                next();
                            } else {
                                currentCalls--;
                            }
                        });
                };
                
                if (currentCalls < limit) {
                    execute();
                } else {
                    queue.push(execute);
                }
            });
        };
    },
    
    /**
     * Format bytes to human-readable string
     * @param {number} bytes - Bytes to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted string
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    /**
     * Format number to human-readable string
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted string
     */
    formatNumber(num, decimals = 2) {
        if (num === 0) return '0';
        
        const k = 1000;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
        
        const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k));
        
        return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    },
    
    /**
     * Format time to human-readable string
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted string
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    },
    
    /**
     * Format date to string
     * @param {Date} date - Date to format
     * @param {string} format - Format string
     * @returns {string} Formatted string
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds)
            .replace('SSS', milliseconds);
    },
    
    /**
     * Parse date from string
     * @param {string} str - String to parse
     * @param {string} format - Format string
     * @returns {Date} Parsed date
     */
    parseDate(str, format = 'YYYY-MM-DD HH:mm:ss') {
        const regex = format
            .replace('YYYY', '(\\d{4})')
            .replace('MM', '(\\d{2})')
            .replace('DD', '(\\d{2})')
            .replace('HH', '(\\d{2})')
            .replace('mm', '(\\d{2})')
            .replace('ss', '(\\d{2})')
            .replace('SSS', '(\\d{3})');
        
        const match = str.match(new RegExp(regex));
        
        if (!match) {
            return new Date(NaN);
        }
        
        const values = match.slice(1);
        const parts = {};
        
        const formatParts = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss', 'SSS'];
        const partNames = ['year', 'month', 'day', 'hours', 'minutes', 'seconds', 'milliseconds'];
        
        for (let i = 0; i < formatParts.length; i++) {
            const index = format.indexOf(formatParts[i]);
            if (index !== -1) {
                parts[partNames[i]] = parseInt(values.shift(), 10);
            }
        }
        
        return new Date(
            parts.year || 0,
            (parts.month || 1) - 1,
            parts.day || 1,
            parts.hours || 0,
            parts.minutes || 0,
            parts.seconds || 0,
            parts.milliseconds || 0
        );
    },
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    },
    
    /**
     * Generate UUID
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * Validate email
     * @param {string} email - Email to validate
     * @returns {boolean} True if email is valid
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if URL is valid
     */
    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if phone number is valid
     */
    validatePhone(phone) {
        const re = /^\+?[1-9]\d{1,14}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
    
    /**
     * Validate credit card number
     * @param {string} cardNumber - Credit card number to validate
     * @returns {boolean} True if credit card number is valid
     */
    validateCreditCard(cardNumber) {
        const re = /^[0-9]{13,19}$/;
        if (!re.test(cardNumber.replace(/[\s-]/g, ''))) {
            return false;
        }
        
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    },
    
    /**
     * Validate IPv4 address
     * @param {string} ip - IP address to validate
     * @returns {boolean} True if IP address is valid
     */
    validateIPv4(ip) {
        const re = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return re.test(ip);
    },
    
    /**
     * Validate IPv6 address
     * @param {string} ip - IP address to validate
     * @returns {boolean} True if IP address is valid
     */
    validateIPv6(ip) {
        const re = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        return re.test(ip);
    },
    
    /**
     * Validate MAC address
     * @param {string} mac - MAC address to validate
     * @returns {boolean} True if MAC address is valid
     */
    validateMAC(mac) {
        const re = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return re.test(mac);
    },
    
    /**
     * Validate hex color
     * @param {string} color - Color to validate
     * @returns {boolean} True if color is valid
     */
    validateHexColor(color) {
        const re = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return re.test(color);
    },
    
    /**
     * Validate RGB color
     * @param {string} color - Color to validate
     * @returns {boolean} True if color is valid
     */
    validateRGBColor(color) {
        const re = /^rgb\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*\)$/;
        return re.test(color);
    },
    
    /**
     * Validate RGBA color
     * @param {string} color - Color to validate
     * @returns {boolean} True if color is valid
     */
    validateRGBAColor(color) {
        const re = /^rgba\(\s*(\d{1,3}%?\s*,\s*){3}\d*\.?\d+\s*\)$/;
        return re.test(color);
    },
    
    /**
     * Validate HSL color
     * @param {string} color - Color to validate
     * @returns {boolean} True if color is valid
     */
    validateHSLColor(color) {
        const re = /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/;
        return re.test(color);
    },
    
    /**
     * Validate HSLA color
     * @param {string} color - Color to validate
     * @returns {boolean} True if color is valid
     */
    validateHSLAColor(color) {
        const re = /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*\d*\.?\d+\s*\)$/;
        return re.test(color);
    },
    
    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color
     * @returns {Object} RGB color
     */
    hexToRGB(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    /**
     * Convert RGB color to hex
     * @param {number} r - Red component
     * @param {number} g - Green component
     * @param {number} b - Blue component
     * @returns {string} Hex color
     */
    RGBToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    /**
     * Convert RGB color to HSL
     * @param {number} r - Red component
     * @param {number} g - Green component
     * @param {number} b - Blue component
     * @returns {Object} HSL color
     */
    RGBToHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },
    
    /**
     * Convert HSL color to RGB
     * @param {number} h - Hue component
     * @param {number} s - Saturation component
     * @param {number} l - Lightness component
     * @returns {Object} RGB color
     */
    HSLToRGB(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },
    
    /**
     * Convert hex color to HSL
     * @param {string} hex - Hex color
     * @returns {Object} HSL color
     */
    hexToHSL(hex) {
        const rgb = this.hexToRGB(hex);
        if (!rgb) return null;
        
        return this.RGBToHSL(rgb.r, rgb.g, rgb.b);
    },
    
    /**
     * Convert HSL color to hex
     * @param {number} h - Hue component
     * @param {number} s - Saturation component
     * @param {number} l - Lightness component
     * @returns {string} Hex color
     */
    HSLToHex(h, s, l) {
        const rgb = this.HSLToRGB(h, s, l);
        return this.RGBToHex(rgb.r, rgb.g, rgb.b);
    },
    
    /**
     * Get color brightness
     * @param {string} color - Color
     * @returns {number} Brightness (0-255)
     */
    getColorBrightness(color) {
        const rgb = this.hexToRGB(color);
        if (!rgb) return 0;
        
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    
    /**
     * Get color luminance
     * @param {string} color - Color
     * @returns {number} Luminance (0-1)
     */
    getColorLuminance(color) {
        const rgb = this.hexToRGB(color);
        if (!rgb) return 0;
        
        const a = [rgb.r, rgb.g, rgb.b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },
    
    /**
     * Get color contrast ratio
     * @param {string} color1 - First color
     * @param {string} color2 - Second color
     * @returns {number} Contrast ratio (1-21)
     */
    getColorContrastRatio(color1, color2) {
        const luminance1 = this.getColorLuminance(color1);
        const luminance2 = this.getColorLuminance(color2);
        
        const brightest = Math.max(luminance1, luminance2);
        const darkest = Math.min(luminance1, luminance2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    },
    
    /**
     * Get text color for background
     * @param {string} backgroundColor - Background color
     * @returns {string} Text color ('#000000' or '#FFFFFF')
     */
    getTextColorForBackground(backgroundColor) {
        const brightness = this.getColorBrightness(backgroundColor);
        return brightness > 128 ? '#000000' : '#FFFFFF';
    },
    
    /**
     * Lighten color
     * @param {string} color - Color
     * @param {number} percent - Percent to lighten (0-100)
     * @returns {string} Lightened color
     */
    lightenColor(color, percent) {
        const hsl = this.hexToHSL(color);
        if (!hsl) return color;
        
        hsl.l = Math.min(100, hsl.l + percent);
        
        return this.HSLToHex(hsl.h, hsl.s, hsl.l);
    },
    
    /**
     * Darken color
     * @param {string} color - Color
     * @param {number} percent - Percent to darken (0-100)
     * @returns {string} Darkened color
     */
    darkenColor(color, percent) {
        const hsl = this.hexToHSL(color);
        if (!hsl) return color;
        
        hsl.l = Math.max(0, hsl.l - percent);
        
        return this.HSLToHex(hsl.h, hsl.s, hsl.l);
    },
    
    /**
     * Saturate color
     * @param {string} color - Color
     * @param {number} percent - Percent to saturate (0-100)
     * @returns {string} Saturated color
     */
    saturateColor(color, percent) {
        const hsl = this.hexToHSL(color);
        if (!hsl) return color;
        
        hsl.s = Math.min(100, hsl.s + percent);
        
        return this.HSLToHex(hsl.h, hsl.s, hsl.l);
    },
    
    /**
     * Desaturate color
     * @param {string} color - Color
     * @param {number} percent - Percent to desaturate (0-100)
     * @returns {string} Desaturated color
     */
    desaturateColor(color, percent) {
        const hsl = this.hexToHSL(color);
        if (!hsl) return color;
        
        hsl.s = Math.max(0, hsl.s - percent);
        
        return this.HSLToHex(hsl.h, hsl.s, hsl.l);
    },
    
    /**
     * Rotate hue of color
     * @param {string} color - Color
     * @param {number} degrees - Degrees to rotate
     * @returns {string} Rotated color
     */
    rotateHue(color, degrees) {
        const hsl = this.hexToHSL(color);
        if (!hsl) return color;
        
        hsl.h = (hsl.h + degrees) % 360;
        if (hsl.h < 0) hsl.h += 360;
        
        return this.HSLToHex(hsl.h, hsl.s, hsl.l);
    },
    
    /**
     * Mix two colors
     * @param {string} color1 - First color
     * @param {string} color2 - Second color
     * @param {number} weight - Weight of first color (0-1)
     * @returns {string} Mixed color
     */
    mixColors(color1, color2, weight = 0.5) {
        const rgb1 = this.hexToRGB(color1);
        const rgb2 = this.hexToRGB(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const w = weight * 2 - 1;
        const a = this.getColorContrastRatio(color1, color2) - 1;
        const w1 = ((w * a === -1) ? w : (w + a) / (1 + w * a) + 1) / 2;
        const w2 = 1 - w1;
        
        const r = Math.round(rgb1.r * w1 + rgb2.r * w2);
        const g = Math.round(rgb1.g * w1 + rgb2.g * w2);
        const b = Math.round(rgb1.b * w1 + rgb2.b * w2);
        
        return this.RGBToHex(r, g, b);
    },
    
    /**
     * Get complementary color
     * @param {string} color - Color
     * @returns {string} Complementary color
     */
    getComplementaryColor(color) {
        return this.rotateHue(color, 180);
    },
    
    /**
     * Get triadic colors
     * @param {string} color - Color
     * @returns {Array} Triadic colors
     */
    getTriadicColors(color) {
        return [
            color,
            this.rotateHue(color, 120),
            this.rotateHue(color, 240)
        ];
    },
    
    /**
     * Get tetradic colors
     * @param {string} color - Color
     * @returns {Array} Tetradic colors
     */
    getTetradicColors(color) {
        return [
            color,
            this.rotateHue(color, 90),
            this.rotateHue(color, 180),
            this.rotateHue(color, 270)
        ];
    },
    
    /**
     * Get analogous colors
     * @param {string} color - Color
     * @param {number} angle - Angle between colors
     * @returns {Array} Analogous colors
     */
    getAnalogousColors(color, angle = 30) {
        return [
            this.rotateHue(color, -angle),
            color,
            this.rotateHue(color, angle)
        ];
    },
    
    /**
     * Get split complementary colors
     * @param {string} color - Color
     * @param {number} angle - Angle from complementary
     * @returns {Array} Split complementary colors
     */
    getSplitComplementaryColors(color, angle = 30) {
        return [
            color,
            this.rotateHue(color, 180 - angle),
            this.rotateHue(color, 180 + angle)
        ];
    },
    
    /**
     * Get color palette
     * @param {string} color - Base color
     * @param {string} type - Palette type
     * @returns {Array} Color palette
     */
    getColorPalette(color, type = 'monochromatic') {
        const hsl = this.hexToHSL(color);
        if (!hsl) return [color];
        
        switch (type) {
            case 'monochromatic':
                return [
                    this.HSLToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 40)),
                    this.HSLToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)),
                    color,
                    this.HSLToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
                    this.HSLToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 40))
                ];
            
            case 'complementary':
                return [
                    color,
                    this.getComplementaryColor(color)
                ];
            
            case 'triadic':
                return this.getTriadicColors(color);
            
            case 'tetradic':
                return this.getTetradicColors(color);
            
            case 'analogous':
                return this.getAnalogousColors(color);
            
            case 'split-complementary':
                return this.getSplitComplementaryColors(color);
            
            default:
                return [color];
        }
    }
};