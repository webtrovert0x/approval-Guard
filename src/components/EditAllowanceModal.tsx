import React, { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { erc20Abi } from '../config/abi';
import type { ApprovalRecord } from '../types';
import {
  Edit3,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
  ArrowRight,
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface EditAllowanceModalProps {
  record: ApprovalRecord | null;
  onClose: () => void;
  onSuccess: (recordId: string, newAllowanceFormatted: string, txHash: string) => void;
}

export const EditAllowanceModal: React.FC<EditAllowanceModalProps> = ({
  record,
  onClose,
  onSuccess,
}) => {
  const { isConnected } = useAccount();
  const [customValue, setCustomValue] = useState<string>('50');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContractAsync, isPending: isSignPending } = useWriteContract();

  if (!record) return null;

  const handlePresetClick = (amount: string) => {
    setCustomValue(amount);
  };

  const handleExecuteUpdate = async () => {
    setErrorMsg(null);
    if (!customValue || isNaN(Number(customValue)) || Number(customValue) < 0) {
      setErrorMsg('Please enter a valid positive allowance number.');
      return;
    }

    if (!isConnected) {
      setErrorMsg('Please connect your wallet to authorize this allowance update.');
      return;
    }

    try {
      const rawUnits = parseUnits(customValue, record.token.decimals);
      const hash = await writeContractAsync({
        address: record.token.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [record.spender.address, rawUnits],
      });

      StorageService.addHistoryItem({
        timestamp: Date.now(),
        tokenSymbol: record.token.symbol,
        tokenAddress: record.token.address,
        spenderName: record.spender.name,
        spenderAddress: record.spender.address,
        type: 'ALLOWANCE_UPDATE',
        previousAllowance: record.allowanceFormatted,
        newAllowance: `${customValue} ${record.token.symbol}`,
        txHash: hash,
      });

      onSuccess(record.id, `${customValue}`, hash);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Update allowance failed', e);
      setErrorMsg(e.message || 'Transaction rejected or failed.');
    }
  };

  const finalTxHash = null;
  const isDone = false;
  const isLoading = isSignPending;

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
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Set Spending Limit
            </h3>
            <p className="text-xs text-slate-400">
              Choose the maximum amount this app can spend
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Token:</span>
              <span className="font-semibold text-slate-200">
                {record.token.name} ({record.token.symbol})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Connected App:</span>
              <span className="font-semibold text-slate-200">
                {record.spender.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Limit:</span>
              <span className="font-bold text-rose-400 mono">
                {record.allowanceFormatted}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Set New Spending Limit ({record.token.symbol}):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 mono"
              />
              <span className="font-bold text-slate-400 mono">
                {record.token.symbol}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-slate-500 text-[11px]">Quick limits:</span>
              {['10', '50', '100', '500'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetClick(val)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] mono transition"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {isDone && finalTxHash && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Spending Limit Updated!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                New limit of {customValue} {record.token.symbol} has been set.
              </p>
              <div className="pt-2">
                <a
                  href={`https://scan.bohr.life/tx/${finalTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
                >
                  <span>View on Bohr Scan</span>
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
              onClick={handleExecuteUpdate}
              disabled={isLoading}
              id="btn-confirm-edit-allowance"
              className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Save Limit</span>
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
