import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from '../alerts/notificationService';

describe('Notification Service & Throttler', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('checks support gracefully when notification API is not available or disabled', () => {
    expect(typeof NotificationService.isSupported()).toBe('boolean');
  });

  it('toggles local storage enabled state correctly', () => {
    NotificationService.setEnabled(true);
    expect(localStorage.getItem('sone_flood_alert_notifs_enabled')).toBe('true');

    NotificationService.setEnabled(false);
    expect(localStorage.getItem('sone_flood_alert_notifs_enabled')).toBe('false');
  });
});
