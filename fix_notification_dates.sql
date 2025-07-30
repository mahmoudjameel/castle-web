UPDATE Notification SET date = CURRENT_TIMESTAMP WHERE date IS NULL OR date = '';
