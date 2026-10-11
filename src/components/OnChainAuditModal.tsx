import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import {
  Zap,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
  ArrowRight,
  Fuel,
  Lock,
} from 'lucide-react';
import { DEFAULT_APPROVAL_GUARD_ADDRESS, approvalGuardAbi } from '../config/abi';
import { StorageService } from '../services/storage';
import { playAlertChime } from '../services/approvalScanner';

interface OnChainAuditModalProps {
  targetWallet: string;
  onClose: () => void;
  onAuditConfirmed: (txHash: string) => void;
}

export const OnChainAuditModal: React.FC<OnChainAuditModalProps> = ({
  targetWallet,
  onClose,
  onAuditConfirmed,
}) => {
  const { isConnected } = useAccount();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    data: txHash,
    isPending: isSignPending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const handleExecuteAudit = async () => {
    setErrorMsg(null);

    if (!isConnected) {
      setErrorMsg('Please connect your wallet to execute an on-chain audit on BOT Chain.');
      return;
    }

    if (!targetWallet.startsWith('0x') || targetWallet.length !== 42) {
      setErrorMsg('Invalid target wallet address format.');
      return;
    }

    try {
      // Call executeAuditScan(targetWallet) with 0.0001 BOT
      const hash = await writeContractAsync({
        address: DEFAULT_APPROVAL_GUARD_ADDRESS,
        abi: approvalGuardAbi,
        functionName: 'executeAuditScan',
        args: [targetWallet as `0x${string}`],
        value: parseEther('0.0001'),
      });

      playAlertChime('revoke');

      StorageService.addHistoryItem({
        timestamp: Date.now(),
        tokenSymbol: 'AUDIT',
        tokenAddress: DEFAULT_APPROVAL_GUARD_ADDRESS,
        spenderName: 'ApprovalGuard.sol',
        spenderAddress: DEFAULT_APPROVAL_GUARD_ADDRESS,
        type: 'RULE_CHANGE',
        previousAllowance: 'Unverified',
        newAllowance: 'Gas-Metered On-Chain Audit',
        txHash: hash,
      });

      onAuditConfirmed(hash);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Audit transaction rejected or failed:', e);
      setErrorMsg(e.message || 'Transaction rejected by wallet.');
    }
  };

  const finalTxHash = txHash;
  const isDone = isConfirmed;
  const isLoading = isSignPending || isConfirming;

  return (
    <div className="modal-overlay">
      <div className="glass-panel bg-slate-900/95 border border-slate-700 max-w-lg w-full p-6 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-current text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Scan Wallet</span>
              <span className="badge badge-safe text-[10px]">0.0001 BOT</span>
            </h3>
            <p className="text-xs text-slate-400">
              Check which apps can spend your tokens
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Wallet:</span>
              <span className="font-semibold text-slate-200 mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {targetWallet.slice(0, 10)}...{targetWallet.slice(-8)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan Fee:</span>
              </span>
              <span className="font-extrabold text-amber-300 mono text-sm">
                0.0001 BOT
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-300">
              This scans your wallet to find all connected apps and check if any of them have unlimited access to your tokens.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {isDone && finalTxHash && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Scan Complete!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                All connected apps have been scanned. Your results are now showing on the dashboard.
              </p>
              <div className="pt-2">
                <a
                  href={`https://scan.bohr.life/tx/${finalTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
                >
                  <span>View Receipt on Bohr Scan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-4"
          >
            {isDone ? 'Close' : 'Cancel'}
          </button>

          {!isDone && (
            <button
              onClick={handleExecuteAudit}
              disabled={isLoading}
              id="btn-confirm-gas-audit"
              className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isSignPending
                      ? 'Confirm in your wallet...'
                      : isConfirming
                      ? 'Scanning wallet...'
                      : 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Start Scan (0.0001 BOT)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
