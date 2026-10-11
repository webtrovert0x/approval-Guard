import React from 'react';
import {
  ShieldAlert,
  Flame,
  ShieldCheck,
  AlertOctagon,
  Info,
  Radio,
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

  const scoreColor =
    safetyScore >= 80
      ? 'text-emerald-400'
      : safetyScore >= 50
      ? 'text-amber-400'
      : 'text-rose-400';

  const scoreBorder =
    safetyScore >= 80
      ? 'border-emerald-500/40 glow-safe'
      : safetyScore >= 50
      ? 'border-amber-500/40'
      : 'border-rose-500/50 glow-danger';

  return (
    <div className="w-full">
      {/* Target Wallet Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Active Wallet:</span>
          </div>
          <span className="font-bold text-xs text-slate-100 mono bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            {activeAccount
              ? `${activeAccount.slice(0, 14)}...${activeAccount.slice(-10)}`
              : 'No wallet connected (Enter address above)'}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
            LIVE SECURITY MONITOR
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="stats-grid-container">
        {/* Card 1: Connected Apps */}
        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Connected Apps</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-card-body">
            <div className="stat-card-number text-white" id="stat-total-approvals">
              {totalApprovals}
            </div>
            <div className="stat-card-label">apps with token access</div>
          </div>
          <div className="stat-card-footer">
            <Info className="w-3 h-3 text-slate-500" />
            <span>Monitored on BOT Chain</span>
          </div>
        </div>

        {/* Card 2: Unlimited Access */}
        <div
          className={`stat-metric-card ${
            unlimitedCount > 0 ? 'border-rose-500/40 bg-rose-950/10' : ''
          }`}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">Unlimited Access</span>
            <div className="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="stat-card-body">
            <div className="stat-card-number text-rose-400" id="stat-unlimited-approvals">
              {unlimitedCount}
            </div>
            {unlimitedCount > 0 && (
              <span className="badge badge-critical text-[10px] w-fit">High Risk</span>
            )}
            <div className="stat-card-label">apps with unlimited spending</div>
          </div>
          <div className="stat-card-footer text-slate-400">
            {unlimitedCount > 0
              ? 'Can take any amount of your tokens'
              : 'Zero unlimited access permissions'}
          </div>
        </div>

        {/* Card 3: Unknown Apps */}
        <div className="stat-metric-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Unknown Apps</span>
            <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/60">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-card-body">
            <div className="stat-card-number text-amber-300" id="stat-unverified-spenders">
              {unverifiedCount}
            </div>
            <div className="stat-card-label">unrecognized apps</div>
          </div>
          <div className="stat-card-footer text-slate-400">
            {unverifiedCount > 0
              ? 'Not recognized on BOT Chain'
              : 'All connected apps are recognized'}
          </div>
        </div>

        {/* Card 4: Security Score */}
        <div className={`stat-metric-card ${scoreBorder}`}>
          <div className="stat-card-header">
            <span className="stat-card-title">Security Score</span>
            <div className="p-1.5 rounded-lg bg-slate-800">
              <ShieldAlert className={`w-4 h-4 ${scoreColor}`} />
            </div>
          </div>
          <div className="stat-card-body">
            <div className={`stat-card-number ${scoreColor}`} id="stat-safety-score">
              {safetyScore}%
            </div>
            <div className="stat-card-label font-semibold text-slate-200">
              {safetyScore >= 80 ? 'Safe' : safetyScore >= 50 ? 'Moderate Risk' : 'High Risk'}
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                safetyScore >= 80 ? 'bg-emerald-400' : safetyScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${safetyScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
