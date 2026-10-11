import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Edit3,
  Trash2,
  AlertOctagon,
} from 'lucide-react';
import type { ApprovalRecord } from '../types';

interface ApprovalTableProps {
  approvals: ApprovalRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onRevoke: (record: ApprovalRecord) => void;
  onEditCap: (record: ApprovalRecord) => void;
  activeAccount?: string;
  hasAuditedWallet: boolean;
  onRequireAuditScan: () => void;
  auditTxHash?: string | null;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  approvals,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onRevoke,
  onEditCap,
  activeAccount,
  hasAuditedWallet,
  onRequireAuditScan,
  auditTxHash,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const isAllSelected =
    approvals.length > 0 && selectedIds.length === approvals.length;

  // 1. Fee Gate: Wallet has not paid the on-chain scan fee yet
  if (!hasAuditedWallet) {
    return (
      <div className="empty-state-card border-amber-500/30 bg-slate-900/80 my-2 p-5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h3 className="text-sm font-bold text-slate-100">
            Security Scan Required
          </h3>
          <span className="badge badge-elevated text-[10px]">
            0.0001 BOT Fee
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          {activeAccount ? (
            <>
              Wallet <span className="mono text-slate-200">{activeAccount.slice(0, 10)}...{activeAccount.slice(-8)}</span> has not been checked yet. BOT Approval Guard requires a <strong className="text-amber-300">0.0001 BOT scan fee</strong> to check which apps have permission to spend your tokens.
            </>
          ) : (
            'Connect your wallet or enter an address to scan which apps have access to your tokens.'
          )}
        </p>

        <div className="mt-3.5 flex items-center justify-center gap-3">
          <button
            onClick={onRequireAuditScan}
            id="btn-gate-execute-audit"
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Run Security Scan (0.0001 BOT)</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Audited, but zero approvals found
  if (approvals.length === 0) {
    return (
      <div className="empty-state-card my-6">
        <div className="empty-state-icon-box">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h3 className="text-base font-bold text-slate-100">No Connected Apps Found</h3>
          <span className="badge badge-safe text-[10px]">Scan Completed</span>
        </div>
        <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Security scan finished. No apps currently have permission to spend your tokens. Your wallet is safe!
        </p>
        {auditTxHash && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <a
              href={`https://scan.bohr.life/tx/${auditTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <span>View Scan Receipt on Bohr Scan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800 my-4 shadow-xl">
      {/* Desktop View Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  title="Select all"
                />
              </th>
              <th className="py-4 px-4 whitespace-nowrap">Token & Balance</th>
              <th className="py-4 px-4 whitespace-nowrap">Connected App</th>
              <th className="py-4 px-4 whitespace-nowrap">Access Limit</th>
              <th className="py-4 px-4 whitespace-nowrap">Risk Level</th>
              <th className="py-4 pr-4 pl-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {approvals.map((record) => {
              const isSelected = selectedIds.includes(record.id);

              return (
                <tr
                  key={record.id}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    record.riskLevel === 'CRITICAL'
                      ? 'bg-rose-950/15'
                      : record.riskLevel === 'ELEVATED'
                      ? 'bg-amber-950/10'
                      : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-4 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(record.id)}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Token & Balance */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                        {record.token.logoUrl ? (
                          <img
                            src={record.token.logoUrl}
                            alt={record.token.symbol}
                            className="w-5 h-5 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          record.token.symbol.slice(0, 3)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{record.token.symbol}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({record.token.name})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Balance:{' '}
                          <span className="text-slate-300 font-semibold mono">
                            {record.userBalanceFormatted} {record.token.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Spender & Protocol */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          {record.spender.name}
                        </span>
                        {record.spender.isVerified ? (
                          <span className="badge badge-safe text-[9px] py-0.5 px-2">
                            Verified App
                          </span>
                        ) : (
                          <span className="badge badge-critical text-[9px] py-0.5 px-2">
                            Unknown App
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 mono">
                        <span>
                          {record.spender.address.slice(0, 8)}...
                          {record.spender.address.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(record.spender.address)}
                          title="Copy app address"
                          className="hover:text-white transition"
                        >
                          {copiedAddress === record.spender.address ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                          )}
                        </button>
                        <a
                          href={`https://scan.bohr.life/address/${record.spender.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View app on Bohr Scan"
                          className="hover:text-emerald-400 transition"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-500 hover:text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Allowance Amount */}
                  <td className="py-4 px-4">
                    {record.isUnlimited ? (
                      <div className="inline-flex flex-col">
                        <span className="badge badge-critical text-[10px] font-extrabold tracking-wide px-2.5 py-1 flex items-center gap-1 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          UNLIMITED (∞)
                        </span>
                        <span className="text-[10px] text-rose-400/90 mt-1">
                          Can spend all your tokens
                        </span>
                      </div>
                    ) : (
                      <div className="mono">
                        <span className="text-slate-100 font-bold">
                          {record.allowanceFormatted}
                        </span>{' '}
                        <span className="text-slate-400 text-[10px]">
                          {record.token.symbol}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Risk Assessment */}
                  <td className="py-4 px-4 max-w-xs">
                    <div>
                      {record.riskLevel === 'CRITICAL' && (
                        <span className="badge badge-critical">Critical Risk</span>
                      )}
                      {record.riskLevel === 'ELEVATED' && (
                        <span className="badge badge-elevated">High Risk</span>
                      )}
                      {record.riskLevel === 'MEDIUM' && (
                        <span className="badge badge-medium">Medium Risk</span>
                      )}
                      {record.riskLevel === 'SAFE' && (
                        <span className="badge badge-safe">Safe</span>
                      )}

                      <div className="mt-1.5 space-y-1">
                        {record.riskReasons.map((reason, idx) => (
                          <div
                            key={idx}
                            className="text-[10px] text-slate-400 flex items-start gap-1 leading-tight"
                          >
                            <span className="text-slate-500">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Actions: Revoke & Edit */}
                  <td className="py-4 pr-4 pl-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onRevoke(record)}
                        id={`btn-revoke-${record.id}`}
                        className="btn btn-danger text-xs py-1.5 px-3 flex items-center gap-1 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                        title="Remove this app's access to your tokens"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>

                      <button
                        onClick={() => onEditCap(record)}
                        id={`btn-edit-${record.id}`}
                        className="btn btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                        title="Set a spending limit for this app"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                        <span>Set Limit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
