/**
 * EventBus for inter-module communication
 * Implements a type-safe event system with support for wildcards and async handlers
 */
export class EventBus {
    constructor(options = {}) {
        this.subscriptions = new Map();
        this.wildcardSubscriptions = [];
        this.eventHistory = [];
        this.subscriptionIdCounter = 0;
        this.options = {
            maxListeners: options.maxListeners ?? 100,
            wildcardDelimiter: options.wildcardDelimiter ?? '.',
            enableLogging: options.enableLogging ?? false,
            asyncHandlers: options.asyncHandlers ?? true,
        };
    }
    /**
     * Subscribe to an event
     */
    on(event, handler, priority = 0) {
        return this.addSubscription(event, handler, false, priority);
    }
    /**
     * Subscribe to an event once
     */
    once(event, handler, priority = 0) {
        return this.addSubscription(event, handler, true, priority);
    }
    /**
     * Unsubscribe from an event
     */
    off(event, handler) {
        if (!handler) {
            // Remove all handlers for this event
            this.subscriptions.delete(event);
            this.wildcardSubscriptions = this.wildcardSubscriptions.filter(sub => !this.matchWildcard(event, sub.event));
            return;
        }
        // Remove specific handler
        const subs = this.subscriptions.get(event);
        if (subs) {
            const filtered = subs.filter(sub => sub.handler !== handler);
            if (filtered.length > 0) {
                this.subscriptions.set(event, filtered);
            }
            else {
                this.subscriptions.delete(event);
            }
        }
        // Remove from wildcard subscriptions
        this.wildcardSubscriptions = this.wildcardSubscriptions.filter(sub => !(this.matchWildcard(event, sub.event) && sub.handler === handler));
    }
    /**
     * Emit an event
     */
    async emit(event, data) {
        if (this.options.enableLogging) {
            this.eventHistory.push({ event, data, timestamp: new Date() });
        }
        const handlers = [];
        // Get exact match handlers
        const exactHandlers = this.subscriptions.get(event) || [];
        handlers.push(...exactHandlers);
        // Get wildcard match handlers
        const wildcardHandlers = this.wildcardSubscriptions.filter(sub => this.matchWildcard(event, sub.event));
        handlers.push(...wildcardHandlers);
        // Sort by priority (higher priority first)
        handlers.sort((a, b) => b.priority - a.priority);
        // Execute handlers
        const promises = [];
        for (const sub of handlers) {
            if (sub.once) {
                this.removeSubscription(sub);
            }
            if (this.options.asyncHandlers) {
                promises.push(this.executeHandler(sub.handler, data));
            }
            else {
                await this.executeHandler(sub.handler, data);
            }
        }
        if (this.options.asyncHandlers) {
            await Promise.all(promises);
        }
    }
    /**
     * Emit an event synchronously
     */
    emitSync(event, data) {
        const originalAsync = this.options.asyncHandlers;
        this.options.asyncHandlers = false;
        this.emit(event, data).catch(error => {
            console.error(`Error in sync emit for event ${event}:`, error);
        });
        this.options.asyncHandlers = originalAsync;
    }
    /**
     * Wait for an event
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            const timer = timeout
                ? setTimeout(() => {
                    this.off(event, handler);
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeout)
                : null;
            const handler = (data) => {
                if (timer)
                    clearTimeout(timer);
                resolve(data);
            };
            this.once(event, handler);
        });
    }
    /**
     * Get all listeners for an event
     */
    listeners(event) {
        const handlers = [];
        const exact = this.subscriptions.get(event) || [];
        handlers.push(...exact.map(sub => sub.handler));
        const wildcard = this.wildcardSubscriptions.filter(sub => this.matchWildcard(event, sub.event));
        handlers.push(...wildcard.map(sub => sub.handler));
        return handlers;
    }
    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        return this.listeners(event).length;
    }
    /**
     * Remove all listeners
     */
    removeAllListeners(event) {
        if (event) {
            this.subscriptions.delete(event);
            this.wildcardSubscriptions = this.wildcardSubscriptions.filter(sub => !this.matchWildcard(event, sub.event));
        }
        else {
            this.subscriptions.clear();
            this.wildcardSubscriptions = [];
        }
    }
    /**
     * Get event history
     */
    getEventHistory(limit) {
        if (limit) {
            return this.eventHistory.slice(-limit);
        }
        return [...this.eventHistory];
    }
    /**
     * Clear event history
     */
    clearEventHistory() {
        this.eventHistory = [];
    }
    /**
     * Private helper methods
     */
    addSubscription(event, handler, once, priority) {
        const subscription = {
            id: this.generateSubscriptionId(),
            event,
            handler,
            once,
            priority,
        };
        if (event.includes('*') || event.includes('?')) {
            this.wildcardSubscriptions.push(subscription);
        }
        else {
            const subs = this.subscriptions.get(event) || [];
            if (subs.length >= this.options.maxListeners) {
                console.warn(`Max listeners (${this.options.maxListeners}) exceeded for event: ${event}`);
            }
            subs.push(subscription);
            this.subscriptions.set(event, subs);
        }
        return () => this.removeSubscription(subscription);
    }
    removeSubscription(subscription) {
        const subs = this.subscriptions.get(subscription.event);
        if (subs) {
            const filtered = subs.filter(sub => sub.id !== subscription.id);
            if (filtered.length > 0) {
                this.subscriptions.set(subscription.event, filtered);
            }
            else {
                this.subscriptions.delete(subscription.event);
            }
        }
        this.wildcardSubscriptions = this.wildcardSubscriptions.filter(sub => sub.id !== subscription.id);
    }
    async executeHandler(handler, data) {
        try {
            await handler(data);
        }
        catch (error) {
            console.error('Error in event handler:', error);
            this.emit('error', { error, handler: handler.toString(), data });
        }
    }
    matchWildcard(event, pattern) {
        if (!pattern.includes('*') && !pattern.includes('?')) {
            return event === pattern;
        }
        const regexPattern = pattern
            .split(this.options.wildcardDelimiter)
            .map(part => {
            if (part === '*')
                return '[^' + this.options.wildcardDelimiter + ']+';
            if (part === '**')
                return '.*';
            if (part.includes('?'))
                return part.replace(/\?/g, '.');
            return part;
        })
            .join('\\' + this.options.wildcardDelimiter);
        const regex = new RegExp('^' + regexPattern + '$');
        return regex.test(event);
    }
    generateSubscriptionId() {
        return `sub_${++this.subscriptionIdCounter}_${Date.now()}`;
    }
}
// Singleton instance
export const globalEventBus = new EventBus({
    enableLogging: true,
    maxListeners: 200,
});
// Export common event types
export var SystemEvents;
(function (SystemEvents) {
    // Service events
    SystemEvents["SERVICE_STARTED"] = "service.started";
    SystemEvents["SERVICE_STOPPED"] = "service.stopped";
    SystemEvents["SERVICE_ERROR"] = "service.error";
    SystemEvents["SERVICE_HEALTH_CHECK"] = "service.health_check";
    // WhatsApp events
    SystemEvents["WHATSAPP_READY"] = "whatsapp.ready";
    SystemEvents["WHATSAPP_QR"] = "whatsapp.qr";
    SystemEvents["WHATSAPP_AUTHENTICATED"] = "whatsapp.authenticated";
    SystemEvents["WHATSAPP_DISCONNECTED"] = "whatsapp.disconnected";
    SystemEvents["WHATSAPP_MESSAGE"] = "whatsapp.message";
    // Extraction events
    SystemEvents["EXTRACTION_STARTED"] = "extraction.started";
    SystemEvents["EXTRACTION_PROGRESS"] = "extraction.progress";
    SystemEvents["EXTRACTION_COMPLETED"] = "extraction.completed";
    SystemEvents["EXTRACTION_ERROR"] = "extraction.error";
    // Export events
    SystemEvents["EXPORT_STARTED"] = "export.started";
    SystemEvents["EXPORT_COMPLETED"] = "export.completed";
    SystemEvents["EXPORT_ERROR"] = "export.error";
    // System events
    SystemEvents["CONFIG_CHANGED"] = "config.changed";
    SystemEvents["ERROR"] = "error";
    SystemEvents["WARNING"] = "warning";
})(SystemEvents || (SystemEvents = {}));
//# sourceMappingURL=EventBus.js.map