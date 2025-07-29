/**
 * Core extractor interfaces for WhatsApp data extraction
 */
/**
 * Media types enum
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
/**
 * Message types enum
 */
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["MEDIA"] = "media";
    MessageType["DELETED"] = "deleted";
    MessageType["EDITED"] = "edited";
    MessageType["SYSTEM"] = "system";
    MessageType["POLL"] = "poll";
    MessageType["LOCATION"] = "location";
})(MessageType || (MessageType = {}));
//# sourceMappingURL=IExtractor.js.map