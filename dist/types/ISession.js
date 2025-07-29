/**
 * Core session interfaces
 */
/**
 * Session types
 */
export var SessionType;
(function (SessionType) {
    SessionType["EXTRACTION"] = "extraction";
    SessionType["ANALYSIS"] = "analysis";
    SessionType["EXPORT"] = "export";
    SessionType["SYNC"] = "sync";
    SessionType["BACKUP"] = "backup";
    SessionType["MONITORING"] = "monitoring";
})(SessionType || (SessionType = {}));
/**
 * Session status
 */
export var SessionStatus;
(function (SessionStatus) {
    SessionStatus["PENDING"] = "pending";
    SessionStatus["INITIALIZING"] = "initializing";
    SessionStatus["RUNNING"] = "running";
    SessionStatus["PAUSED"] = "paused";
    SessionStatus["COMPLETED"] = "completed";
    SessionStatus["FAILED"] = "failed";
    SessionStatus["CANCELLED"] = "cancelled";
})(SessionStatus || (SessionStatus = {}));
/**
 * Analysis phases
 */
export var AnalysisPhase;
(function (AnalysisPhase) {
    AnalysisPhase["DATA_LOADING"] = "data_loading";
    AnalysisPhase["PREPROCESSING"] = "preprocessing";
    AnalysisPhase["PATTERN_DETECTION"] = "pattern_detection";
    AnalysisPhase["SENTIMENT_ANALYSIS"] = "sentiment_analysis";
    AnalysisPhase["TOPIC_MODELING"] = "topic_modeling";
    AnalysisPhase["USER_BEHAVIOR"] = "user_behavior";
    AnalysisPhase["REPORT_GENERATION"] = "report_generation";
})(AnalysisPhase || (AnalysisPhase = {}));
/**
 * Insight types
 */
export var InsightType;
(function (InsightType) {
    InsightType["TREND"] = "trend";
    InsightType["ANOMALY"] = "anomaly";
    InsightType["CORRELATION"] = "correlation";
    InsightType["PREDICTION"] = "prediction";
    InsightType["RECOMMENDATION"] = "recommendation";
})(InsightType || (InsightType = {}));
/**
 * Session event types
 */
export var SessionEventType;
(function (SessionEventType) {
    SessionEventType["STARTED"] = "started";
    SessionEventType["PROGRESS"] = "progress";
    SessionEventType["PAUSED"] = "paused";
    SessionEventType["RESUMED"] = "resumed";
    SessionEventType["COMPLETED"] = "completed";
    SessionEventType["FAILED"] = "failed";
    SessionEventType["CANCELLED"] = "cancelled";
    SessionEventType["ERROR"] = "error";
    SessionEventType["WARNING"] = "warning";
})(SessionEventType || (SessionEventType = {}));
/**
 * Media types
 */
export var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
    MediaType["AUDIO"] = "audio";
    MediaType["DOCUMENT"] = "document";
    MediaType["STICKER"] = "sticker";
    MediaType["GIF"] = "gif";
})(MediaType || (MediaType = {}));
//# sourceMappingURL=ISession.js.map