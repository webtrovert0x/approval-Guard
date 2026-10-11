import React from 'react';
import {
  Search,
  PlusCircle,
  Trash2,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

interface ApprovalFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: 'ALL' | 'UNLIMITED' | 'RISKY' | 'SAFE';
  setActiveFilter: (filter: 'ALL' | 'UNLIMITED' | 'RISKY' | 'SAFE') => void;
  sortBy: 'RISK' | 'TOKEN' | 'ALLOWANCE';
  setSortBy: (sort: 'RISK' | 'TOKEN' | 'ALLOWANCE') => void;
  selectedCount: number;
  onOpenBatchRevoke: () => void;
  onOpenAddToken: () => void;
  onOnChainAudit: () => void;
  isScanning: boolean;
  counts: {
    all: number;
    unlimited: number;
    risky: number;
    safe: number;
  };
}

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  selectedCount,
  onOpenBatchRevoke,
  onOpenAddToken,
  onOnChainAudit,
  isScanning,
  counts,
}) => {
  return (
    <div className="flex flex-col gap-4 my-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeFilter === 'ALL'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Permissions ({counts.all})
          </button>

          <button
            onClick={() => setActiveFilter('UNLIMITED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeFilter === 'UNLIMITED'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-300'
            }`}
          >
            Unlimited Access ({counts.unlimited})
          </button>

          <button
            onClick={() => setActiveFilter('RISKY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeFilter === 'RISKY'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-300'
            }`}
          >
            Risky & Unknown ({counts.risky})
          </button>

          <button
            onClick={() => setActiveFilter('SAFE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeFilter === 'SAFE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-emerald-300'
            }`}
          >
            Safe Limits ({counts.safe})
          </button>
        </div>

        {/* Action Buttons: Batch Revoke + Add Token + Scan */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCount > 0 && (
            <button
              onClick={onOpenBatchRevoke}
              id="btn-batch-revoke"
              className="btn btn-danger text-xs py-2 px-3.5 animate-pulse"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect Selected ({selectedCount})</span>
            </button>
          )}

          <button
            onClick={onOpenAddToken}
            id="btn-add-custom-token"
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Add a token to check"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Token</span>
          </button>

          <button
            onClick={onOnChainAudit}
            disabled={isScanning}
            id="btn-scan-approvals"
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            title="Check wallet security (0.0001 BOT fee)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>{isScanning ? 'Scanning...' : 'Scan (0.0001 BOT)'}</span>
          </button>
        </div>
      </div>

      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="search-input-wrapper sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            id="input-filter-approvals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by token name or app..."
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'RISK' | 'TOKEN' | 'ALLOWANCE')}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="RISK">Highest Risk First</option>
            <option value="ALLOWANCE">Unlimited Access First</option>
            <option value="TOKEN">Token Name (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
