import React from 'react';
import { X, ArrowRight, BellRing } from 'lucide-react';
import type { ApprovalRecord } from '../types';

interface LiveAlertBannerProps {
  criticalApproval: ApprovalRecord | null;
  onFixApproval: (record: ApprovalRecord) => void;
  onDismiss: () => void;
}

export const LiveAlertBanner: React.FC<LiveAlertBannerProps> = ({
  criticalApproval,
  onFixApproval,
  onDismiss,
}) => {
  if (!criticalApproval) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-rose-950/80 border border-rose-500/50 shadow-[0_0_24px_rgba(239,68,68,0.25)] p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-900/50 text-rose-300 border border-rose-700/60 flex-shrink-0 animate-bounce">
            <BellRing className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide">
                SECURITY ALERT
              </span>
              <span className="badge badge-critical text-[10px]">
                ACTION NEEDED
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-0.5">
              Found <strong className="text-white">{criticalApproval.token.symbol}</strong> with{' '}
              <span className="font-bold underline text-rose-400">Unlimited Access (∞)</span> given to{' '}
              <strong className="text-white">{criticalApproval.spender.name}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onFixApproval(criticalApproval)}
            id="btn-alert-fix-now"
            className="btn btn-danger text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
          >
            <span>Disconnect Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
