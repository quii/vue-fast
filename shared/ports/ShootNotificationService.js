export var NotificationType;
(function (NotificationType) {
    NotificationType["POSITION_CHANGE"] = "position_change";
    NotificationType["END_COMPLETE"] = "end_complete";
    NotificationType["JOINED_SHOOT"] = "joined_shoot";
    NotificationType["LEFT_SHOOT"] = "left_shoot";
    NotificationType["SCORE_UPDATE"] = "score_update";
    NotificationType["ARCHER_FINISHED"] = "archer_finished"; // New notification type for when an archer finishes
})(NotificationType || (NotificationType = {}));
