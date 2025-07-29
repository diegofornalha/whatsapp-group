/**
 * Input Validator
 * Validates and sanitizes user input to prevent security vulnerabilities
 */
export interface ValidationRule {
    type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'array' | 'object' | 'custom';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    sanitize?: boolean;
    customValidator?: (value: any) => boolean | string;
    transform?: (value: any) => any;
}
export interface ValidationSchema {
    [field: string]: ValidationRule | ValidationSchema;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    sanitized: any;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export declare class InputValidator {
    private sanitizers;
    constructor();
    /**
     * Initialize default sanitizers
     */
    private initializeSanitizers;
    /**
     * Validate input against schema
     */
    validate(input: any, schema: ValidationSchema): ValidationResult;
    /**
     * Validate object recursively
     */
    private validateObject;
    /**
     * Check if object is a validation rule
     */
    private isValidationRule;
    /**
     * Validate individual field
     */
    private validateField;
    /**
     * Validate string type
     */
    private validateString;
    /**
     * Validate number type
     */
    private validateNumber;
    /**
     * Validate boolean type
     */
    private validateBoolean;
    /**
     * Validate email
     */
    private validateEmail;
    /**
     * Validate URL
     */
    private validateUrl;
    /**
     * Validate date
     */
    private validateDate;
    /**
     * Validate array
     */
    private validateArray;
    /**
     * Validate object type
     */
    private validateObjectType;
    /**
     * Validate with custom validator
     */
    private validateCustom;
    /**
     * Sanitize string value
     */
    private sanitizeString;
    /**
     * Add custom sanitizer
     */
    addSanitizer(name: string, sanitizer: (value: any) => any): void;
    /**
     * Apply specific sanitizer
     */
    sanitize(value: any, sanitizerName: string): any;
    /**
     * Create validation middleware
     */
    middleware(schema: ValidationSchema): (req: any, res: any, next: any) => any;
}
export declare const CommonSchemas: {
    userRegistration: {
        username: {
            type: "string";
            required: boolean;
            min: number;
            max: number;
            pattern: RegExp;
            sanitize: boolean;
        };
        email: {
            type: "email";
            required: boolean;
            sanitize: boolean;
        };
        password: {
            type: "string";
            required: boolean;
            min: number;
            pattern: RegExp;
        };
    };
    login: {
        email: {
            type: "email";
            required: boolean;
            sanitize: boolean;
        };
        password: {
            type: "string";
            required: boolean;
        };
    };
    apiRequest: {
        endpoint: {
            type: "string";
            required: boolean;
            pattern: RegExp;
        };
        method: {
            type: "string";
            required: boolean;
            enum: string[];
        };
        params: {
            type: "object";
            required: boolean;
        };
    };
};
export declare const inputValidator: InputValidator;
//# sourceMappingURL=InputValidator.d.ts.map