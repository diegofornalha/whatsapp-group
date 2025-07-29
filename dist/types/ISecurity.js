/**
 * Core security interfaces for system protection
 */
export var HashAlgorithm;
(function (HashAlgorithm) {
    HashAlgorithm["SHA256"] = "sha256";
    HashAlgorithm["SHA512"] = "sha512";
    HashAlgorithm["BCRYPT"] = "bcrypt";
    HashAlgorithm["ARGON2"] = "argon2";
})(HashAlgorithm || (HashAlgorithm = {}));
export var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["LOGIN_ATTEMPT"] = "login_attempt";
    SecurityEventType["LOGIN_SUCCESS"] = "login_success";
    SecurityEventType["LOGIN_FAILURE"] = "login_failure";
    SecurityEventType["TOKEN_EXPIRED"] = "token_expired";
    SecurityEventType["PERMISSION_DENIED"] = "permission_denied";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityEventType["DATA_BREACH_ATTEMPT"] = "data_breach_attempt";
})(SecurityEventType || (SecurityEventType = {}));
export var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["LOW"] = "low";
    SecuritySeverity["MEDIUM"] = "medium";
    SecuritySeverity["HIGH"] = "high";
    SecuritySeverity["CRITICAL"] = "critical";
})(SecuritySeverity || (SecuritySeverity = {}));
export var ExportFormat;
(function (ExportFormat) {
    ExportFormat["JSON"] = "json";
    ExportFormat["CSV"] = "csv";
    ExportFormat["PDF"] = "pdf";
    ExportFormat["EXCEL"] = "excel";
})(ExportFormat || (ExportFormat = {}));
//# sourceMappingURL=ISecurity.js.map