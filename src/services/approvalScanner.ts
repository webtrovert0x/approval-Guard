import { createPublicClient, http, formatUnits } from 'viem';
import { botChain } from '../config/chain';
import { erc20Abi } from '../config/abi';
import { KNOWN_SPENDERS, evaluateRisk, UNLIMITED_ALLOWANCE_THRESHOLD } from '../config/tokensAndSpenders';
import type { ApprovalRecord, TokenInfo, SpenderInfo } from '../types';

export const publicClient = createPublicClient({
  chain: botChain,
  transport: http('https://rpc.botchain.ai'),
});

// Web Audio API Security Alert Sound (no external assets needed)
export function playAlertChime(type: 'warning' | 'revoke' | 'critical' = 'warning') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'critical') {
      // High alert dual tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'revoke') {
      // Soft success chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // General warning ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
    console.debug('Audio chime skipped', e);
  }
}

/**
 * Scan on-chain allowances for a user address across a list of tokens and spenders
 */
export async function scanWalletApprovals(
  userAddress: `0x${string}`,
  tokens: TokenInfo[],
  spendList: SpenderInfo[] = KNOWN_SPENDERS
): Promise<ApprovalRecord[]> {
  const records: ApprovalRecord[] = [];

  const tokenPromises = tokens.map(async (token) => {
    let balanceRaw = 0n;
    try {
      balanceRaw = (await publicClient.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      })) as bigint;
    } catch {
      balanceRaw = 0n;
    }

    const formattedBalance = formatUnits(balanceRaw, token.decimals);

    const spenderPromises = spendList.map(async (spender) => {
      try {
        const allowanceRaw = (await publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [userAddress, spender.address],
        })) as bigint;

        if (allowanceRaw > 0n) {
          const isUnlimited = allowanceRaw >= UNLIMITED_ALLOWANCE_THRESHOLD;
          let allowanceFormatted = '';
          if (isUnlimited) {
            allowanceFormatted = 'Unlimited (∞)';
          } else {
            allowanceFormatted = formatUnits(allowanceRaw, token.decimals);
          }

          const { riskLevel, reasons } = evaluateRisk(
            allowanceRaw,
            spender.isVerified,
            balanceRaw
          );

          records.push({
            id: `${token.address.toLowerCase()}-${spender.address.toLowerCase()}`,
            token,
            spender,
            allowanceRaw,
            allowanceFormatted,
            isUnlimited,
            userBalanceRaw: balanceRaw,
            userBalanceFormatted: formattedBalance,
            riskLevel,
            riskReasons: reasons,
            lastUpdated: Date.now(),
          });
        }
      } catch (err) {
        console.debug(`Skipping allowance check for ${token.symbol} -> ${spender.name}`, err);
      }
    });

    await Promise.allSettled(spenderPromises);
  });

  await Promise.allSettled(tokenPromises);
  return records;
}

/**
 * Fetch token metadata for any custom token address provided by the user
 */
export async function fetchCustomTokenMetadata(
  tokenAddress: `0x${string}`
): Promise<TokenInfo> {
  try {
    const [name, symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'name',
      }) as Promise<string>,
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      }) as Promise<string>,
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }) as Promise<number>,
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      isCustom: true,
    };
  } catch (error) {
    throw new Error('Unable to read ERC-20 metadata from BOT Chain for this address.');
  }
}
