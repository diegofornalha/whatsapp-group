/**
 * Secure Data Handler
 * Implements secure patterns for handling sensitive data
 */
import { logger } from '../../utils/logger';
import * as crypto from 'crypto';
export class SecureDataHandler {
    constructor(encryptionKey) {
        this.tokenStore = new Map();
        this.encryptionKey = encryptionKey || crypto.randomBytes(32);
    }
    /**
     * Classify data based on content
     */
    classifyData(data) {
        const dataStr = JSON.stringify(data).toLowerCase();
        // Check for highly sensitive patterns
        if (this.containsSensitivePatterns(dataStr, ['ssn', 'social security', 'tax id', 'passport'])) {
            return { level: 'restricted', handling: { encryption: true, masking: true } };
        }
        // Check for confidential patterns
        if (this.containsSensitivePatterns(dataStr, ['credit card', 'bank account', 'password', 'api key'])) {
            return { level: 'confidential', handling: { encryption: true, tokenization: true } };
        }
        // Check for internal patterns
        if (this.containsSensitivePatterns(dataStr, ['email', 'phone', 'address', 'name'])) {
            return { level: 'internal', handling: { masking: true } };
        }
        return { level: 'public', handling: {} };
    }
    /**
     * Handle data securely based on classification
     */
    async handleData(data, classification) {
        const dataClass = classification || this.classifyData(data);
        logger.info('Handling data securely', {
            classification: dataClass.level,
            handling: dataClass.handling
        });
        let result = data;
        if (dataClass.handling?.hashing) {
            result = await this.hashData(result);
        }
        if (dataClass.handling?.masking) {
            result = this.maskData(result);
        }
        if (dataClass.handling?.tokenization) {
            result = this.tokenizeData(result);
        }
        if (dataClass.handling?.encryption) {
            result = await this.encryptData(result);
        }
        return result;
    }
    /**
     * Encrypt sensitive data
     */
    async encryptData(data) {
        try {
            const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
            const iv = crypto.randomBytes(this.IV_LENGTH);
            const cipher = crypto.createCipheriv(SecureDataHandler.ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
            let encrypted = cipher.update(dataStr, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            const tag = cipher.getAuthTag();
            return {
                encrypted,
                iv: iv.toString('base64'),
                tag: tag.toString('base64')
            };
        }
        catch (error) {
            logger.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }
    /**
     * Decrypt sensitive data
     */
    async decryptData(encryptedData, iv, tag) {
        try {
            const decipher = crypto.createDecipheriv(SecureDataHandler.ENCRYPTION_ALGORITHM, this.encryptionKey, Buffer.from(iv, 'base64'));
            decipher.setAuthTag(Buffer.from(tag, 'base64'));
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            try {
                return JSON.parse(decrypted);
            }
            catch {
                return decrypted;
            }
        }
        catch (error) {
            logger.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }
    /**
     * Hash data (one-way)
     */
    async hashData(data) {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        const salt = crypto.randomBytes(SecureDataHandler.SALT_LENGTH);
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(dataStr, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(salt.toString('hex') + ':' + derivedKey.toString('hex'));
                }
            });
        });
    }
    /**
     * Verify hashed data
     */
    async verifyHash(data, hash) {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        const [salt, key] = hash.split(':');
        return new Promise((resolve) => {
            crypto.pbkdf2(dataStr, Buffer.from(salt, 'hex'), 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(key === derivedKey.toString('hex'));
                }
            });
        });
    }
    /**
     * Mask sensitive data
     */
    maskData(data) {
        if (typeof data === 'string') {
            return this.maskString(data);
        }
        if (typeof data === 'object' && data !== null) {
            const masked = Array.isArray(data) ? [] : {};
            for (const key in data) {
                if (this.isSensitiveField(key)) {
                    masked[key] = this.maskValue(data[key]);
                }
                else if (typeof data[key] === 'object') {
                    masked[key] = this.maskData(data[key]);
                }
                else {
                    masked[key] = data[key];
                }
            }
            return masked;
        }
        return data;
    }
    /**
     * Tokenize sensitive data
     */
    tokenizeData(data) {
        const token = 'tok_' + crypto.randomBytes(16).toString('hex');
        this.tokenStore.set(token, data);
        // Set expiration
        setTimeout(() => {
            this.tokenStore.delete(token);
        }, 3600000); // 1 hour
        return token;
    }
    /**
     * Detokenize data
     */
    detokenizeData(token) {
        const data = this.tokenStore.get(token);
        if (!data) {
            throw new Error('Invalid or expired token');
        }
        return data;
    }
    /**
     * Sanitize data for output
     */
    sanitizeForOutput(data, context) {
        if (typeof data !== 'string') {
            return data;
        }
        switch (context) {
            case 'html':
                return data
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            case 'json':
                return data
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t');
            case 'sql':
                return data.replace(/['";\\]/g, '');
            case 'shell':
                return data.replace(/[`$(){}[\]|&;<>'"\\]/g, '');
            default:
                return data;
        }
    }
    /**
     * Create secure data wrapper
     */
    createSecureWrapper(data, classification) {
        return new SecureDataWrapper(data, classification, this);
    }
    /**
     * Check for sensitive patterns
     */
    containsSensitivePatterns(data, patterns) {
        return patterns.some(pattern => data.includes(pattern));
    }
    /**
     * Check if field name is sensitive
     */
    isSensitiveField(fieldName) {
        const sensitiveFields = [
            'password', 'secret', 'token', 'key', 'ssn', 'creditcard',
            'credit_card', 'cvv', 'pin', 'private', 'auth'
        ];
        const field = fieldName.toLowerCase();
        return sensitiveFields.some(sensitive => field.includes(sensitive));
    }
    /**
     * Mask string value
     */
    maskString(value) {
        if (value.length <= 4) {
            return '*'.repeat(value.length);
        }
        // Email masking
        if (value.includes('@')) {
            const [local, domain] = value.split('@');
            return local.substring(0, 2) + '***@' + domain;
        }
        // Credit card masking
        if (/^\d{13,19}$/.test(value)) {
            return '*'.repeat(value.length - 4) + value.slice(-4);
        }
        // Default masking
        return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
    }
    /**
     * Mask any value type
     */
    maskValue(value) {
        if (typeof value === 'string') {
            return this.maskString(value);
        }
        if (typeof value === 'number') {
            return '***';
        }
        if (typeof value === 'object') {
            return this.maskData(value);
        }
        return '***';
    }
}
SecureDataHandler.ENCRYPTION_ALGORITHM = 'aes-256-gcm';
SecureDataHandler.HASH_ALGORITHM = 'sha256';
SecureDataHandler.SALT_LENGTH = 32;
SecureDataHandler.IV_LENGTH = 16;
SecureDataHandler.TAG_LENGTH = 16;
/**
 * Secure Data Wrapper
 * Provides controlled access to sensitive data
 */
export class SecureDataWrapper {
    constructor(data, classification, handler) {
        this.data = data;
        this.classification = classification;
        this.handler = handler;
        this.accessLog = [];
    }
    /**
     * Get data with audit logging
     */
    async getData(context) {
        this.logAccess('read', context);
        if (this.classification.level === 'restricted') {
            logger.warn('Accessing restricted data', { context });
        }
        return this.data;
    }
    /**
     * Get masked data
     */
    getMaskedData() {
        this.logAccess('read-masked');
        return this.handler.maskData(this.data);
    }
    /**
     * Get tokenized reference
     */
    getToken() {
        this.logAccess('tokenize');
        return this.handler.tokenizeData(this.data);
    }
    /**
     * Update data with audit
     */
    async updateData(newData, context) {
        this.logAccess('update', context);
        if (this.classification.level === 'restricted') {
            logger.warn('Updating restricted data', { context });
        }
        this.data = newData;
    }
    /**
     * Get classification
     */
    getClassification() {
        return this.classification;
    }
    /**
     * Get access log
     */
    getAccessLog() {
        return [...this.accessLog];
    }
    /**
     * Log data access
     */
    logAccess(operation, context) {
        this.accessLog.push({
            timestamp: new Date(),
            operation,
            context
        });
    }
}
// Export singleton instance with default key
export const secureDataHandler = new SecureDataHandler();
//# sourceMappingURL=SecureDataHandler.js.map