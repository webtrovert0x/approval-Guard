import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { erc20Abi } from '../config/abi';
import type { ApprovalRecord } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { playAlertChime } from '../services/approvalScanner';

interface RevokeModalProps {
  record: ApprovalRecord | null;
  onClose: () => void;
  onSuccess: (recordId: string, txHash: string) => void;
}

export const RevokeModal: React.FC<RevokeModalProps> = ({
  record,
  onClose,
  onSuccess,
}) => {
  const { isConnected } = useAccount();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real on-chain writeContract
  const {
    data: txHash,
    isPending: isSignPending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  if (!record) return null;

  const handleExecuteRevoke = async () => {
    setErrorMsg(null);

    if (!isConnected) {
      setErrorMsg('Please connect your wallet to sign the revocation transaction.');
      return;
    }

    try {
      // Call token.approve(spender, 0)
      const hash = await writeContractAsync({
        address: record.token.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [record.spender.address, 0n],
      });

      playAlertChime('revoke');

      // Record in history
      StorageService.addHistoryItem({
        timestamp: Date.now(),
        tokenSymbol: record.token.symbol,
        tokenAddress: record.token.address,
        spenderName: record.spender.name,
        spenderAddress: record.spender.address,
        type: 'REVOKE',
        previousAllowance: record.allowanceFormatted,
        newAllowance: '0.00',
        txHash: hash,
      });

      onSuccess(record.id, hash);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Revocation transaction failed:', e);
      setErrorMsg(e.message || 'Transaction rejected or failed.');
    }
  };

  const finalTxHash = txHash;
  const isDone = isConfirmed;
  const isLoading = isSignPending || isConfirming;

  return (
    <div className="modal-overlay">
      <div className="glass-panel bg-slate-900/95 border border-slate-700 max-w-lg w-full p-6 rounded-2xl shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Disconnect App
            </h3>
            <p className="text-xs text-slate-400">
              Stop this app from spending your tokens
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Target Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Token:</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>{record.token.name}</span>
                <span className="badge badge-safe text-[9px] py-0.5 px-1.5">
                  {record.token.symbol}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Connected App:</span>
              <span className="font-semibold text-slate-200">
                {record.spender.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Access:</span>
              <span className="font-bold text-rose-400 mono">
                {record.allowanceFormatted}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400">New Access:</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mono">
                <span>0.00 {record.token.symbol}</span>
                <span className="text-[10px] text-emerald-500 font-normal">
                  (Disconnected)
                </span>
              </div>
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-800/40 text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This completely removes this app's permission to spend your tokens. Once confirmed in your wallet, this app will never be able to touch your tokens.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {isDone && finalTxHash && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>App Disconnected Successfully!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                This app can no longer spend your tokens.
              </p>
              <div className="pt-2">
                <a
                  href={`https://scan.bohr.life/tx/${finalTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
                >
                  <span>View on Bohr Scan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-4"
          >
            {isDone ? 'Close' : 'Cancel'}
          </button>

          {!isDone && (
            <button
              onClick={handleExecuteRevoke}
              disabled={isLoading}
              id="btn-confirm-revoke"
              className="btn btn-danger text-xs py-2 px-4 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isSignPending
                      ? 'Waiting for wallet...'
                      : isConfirming
                      ? 'Saving to BOT Chain...'
                      : 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <span>Disconnect App</span>
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
