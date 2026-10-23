import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Edit3,
  Trash2,
  Zap,
  ArrowRight,
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
      <div className="glass-panel my-6 p-8 sm:p-10 border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Security Scan Required
          </h3>
          <span className="badge badge-elevated text-[11px] py-1 px-3">
            0.0001 BOT Fee
          </span>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          {activeAccount ? (
            <>
              Wallet <span className="mono font-semibold text-slate-200">{activeAccount.slice(0, 10)}...{activeAccount.slice(-8)}</span> has not been checked yet. Approval Guard requires a <strong className="text-amber-300">0.0001 BOT scan fee</strong> to query live smart contracts on BOT Chain and identify apps with permission to spend your tokens.
            </>
          ) : (
            'Connect your wallet or enter an address above to scan which apps have access to your tokens.'
          )}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onRequireAuditScan}
            id="btn-gate-execute-audit"
            className="btn btn-primary text-sm py-3 px-6 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] font-bold"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-current" />
            <span>Run Security Scan (0.0001 BOT)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Audited with Zero Approvals Found
  if (approvals.length === 0) {
    return (
      <div className="glass-panel my-6 p-8 sm:p-12 text-center flex flex-col items-center border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
          <h3 className="text-lg font-bold text-white">Fortified: No Active Approvals Found</h3>
          <span className="badge badge-safe text-[10px]">100% Safe</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          The on-chain security audit completed successfully. No applications or smart contracts currently hold token spending permissions for this wallet.
        </p>
        {auditTxHash && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <a
              href={`https://scan.botchain.ai/tx/${auditTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              <span>View On-Chain Scan Receipt on BOT Scan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // 3. Render Active Approvals Table
  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800/90 my-3 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 pl-5 pr-2 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  title="Select all"
                />
              </th>
              <th className="py-4 px-4 whitespace-nowrap">Asset / Token</th>
              <th className="py-4 px-4 whitespace-nowrap">Approved Spender</th>
              <th className="py-4 px-4 whitespace-nowrap">Allowance Limit</th>
              <th className="py-4 px-4 whitespace-nowrap">Risk Classification</th>
              <th className="py-4 pr-5 pl-4 text-right whitespace-nowrap">Safety Actions</th>
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
                  {/* Select Checkbox */}
                  <td className="py-4 pl-5 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(record.id)}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </td>

                  {/* Token Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-emerald-400 flex-shrink-0 shadow-sm">
                        {record.token.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{record.token.symbol}</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            ({record.token.name})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span className="mono">{record.token.address.slice(0, 6)}...{record.token.address.slice(-4)}</span>
                          <button
                            onClick={() => handleCopy(record.token.address)}
                            className="hover:text-white"
                            title="Copy token address"
                          >
                            {copiedAddress === record.token.address ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`https://scan.botchain.ai/token/${record.token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400"
                            title="View token on BOT Scan"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Spender Info */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">
                          {record.spender.name}
                        </span>
                        {record.spender.isVerified ? (
                          <span className="badge badge-safe text-[9px] py-0.5 px-1.5">
                            Verified
                          </span>
                        ) : (
                          <span className="badge badge-critical text-[9px] py-0.5 px-1.5">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="mono">{record.spender.address.slice(0, 6)}...{record.spender.address.slice(-4)}</span>
                        <button
                          onClick={() => handleCopy(record.spender.address)}
                          className="hover:text-white"
                          title="Copy spender address"
                        >
                          {copiedAddress === record.spender.address ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://scan.botchain.ai/address/${record.spender.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-400"
                          title="View contract on BOT Scan"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Allowance Limit */}
                  <td className="py-4 px-4">
                    {record.isUnlimited ? (
                      <div>
                        <span className="badge badge-critical text-[10px] py-1 px-2.5 font-bold">
                          Unlimited (∞)
                        </span>
                        <div className="text-[10px] text-rose-400/80 mt-1 font-medium">
                          Spender can withdraw any amount
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="mono font-bold text-slate-200">
                          {record.allowanceFormatted} {record.token.symbol}
                        </span>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          Capped limit
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Risk Level */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div>
                        {record.riskLevel === 'CRITICAL' && (
                          <span className="badge badge-critical text-[10px]">
                            Critical Risk
                          </span>
                        )}
                        {record.riskLevel === 'ELEVATED' && (
                          <span className="badge badge-elevated text-[10px]">
                            Elevated
                          </span>
                        )}
                        {record.riskLevel === 'MEDIUM' && (
                          <span className="badge badge-medium text-[10px]">
                            Medium
                          </span>
                        )}
                        {record.riskLevel === 'SAFE' && (
                          <span className="badge badge-safe text-[10px]">
                            Safe
                          </span>
                        )}
                      </div>
                      {record.riskReasons.length > 0 && (
                        <div className="text-[10px] text-slate-400 max-w-xs leading-tight">
                          {record.riskReasons[0]}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pr-5 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditCap(record)}
                        className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        title="Cap or adjust allowance"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Adjust</span>
                      </button>

                      <button
                        onClick={() => onRevoke(record)}
                        className="btn btn-danger text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm"
                        title="Revoke permission completely"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
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
