import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import type { ApprovalHistoryItem } from '../types';
import {
  History,
  ExternalLink,
  Trash2,
  Download,
  X,
  ArrowRight,
} from 'lucide-react';

interface ApprovalHistoryModalProps {
  onClose: () => void;
}

export const ApprovalHistoryModal: React.FC<ApprovalHistoryModalProps> = ({
  onClose,
}) => {
  const [historyItems, setHistoryItems] = useState<ApprovalHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(StorageService.getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your activity history?')) {
      StorageService.clearHistory();
      setHistoryItems([]);
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `bot-approval-guard-history-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <History className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Activity History
              </h3>
              <p className="text-xs text-slate-400">
                Record of apps disconnected or spending limits changed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-8">
            {historyItems.length > 0 && (
              <>
                <button
                  onClick={handleExportJson}
                  title="Export history as JSON"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  title="Clear history"
                  className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 max-h-96 overflow-y-auto space-y-2.5 text-xs pr-1">
          {historyItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No actions recorded yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Disconnecting apps or changing spending limits will show up here.
              </p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.type === 'REVOKE' ? (
                      <span className="badge badge-safe text-[9px] py-0.5 px-2">
                        DISCONNECTED
                      </span>
                    ) : (
                      <span className="badge badge-cyan text-[9px] py-0.5 px-2 bg-cyan-950 text-cyan-300 border border-cyan-800">
                        LIMIT CHANGED
                      </span>
                    )}
                    <span className="font-semibold text-slate-200">
                      {item.tokenSymbol}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-300">{item.spenderName}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mono">
                    <span className="text-rose-400">{item.previousAllowance}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-emerald-400 font-bold">{item.newAllowance}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                  <span className="text-[10px] text-slate-500 mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  {item.txHash && (
                    <a
                      href={`https://scan.bohr.life/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 font-semibold"
                    >
                      <span className="mono">
                        {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
