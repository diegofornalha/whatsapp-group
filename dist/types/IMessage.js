/**
 * Core message interfaces
 */
/**
 * Message types
 */
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["VIDEO"] = "video";
    MessageType["AUDIO"] = "audio";
    MessageType["DOCUMENT"] = "document";
    MessageType["STICKER"] = "sticker";
    MessageType["GIF"] = "gif";
    MessageType["LOCATION"] = "location";
    MessageType["CONTACT"] = "contact";
    MessageType["POLL"] = "poll";
    MessageType["SYSTEM"] = "system";
    MessageType["DELETED"] = "deleted";
})(MessageType || (MessageType = {}));
/**
 * System message types
 */
export var SystemMessageType;
(function (SystemMessageType) {
    SystemMessageType["USER_JOINED"] = "user_joined";
    SystemMessageType["USER_LEFT"] = "user_left";
    SystemMessageType["USER_ADDED"] = "user_added";
    SystemMessageType["USER_REMOVED"] = "user_removed";
    SystemMessageType["GROUP_CREATED"] = "group_created";
    SystemMessageType["GROUP_NAME_CHANGED"] = "group_name_changed";
    SystemMessageType["GROUP_ICON_CHANGED"] = "group_icon_changed";
    SystemMessageType["GROUP_DESCRIPTION_CHANGED"] = "group_description_changed";
    SystemMessageType["ADMIN_ADDED"] = "admin_added";
    SystemMessageType["ADMIN_REMOVED"] = "admin_removed";
    SystemMessageType["ENCRYPTION_CHANGED"] = "encryption_changed";
    SystemMessageType["DISAPPEARING_MESSAGES"] = "disappearing_messages";
    SystemMessageType["CALL_STARTED"] = "call_started";
    SystemMessageType["CALL_ENDED"] = "call_ended";
})(SystemMessageType || (SystemMessageType = {}));
/**
 * Export format options
 */
export var ExportFormat;
(function (ExportFormat) {
    ExportFormat["JSON"] = "json";
    ExportFormat["CSV"] = "csv";
    ExportFormat["TXT"] = "txt";
    ExportFormat["HTML"] = "html";
    ExportFormat["PDF"] = "pdf";
})(ExportFormat || (ExportFormat = {}));
/**
 * Message delivery status
 */
export var MessageDeliveryStatus;
(function (MessageDeliveryStatus) {
    MessageDeliveryStatus["PENDING"] = "pending";
    MessageDeliveryStatus["SENT"] = "sent";
    MessageDeliveryStatus["DELIVERED"] = "delivered";
    MessageDeliveryStatus["READ"] = "read";
    MessageDeliveryStatus["FAILED"] = "failed";
})(MessageDeliveryStatus || (MessageDeliveryStatus = {}));
//# sourceMappingURL=IMessage.js.map