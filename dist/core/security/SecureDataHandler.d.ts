/**
 * Secure Data Handler
 * Implements secure patterns for handling sensitive data
 */
/// <reference types="node" />
export interface SecureDataOptions {
    encryption?: boolean;
    masking?: boolean;
    tokenization?: boolean;
    hashing?: boolean;
}
export interface DataClassification {
    level: 'public' | 'internal' | 'confidential' | 'restricted';
    tags?: string[];
    handling?: SecureDataOptions;
}
export declare class SecureDataHandler {
    private static readonly ENCRYPTION_ALGORITHM;
    private static readonly HASH_ALGORITHM;
    private static readonly SALT_LENGTH;
    private static readonly IV_LENGTH;
    private static readonly TAG_LENGTH;
    private tokenStore;
    private encryptionKey;
    constructor(encryptionKey?: Buffer);
    /**
     * Classify data based on content
     */
    classifyData(data: any): DataClassification;
    /**
     * Handle data securely based on classification
     */
    handleData(data: any, classification?: DataClassification): Promise<any>;
    /**
     * Encrypt sensitive data
     */
    encryptData(data: any): Promise<{
        encrypted: string;
        iv: string;
        tag: string;
    }>;
    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData: string, iv: string, tag: string): Promise<any>;
    /**
     * Hash data (one-way)
     */
    hashData(data: any): Promise<string>;
    /**
     * Verify hashed data
     */
    verifyHash(data: any, hash: string): Promise<boolean>;
    /**
     * Mask sensitive data
     */
    maskData(data: any): any;
    /**
     * Tokenize sensitive data
     */
    tokenizeData(data: any): string;
    /**
     * Detokenize data
     */
    detokenizeData(token: string): any;
    /**
     * Sanitize data for output
     */
    sanitizeForOutput(data: any, context: 'html' | 'json' | 'sql' | 'shell'): any;
    /**
     * Create secure data wrapper
     */
    createSecureWrapper<T>(data: T, classification: DataClassification): SecureDataWrapper<T>;
    /**
     * Check for sensitive patterns
     */
    private containsSensitivePatterns;
    /**
     * Check if field name is sensitive
     */
    private isSensitiveField;
    /**
     * Mask string value
     */
    private maskString;
    /**
     * Mask any value type
     */
    private maskValue;
}
/**
 * Secure Data Wrapper
 * Provides controlled access to sensitive data
 */
export declare class SecureDataWrapper<T> {
    private data;
    private classification;
    private handler;
    private accessLog;
    constructor(data: T, classification: DataClassification, handler: SecureDataHandler);
    /**
     * Get data with audit logging
     */
    getData(context?: any): Promise<T>;
    /**
     * Get masked data
     */
    getMaskedData(): any;
    /**
     * Get tokenized reference
     */
    getToken(): string;
    /**
     * Update data with audit
     */
    updateData(newData: T, context?: any): Promise<void>;
    /**
     * Get classification
     */
    getClassification(): DataClassification;
    /**
     * Get access log
     */
    getAccessLog(): Array<{
        timestamp: Date;
        operation: string;
        context?: any;
    }>;
    /**
     * Log data access
     */
    private logAccess;
}
export declare const secureDataHandler: SecureDataHandler;
//# sourceMappingURL=SecureDataHandler.d.ts.map