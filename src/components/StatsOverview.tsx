import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  AlertOctagon,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Lock,
} from 'lucide-react';
import type { ApprovalRecord } from '../types';

interface StatsOverviewProps {
  approvals: ApprovalRecord[];
  activeAccount: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  approvals,
  activeAccount,
}) => {
  const [copied, setCopied] = useState(false);

  const totalApprovals = approvals.length;
  const unlimitedCount = approvals.filter((a) => a.isUnlimited).length;
  const unverifiedCount = approvals.filter((a) => !a.spender.isVerified).length;
  const criticalCount = approvals.filter((a) => a.riskLevel === 'CRITICAL').length;

  // Calculate Security Score (0 to 100%)
  let safetyScore = 100;
  if (totalApprovals > 0) {
    const penalty = criticalCount * 30 + unlimitedCount * 15 + unverifiedCount * 10;
    safetyScore = Math.max(10, 100 - penalty);
  }

  const handleCopy = () => {
    if (!activeAccount) return;
    navigator.clipboard.writeText(activeAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor =
    safetyScore >= 80
      ? 'text-emerald-400'
      : safetyScore >= 50
      ? 'text-amber-400'
      : 'text-rose-400';

  const scoreBorder =
    safetyScore >= 80
      ? 'border-emerald-500/30'
      : safetyScore >= 50
      ? 'border-amber-500/30'
      : 'border-rose-500/40';

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Target Wallet Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Active Wallet:</span>
          </div>

          <span className="font-bold text-xs text-slate-100 mono bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700/80">
            {activeAccount
              ? `${activeAccount.slice(0, 10)}...${activeAccount.slice(-8)}`
              : 'No wallet connected (Enter address above)'}
          </span>

          {activeAccount && (
            <div className="flex items-center gap-1.5 border-l border-slate-700/70 pl-2">
              <button
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <a
                href={`https://scan.botchain.ai/address/${activeAccount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition"
                title="View on BOT Scan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
            LIVE SECURITY MONITOR
          </span>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>BOT Chain Mainnet 677</span>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Connected Apps */}
        <div className="glass-panel p-5 flex flex-col justify-between border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Connected Apps
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="py-2.5">
            <div className="text-2xl font-extrabold text-white mono" id="stat-total-approvals">
              {totalApprovals}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              apps with token access
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Monitored on BOT Chain</span>
          </div>
        </div>

        {/* Card 2: Unlimited Access */}
        <div
          className={`glass-panel p-5 flex flex-col justify-between transition ${
            unlimitedCount > 0
              ? 'border-rose-500/40 bg-rose-950/20'
              : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Unlimited Access
            </span>
            <div
              className={`p-1.5 rounded-lg ${
                unlimitedCount > 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Flame className={`w-4 h-4 ${unlimitedCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="py-2.5">
            <div
              className={`text-2xl font-extrabold mono ${
                unlimitedCount > 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
              id="stat-unlimited-approvals"
            >
              {unlimitedCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              apps with unlimited spending
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <ShieldAlert className={`w-3 h-3 ${unlimitedCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>{unlimitedCount > 0 ? 'Infinite drain risk' : 'Zero unlimited permissions'}</span>
          </div>
        </div>

        {/* Card 3: Unknown Apps */}
        <div className="glass-panel p-5 flex flex-col justify-between border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Unknown Apps
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="py-2.5">
            <div className="text-2xl font-extrabold text-amber-300 mono" id="stat-unverified-spenders">
              {unverifiedCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              unrecognized apps
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <span>{unverifiedCount > 0 ? 'Review contract safety' : 'All apps verified'}</span>
          </div>
        </div>

        {/* Card 4: Security Score */}
        <div className={`glass-panel p-5 flex flex-col justify-between transition ${scoreBorder}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Security Score
            </span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
              <ShieldAlert className={`w-4 h-4 ${scoreColor}`} />
            </div>
          </div>
          <div className="py-2.5">
            <div className={`text-2xl font-extrabold mono ${scoreColor}`} id="stat-safety-score">
              {safetyScore}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {safetyScore >= 80 ? 'Safe Fortress' : safetyScore >= 50 ? 'Moderate Risk' : 'High Risk'}
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                safetyScore >= 80
                  ? 'bg-emerald-400'
                  : safetyScore >= 50
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${safetyScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
