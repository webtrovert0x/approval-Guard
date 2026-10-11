import type { ApprovalHistoryItem, GuardMonitoringRule, SecurityAlert, TokenInfo } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'bot_guard_history_v1',
  CUSTOM_TOKENS: 'bot_guard_custom_tokens_v1',
  RULES: 'bot_guard_rules_v1',
  ALERTS: 'bot_guard_alerts_v1',
  SETTINGS: 'bot_guard_settings_v1',
};

export interface AppSettings {
  soundEnabled: boolean;
  autoRefreshIntervalSec: number;
  highlightUnlimited: boolean;
  alertOnUnverified: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  autoRefreshIntervalSec: 15,
  highlightUnlimited: true,
  alertOnUnverified: true,
};

export const StorageService = {
  getHistory(): ApprovalHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addHistoryItem(item: Omit<ApprovalHistoryItem, 'id'>): ApprovalHistoryItem {
    const newItem: ApprovalHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    try {
      const existing = this.getHistory();
      const updated = [newItem, ...existing].slice(0, 100); // keep last 100
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history', e);
    }
    return newItem;
  },

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getCustomTokens(): TokenInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOKENS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCustomToken(token: TokenInfo): void {
    const tokens = this.getCustomTokens();
    if (!tokens.some((t) => t.address.toLowerCase() === token.address.toLowerCase())) {
      tokens.push({ ...token, isCustom: true });
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TOKENS, JSON.stringify(tokens));
    }
  },

  removeCustomToken(address: string): void {
    const tokens = this.getCustomTokens().filter(
      (t) => t.address.toLowerCase() !== address.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TOKENS, JSON.stringify(tokens));
  },

  getMonitoringRules(): Record<string, GuardMonitoringRule> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveMonitoringRule(rule: GuardMonitoringRule): void {
    const rules = this.getMonitoringRules();
    rules[rule.tokenAddress.toLowerCase()] = rule;
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  },

  getAlerts(): SecurityAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'read'>): SecurityAlert {
    const newAlert: SecurityAlert = {
      ...alert,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };
    try {
      const existing = this.getAlerts();
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([newAlert, ...existing].slice(0, 50)));
    } catch (e) {
      console.error('Failed to save alert', e);
    }
    return newAlert;
  },

  markAlertsAsRead(): void {
    const alerts = this.getAlerts().map((a) => ({ ...a, read: true }));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },
};
