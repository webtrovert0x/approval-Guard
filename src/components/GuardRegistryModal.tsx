import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import {
  FileCode,
  ExternalLink,
  CheckCircle2,
  Lock,
  X,
} from 'lucide-react';
import { DEFAULT_APPROVAL_GUARD_ADDRESS, approvalGuardAbi } from '../config/abi';
import { KNOWN_TOKENS, KNOWN_SPENDERS } from '../config/tokensAndSpenders';
import { StorageService } from '../services/storage';

interface GuardRegistryModalProps {
  onClose: () => void;
}

export const GuardRegistryModal: React.FC<GuardRegistryModalProps> = ({
  onClose,
}) => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'rules' | 'trusted' | 'contract'>('rules');

  // Form states
  const [selectedToken, setSelectedToken] = useState<string>(KNOWN_TOKENS[1].address);
  const [maxLimit, setMaxLimit] = useState<string>('500');
  const [isMonitored, setIsMonitored] = useState<boolean>(true);

  // Spender trust form
  const [spenderAddress, setSpenderAddress] = useState<string>(KNOWN_SPENDERS[0].address);
  const [protocolName, setProtocolName] = useState<string>(KNOWN_SPENDERS[0].protocol);
  const [isTrusted, setIsTrusted] = useState<boolean>(true);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { writeContractAsync } = useWriteContract();

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!isConnected) {
      setFeedbackMsg('Please connect your wallet to save rules to ApprovalGuard.sol on BOT Chain.');
      return;
    }

    setIsSubmitting(true);

    const tokenObj = KNOWN_TOKENS.find(
      (t) => t.address.toLowerCase() === selectedToken.toLowerCase()
    );

    try {
      const rawLimit = parseUnits(maxLimit, tokenObj?.decimals || 18);
      await writeContractAsync({
        address: DEFAULT_APPROVAL_GUARD_ADDRESS,
        abi: approvalGuardAbi,
        functionName: 'configureTokenRule',
        args: [selectedToken as `0x${string}`, rawLimit, isMonitored],
      });

      // Save locally
      StorageService.saveMonitoringRule({
        tokenAddress: selectedToken,
        tokenSymbol: tokenObj?.symbol || 'TOKEN',
        maxLimit: `${maxLimit} ${tokenObj?.symbol || ''}`,
        isMonitored,
        lastUpdated: Date.now(),
      });

      setFeedbackMsg(`Rule for ${tokenObj?.symbol} registered on ApprovalGuard.sol!`);
    } catch (err: unknown) {
      const e = err as Error;
      setFeedbackMsg(`Error: ${e.message || 'Transaction rejected'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSpenderTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!isConnected) {
      setFeedbackMsg('Please connect your wallet to save spender trust status to ApprovalGuard.sol.');
      return;
    }

    setIsSubmitting(true);

    try {
      await writeContractAsync({
        address: DEFAULT_APPROVAL_GUARD_ADDRESS,
        abi: approvalGuardAbi,
        functionName: 'setSpenderTrust',
        args: [spenderAddress as `0x${string}`, isTrusted, protocolName],
      });

      setFeedbackMsg(`Trust status for ${protocolName} recorded on-chain!`);
    } catch (err: unknown) {
      const e = err as Error;
      setFeedbackMsg(`Error: ${e.message || 'Transaction rejected'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel bg-slate-900/95 border border-slate-700 max-w-2xl w-full p-6 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Security Rules</span>
              <span className="badge badge-safe text-[9px] py-0.5 px-2">
                Wallet Protection
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Set your spending limits, alert rules, and trusted apps
            </p>
          </div>
        </div>

        {/* Core Principles Callout */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>How Protection Works</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Each token keeps its own list of connected apps. Approval Guard cannot disconnect an app without your wallet confirmation. You can use this screen to set maximum spending limits and save apps you trust.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('rules');
              setFeedbackMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'rules'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Token Limits
          </button>
          <button
            onClick={() => {
              setActiveTab('trusted');
              setFeedbackMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'trusted'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trusted Apps
          </button>
          <button
            onClick={() => {
              setActiveTab('contract');
              setFeedbackMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'contract'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Contract
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab 1: Token Threshold Rules */}
        {activeTab === 'rules' && (
          <form onSubmit={handleSaveRule} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Select Token:
              </label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {KNOWN_TOKENS.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} - {token.name} ({token.address.slice(0, 10)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Maximum Safe Spending Limit:
              </label>
              <input
                type="number"
                min="0"
                value={maxLimit}
                onChange={(e) => setMaxLimit(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Any app asking for more than this will trigger a security alert.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-is-monitored"
                checked={isMonitored}
                onChange={(e) => setIsMonitored(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer"
              />
              <label
                htmlFor="check-is-monitored"
                className="text-slate-300 font-medium cursor-pointer"
              >
                Alert me if this token limit is exceeded
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary text-xs py-2 px-4 w-full"
              >
                {isSubmitting ? 'Saving to BOT Chain...' : 'Save Limit'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Trusted Spenders */}
        {activeTab === 'trusted' && (
          <form onSubmit={handleSaveSpenderTrust} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                App Name:
              </label>
              <input
                type="text"
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                placeholder="e.g. BOTSwap Router v2"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                App Address:
              </label>
              <input
                type="text"
                value={spenderAddress}
                onChange={(e) => setSpenderAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-is-trusted"
                checked={isTrusted}
                onChange={(e) => setIsTrusted(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer"
              />
              <label
                htmlFor="check-is-trusted"
                className="text-slate-300 font-medium cursor-pointer"
              >
                Mark as Trusted App
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary text-xs py-2 px-4 w-full"
              >
                {isSubmitting ? 'Saving to BOT Chain...' : 'Save Trusted App'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Contract Details */}
        {activeTab === 'contract' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Contract Address:</span>
                <span className="mono text-emerald-400 font-semibold">
                  {DEFAULT_APPROVAL_GUARD_ADDRESS}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-slate-200 font-semibold">
                  BOT Chain Mainnet (Chain ID: 677)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-semibold">Live & Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RPC Endpoint:</span>
                <span className="text-slate-200 mono">https://rpc.botchain.ai</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href={`https://scan.botchain.ai/address/${DEFAULT_APPROVAL_GUARD_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <span>View on BOT Scan</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
