export type RiskLevel = 'CRITICAL' | 'ELEVATED' | 'MEDIUM' | 'SAFE';

export interface TokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  isCustom?: boolean;
}

export interface SpenderInfo {
  address: `0x${string}`;
  name: string;
  protocol: string;
  category: string;
  isVerified: boolean;
  websiteUrl?: string;
  description?: string;
}

export interface ApprovalRecord {
  id: string; // tokenAddress-spenderAddress
  token: TokenInfo;
  spender: SpenderInfo;
  allowanceRaw: bigint;
  allowanceFormatted: string;
  isUnlimited: boolean;
  userBalanceRaw: bigint;
  userBalanceFormatted: string;
  riskLevel: RiskLevel;
  riskReasons: string[];
  lastUpdated?: number; // timestamp
  txHash?: string;
}

export interface ApprovalHistoryItem {
  id: string;
  timestamp: number;
  tokenSymbol: string;
  tokenAddress: string;
  spenderName: string;
  spenderAddress: string;
  type: 'REVOKE' | 'ALLOWANCE_UPDATE' | 'UNLIMITED_GRANT' | 'RULE_CHANGE';
  previousAllowance: string;
  newAllowance: string;
  txHash: string;
}

export interface GuardMonitoringRule {
  tokenAddress: string;
  tokenSymbol: string;
  maxLimit: string;
  isMonitored: boolean;
  lastUpdated: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  tokenAddress?: string;
  spenderAddress?: string;
  txHash?: string;
  read: boolean;
}
