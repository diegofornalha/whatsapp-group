/**
 * Core group interfaces
 */
/**
 * Group categories
 */
export var GroupCategory;
(function (GroupCategory) {
    GroupCategory["PERSONAL"] = "personal";
    GroupCategory["WORK"] = "work";
    GroupCategory["EDUCATION"] = "education";
    GroupCategory["COMMUNITY"] = "community";
    GroupCategory["ENTERTAINMENT"] = "entertainment";
    GroupCategory["NEWS"] = "news";
    GroupCategory["SUPPORT"] = "support";
    GroupCategory["OTHER"] = "other";
})(GroupCategory || (GroupCategory = {}));
/**
 * Member roles
 */
export var MemberRole;
(function (MemberRole) {
    MemberRole["OWNER"] = "owner";
    MemberRole["ADMIN"] = "admin";
    MemberRole["MODERATOR"] = "moderator";
    MemberRole["MEMBER"] = "member";
    MemberRole["GUEST"] = "guest";
})(MemberRole || (MemberRole = {}));
/**
 * Member permissions
 */
export var MemberPermission;
(function (MemberPermission) {
    MemberPermission["SEND_MESSAGES"] = "send_messages";
    MemberPermission["SEND_MEDIA"] = "send_media";
    MemberPermission["ADD_MEMBERS"] = "add_members";
    MemberPermission["REMOVE_MEMBERS"] = "remove_members";
    MemberPermission["CHANGE_GROUP_INFO"] = "change_group_info";
    MemberPermission["DELETE_MESSAGES"] = "delete_messages";
    MemberPermission["PIN_MESSAGES"] = "pin_messages";
    MemberPermission["MANAGE_ADMINS"] = "manage_admins";
})(MemberPermission || (MemberPermission = {}));
/**
 * Member status
 */
export var MemberStatus;
(function (MemberStatus) {
    MemberStatus["ACTIVE"] = "active";
    MemberStatus["INACTIVE"] = "inactive";
    MemberStatus["LEFT"] = "left";
    MemberStatus["REMOVED"] = "removed";
    MemberStatus["BANNED"] = "banned";
})(MemberStatus || (MemberStatus = {}));
/**
 * Group actions for activity log
 */
export var GroupAction;
(function (GroupAction) {
    GroupAction["CREATED"] = "created";
    GroupAction["NAME_CHANGED"] = "name_changed";
    GroupAction["DESCRIPTION_CHANGED"] = "description_changed";
    GroupAction["AVATAR_CHANGED"] = "avatar_changed";
    GroupAction["MEMBER_ADDED"] = "member_added";
    GroupAction["MEMBER_REMOVED"] = "member_removed";
    GroupAction["MEMBER_LEFT"] = "member_left";
    GroupAction["ADMIN_ADDED"] = "admin_added";
    GroupAction["ADMIN_REMOVED"] = "admin_removed";
    GroupAction["SETTINGS_CHANGED"] = "settings_changed";
    GroupAction["MESSAGE_DELETED"] = "message_deleted";
    GroupAction["MESSAGE_PINNED"] = "message_pinned";
    GroupAction["MESSAGE_UNPINNED"] = "message_unpinned";
})(GroupAction || (GroupAction = {}));
/**
 * Join request status
 */
export var JoinRequestStatus;
(function (JoinRequestStatus) {
    JoinRequestStatus["PENDING"] = "pending";
    JoinRequestStatus["APPROVED"] = "approved";
    JoinRequestStatus["REJECTED"] = "rejected";
    JoinRequestStatus["EXPIRED"] = "expired";
    JoinRequestStatus["WITHDRAWN"] = "withdrawn";
})(JoinRequestStatus || (JoinRequestStatus = {}));
/**
 * Backup status
 */
export var BackupStatus;
(function (BackupStatus) {
    BackupStatus["PENDING"] = "pending";
    BackupStatus["IN_PROGRESS"] = "in_progress";
    BackupStatus["COMPLETED"] = "completed";
    BackupStatus["FAILED"] = "failed";
    BackupStatus["EXPIRED"] = "expired";
})(BackupStatus || (BackupStatus = {}));
//# sourceMappingURL=IGroup.js.map