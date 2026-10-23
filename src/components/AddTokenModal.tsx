import React, { useState } from 'react';
import type { TokenInfo } from '../types';
import { fetchCustomTokenMetadata } from '../services/approvalScanner';
import { StorageService } from '../services/storage';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Coins,
} from 'lucide-react';

interface AddTokenModalProps {
  onClose: () => void;
  onTokenAdded: (token: TokenInfo) => void;
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({
  onClose,
  onTokenAdded,
}) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState<TokenInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setVerifiedToken(null);

    const trimmed = tokenAddress.trim();
    if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
      setErrorMsg('Please enter a valid token address starting with 0x...');
      return;
    }

    setIsVerifying(true);
    try {
      const meta = await fetchCustomTokenMetadata(trimmed as `0x${string}`);
      setVerifiedToken(meta);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(
        e.message || 'Could not find token details on BOT Chain.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdd = () => {
    if (!verifiedToken) return;
    StorageService.addCustomToken(verifiedToken);
    onTokenAdded(verifiedToken);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel bg-slate-900/95 border border-slate-700 max-w-md w-full p-6 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Add a Token
            </h3>
            <p className="text-xs text-slate-400">
              Add any token on BOT Chain to your watch list
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <form onSubmit={handleVerify}>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Token Address:
            </label>
            <div className="relative">
              <input
                type="text"
                id="input-custom-token-address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-20 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 mono"
              />
              <button
                type="submit"
                disabled={isVerifying || !tokenAddress.trim()}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1 transition"
              >
                {isVerifying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Check</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {verifiedToken && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Token Found</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="font-semibold text-white">{verifiedToken.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Symbol:</span>{' '}
                  <span className="font-semibold text-white mono">{verifiedToken.symbol}</span>
                </div>
                <div>
                  <span className="text-slate-400">Decimals:</span>{' '}
                  <span className="font-semibold text-white mono">{verifiedToken.decimals}</span>
                </div>
                <div>
                  <span className="text-slate-400">Chain:</span>{' '}
                  <span className="text-emerald-400 font-semibold">BOT (677)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!verifiedToken}
            id="btn-confirm-add-token"
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add to Monitored List</span>
          </button>
        </div>
      </div>
    </div>
  );
};
