import { RiskLevel } from '../types/alert';

const STORAGE_KEY_ENABLED = 'sone_flood_alert_notifs_enabled';
const STORAGE_KEY_LAST_NOTIF_TIME = 'sone_flood_last_notif_time';
const STORAGE_KEY_LAST_NOTIF_LEVEL = 'sone_flood_last_notif_level';

// Minimum interval between repeated notifications for identical severity (30 minutes)
const MIN_NOTIFICATION_INTERVAL_MS = 30 * 60 * 1000;

const LEVEL_SEVERITY_MAP: Record<RiskLevel, number> = {
  SAFE: 0,
  WARNING: 1,
  HIGH_RISK: 2,
  DANGER: 3,
  EXTREME: 4,
};

export class NotificationService {
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      if (granted) {
        this.setEnabled(true);
      }
      return granted;
    } catch {
      return false;
    }
  }

  static isEnabled(): boolean {
    if (!this.isSupported()) return false;
    const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
    return stored === 'true' && Notification.permission === 'granted';
  }

  static setEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
  }

  /**
   * Dispatches a flood alert notification if permission granted, feature enabled,
   * and throttling rules permit (e.g., severity escalated or cooldown expired).
   */
  static dispatchAlert(
    title: string,
    body: string,
    level: RiskLevel,
    force = false
  ): boolean {
    if (!this.isEnabled()) return false;

    const now = Date.now();
    const lastTime = parseInt(localStorage.getItem(STORAGE_KEY_LAST_NOTIF_TIME) || '0', 10);
    const lastLevel = (localStorage.getItem(STORAGE_KEY_LAST_NOTIF_LEVEL) as RiskLevel) || 'SAFE';

    const currentSeverity = LEVEL_SEVERITY_MAP[level] || 0;
    const lastSeverity = LEVEL_SEVERITY_MAP[lastLevel] || 0;

    // Trigger immediately if:
    // 1. Force flag is true, OR
    // 2. Risk escalated to a strictly higher severity tier, OR
    // 3. Minimum cooldown interval has passed since last notification
    const isEscalation = currentSeverity > lastSeverity;
    const isCooldownElapsed = now - lastTime > MIN_NOTIFICATION_INTERVAL_MS;

    if (!force && !isEscalation && !isCooldownElapsed) {
      return false;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'sone-river-flood-alert',
        requireInteraction: level === 'DANGER' || level === 'EXTREME',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      localStorage.setItem(STORAGE_KEY_LAST_NOTIF_TIME, now.toString());
      localStorage.setItem(STORAGE_KEY_LAST_NOTIF_LEVEL, level);

      return true;
    } catch (e) {
      console.error('Failed to trigger notification:', e);
      return false;
    }
  }
}
