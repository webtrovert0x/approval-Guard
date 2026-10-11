import type { TokenInfo, SpenderInfo, RiskLevel } from '../types';

export const KNOWN_TOKENS: TokenInfo[] = [
  {
    address: '0x33B0781De689882Fe758810237C5011707530663' as `0x${string}`,
    name: 'Wrapped BOT',
    symbol: 'WBOT',
    decimals: 18,
    logoUrl: 'https://scan.bohr.life/favicon.ico',
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    name: 'Tether USD (BOT Chain)',
    symbol: 'USDT',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as `0x${string}`,
    name: 'USD Coin (BOT Chain)',
    symbol: 'USDC',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  },
  {
    address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE' as `0x${string}`,
    name: 'Bohr Ecosystem Token',
    symbol: 'BOHR',
    decimals: 18,
    logoUrl: 'https://scan.bohr.life/favicon.ico',
  },
  {
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c' as `0x${string}`,
    name: 'Mint Protocol Token',
    symbol: 'MINT',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
];

export const KNOWN_SPENDERS: SpenderInfo[] = [
  {
    address: '0x10ED43C718714eb63d5aA57B78B54704E256024E' as `0x${string}`,
    name: 'BOTSwap Router v2',
    protocol: 'BOTSwap DEX',
    category: 'DEX Router',
    isVerified: true,
    websiteUrl: 'https://swap.bohr.life',
    description: 'Primary automated market maker router on BOT Chain.',
  },
  {
    address: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F' as `0x${string}`,
    name: 'BOT Staking & Validator Pool',
    protocol: 'BOT Staking Hub',
    category: 'Staking & Yield',
    isVerified: true,
    websiteUrl: 'https://staking.bohr.life',
    description: 'Official staking vault for BOT chain validator delegation.',
  },
  {
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' as `0x${string}`,
    name: 'Bohr Cross-Chain Bridge',
    protocol: 'Bohr Bridge',
    category: 'Bridge',
    isVerified: true,
    websiteUrl: 'https://bridge.bohr.life',
    description: 'Bi-directional asset bridge connecting BOT Chain with Ethereum and BSC.',
  },
  {
    address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43' as `0x${string}`,
    name: 'BOT NFT Marketplace',
    protocol: 'BOHR NFT Hub',
    category: 'NFT Marketplace',
    isVerified: true,
    websiteUrl: 'https://market.bohr.life',
    description: 'Marketplace app for digital items on BOT Chain.',
  },
  {
    address: '0x9ac64Cc6e4415144C455BD8E4837Fea55603e5c3' as `0x${string}`,
    name: 'Bohr Liquidity Vault',
    protocol: 'Bohr Lending Protocol',
    category: 'Lending',
    isVerified: true,
    websiteUrl: 'https://lend.bohr.life',
    description: 'Lending app on BOT Chain.',
  },
  {
    address: '0xDeaD00000000000000000000000000000000dead' as `0x${string}`,
    name: 'Burn Blackhole',
    protocol: 'Dead Address',
    category: 'Burn Address',
    isVerified: false,
    description: 'Burn address.',
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as `0x${string}`,
    name: 'Unverified Airdrop Claimer',
    protocol: 'Unknown App',
    category: 'Unknown App',
    isVerified: false,
    description: 'Unknown app - be cautious.',
  },
];

export function getSpenderMetadata(address: string): SpenderInfo {
  const normalized = address.toLowerCase();
  const found = KNOWN_SPENDERS.find((s) => s.address.toLowerCase() === normalized);
  if (found) return found;

  return {
    address: address as `0x${string}`,
    name: `App ${address.slice(0, 6)}...${address.slice(-4)}`,
    protocol: 'Unknown App',
    category: 'Unknown App',
    isVerified: false,
    description: 'Unknown app on BOT Chain. Review carefully.',
  };
}

// Unlimited allowance threshold (e.g., 2^128 or close to max uint256)
export const UNLIMITED_ALLOWANCE_THRESHOLD =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n / 2n;

export function evaluateRisk(
  allowanceRaw: bigint,
  isSpenderVerified: boolean,
  balanceRaw: bigint
): { riskLevel: RiskLevel; reasons: string[] } {
  const reasons: string[] = [];
  const isUnlimited = allowanceRaw >= UNLIMITED_ALLOWANCE_THRESHOLD;

  if (isUnlimited) {
    reasons.push('Unlimited access (can spend all tokens in your wallet)');
  }

  if (!isSpenderVerified) {
    reasons.push('Unknown app on BOT Chain');
  }

  if (balanceRaw > 0n && allowanceRaw > balanceRaw && !isUnlimited) {
    reasons.push('Spending limit is higher than your current balance');
  }

  if (isUnlimited && !isSpenderVerified) {
    return { riskLevel: 'CRITICAL', reasons };
  }

  if (isUnlimited) {
    return { riskLevel: 'ELEVATED', reasons };
  }

  if (!isSpenderVerified && allowanceRaw > 0n) {
    return { riskLevel: 'MEDIUM', reasons };
  }

  if (allowanceRaw === 0n) {
    return { riskLevel: 'SAFE', reasons: ['No access - app cannot spend your tokens'] };
  }

  return { riskLevel: 'SAFE', reasons: ['Verified app with a set spending limit'] };
}
