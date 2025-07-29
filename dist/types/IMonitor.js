/**
 * Core monitoring interfaces for system observability
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
export var ActivityType;
(function (ActivityType) {
    ActivityType["MESSAGE_SENT"] = "message_sent";
    ActivityType["MESSAGE_RECEIVED"] = "message_received";
    ActivityType["GROUP_JOINED"] = "group_joined";
    ActivityType["GROUP_LEFT"] = "group_left";
    ActivityType["MEDIA_UPLOADED"] = "media_uploaded";
    ActivityType["MEDIA_DOWNLOADED"] = "media_downloaded";
    ActivityType["USER_LOGIN"] = "user_login";
    ActivityType["USER_LOGOUT"] = "user_logout";
})(ActivityType || (ActivityType = {}));
export var ResourceType;
(function (ResourceType) {
    ResourceType["CPU"] = "cpu";
    ResourceType["MEMORY"] = "memory";
    ResourceType["DISK"] = "disk";
    ResourceType["NETWORK"] = "network";
})(ResourceType || (ResourceType = {}));
export var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
})(HealthStatus || (HealthStatus = {}));
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
//# sourceMappingURL=IMonitor.js.map