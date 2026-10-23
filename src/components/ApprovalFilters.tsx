import React from 'react';
import {
  Search,
  PlusCircle,
  Trash2,
  SlidersHorizontal,
  Zap,
  X,
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
      {/* Top Controls: Segmented Pills & Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Segmented Control Bar */}
        <div className="segmented-control-container">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`segmented-tab ${activeFilter === 'ALL' ? 'active-all' : ''}`}
          >
            <span>All Permissions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-bold">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('UNLIMITED')}
            className={`segmented-tab ${activeFilter === 'UNLIMITED' ? 'active-unlimited' : ''}`}
          >
            <span>Unlimited Access</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                counts.unlimited > 0 ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.unlimited}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('RISKY')}
            className={`segmented-tab ${activeFilter === 'RISKY' ? 'active-risky' : ''}`}
          >
            <span>Risky & Unknown</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                counts.risky > 0 ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.risky}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('SAFE')}
            className={`segmented-tab ${activeFilter === 'SAFE' ? 'active-safe' : ''}`}
          >
            <span>Safe Limits</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-bold">
              {counts.safe}
            </span>
          </button>
        </div>

        {/* Action Buttons: Batch Revoke + Add Custom Token + Scan Trigger */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
            className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-2"
            title="Add a custom token to scan"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add Token</span>
          </button>

          <button
            onClick={onOnChainAudit}
            disabled={isScanning}
            id="btn-scan-approvals"
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            title="Scan wallet approvals (0.0001 BOT protocol fee)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>{isScanning ? 'Scanning On-Chain...' : 'Scan Approvals (0.0001 BOT)'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Search Field + Sort Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="search-input-wrapper sm:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            id="input-filter-approvals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by token symbol, name or spender..."
            className="pr-6"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'RISK' | 'TOKEN' | 'ALLOWANCE')}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
          >
            <option value="RISK">Highest Security Risk</option>
            <option value="ALLOWANCE">Unlimited Allowances First</option>
            <option value="TOKEN">Token Symbol (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
