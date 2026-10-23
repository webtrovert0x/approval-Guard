import React, { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { erc20Abi } from '../config/abi';
import type { ApprovalRecord } from '../types';
import {
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { playAlertChime } from '../services/approvalScanner';

interface BatchRevokeModalProps {
  records: ApprovalRecord[];
  onClose: () => void;
  onBatchComplete: (revokedIds: string[]) => void;
}

export const BatchRevokeModal: React.FC<BatchRevokeModalProps> = ({
  records,
  onClose,
  onBatchComplete,
}) => {
  const { isConnected } = useAccount();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const handleStartBatch = async () => {
    if (!isConnected) {
      setErrorMsg('Please connect your wallet to execute batch revocations.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    const successfullyRevoked: string[] = [];
    const hashes: Record<string, string> = {};

    for (let i = 0; i < records.length; i++) {
      setCurrentIndex(i);
      const rec = records[i];

      try {
        const hash = await writeContractAsync({
          address: rec.token.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [rec.spender.address, 0n],
        });

        hashes[rec.id] = hash;
        successfullyRevoked.push(rec.id);

        StorageService.addHistoryItem({
          timestamp: Date.now(),
          tokenSymbol: rec.token.symbol,
          tokenAddress: rec.token.address,
          spenderName: rec.spender.name,
          spenderAddress: rec.spender.address,
          type: 'REVOKE',
          previousAllowance: rec.allowanceFormatted,
          newAllowance: '0.00',
          txHash: hash,
        });

        playAlertChime('revoke');
      } catch (err: unknown) {
        const e = err as Error;
        console.error(`Failed to revoke ${rec.token.symbol} for ${rec.spender.name}`, e);
        setErrorMsg(`Stopped at item ${i + 1}: ${e.message || 'Signature rejected'}`);
        break;
      }
    }

    setCompletedIds(successfullyRevoked);
    setTxHashes(hashes);
    setIsProcessing(false);

    if (successfullyRevoked.length > 0) {
      onBatchComplete(successfullyRevoked);
    }
  };

  const isDone = completedIds.length === records.length;
  const progressPct =
    records.length > 0 ? Math.round((completedIds.length / records.length) * 100) : 0;

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
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Disconnect Selected Apps
            </h3>
            <p className="text-xs text-slate-400">
              Remove token access for {records.length} selected apps
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1.5">
              <span>Progress:</span>
              <span className="mono">
                {completedIds.length} of {records.length} Completed ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Items Queue */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {records.map((rec, idx) => {
              const isFinished = completedIds.includes(rec.id);
              const isCurrent = isProcessing && currentIndex === idx;

              return (
                <div
                  key={rec.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                    isFinished
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : isCurrent
                      ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isFinished ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] mono">
                        {idx + 1}
                      </span>
                    )}

                    <div>
                      <div className="font-semibold text-slate-200">
                        {rec.token.symbol} → {rec.spender.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mono">
                        Current: {rec.allowanceFormatted}
                      </div>
                    </div>
                  </div>

                  {txHashes[rec.id] && (
                    <a
                      href={`https://scan.botchain.ai/tx/${txHashes[rec.id]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1"
                    >
                      <span>BOT Scan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
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
              onClick={handleStartBatch}
              disabled={isProcessing}
              id="btn-start-batch-revoke"
              className="btn btn-danger text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Disconnecting app {currentIndex + 1}...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect All ({records.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
