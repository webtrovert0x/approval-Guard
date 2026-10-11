import React from 'react';
import {
  BookOpen,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_APPROVAL_GUARD_ADDRESS } from '../config/abi';

interface WhitepaperModalProps {
  onClose: () => void;
}

export const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="glass-panel bg-slate-900/95 border border-slate-700 max-w-4xl w-full max-h-[88vh] flex flex-col p-6 rounded-2xl shadow-2xl relative">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>BOT Approval Guard Whitepaper</span>
              <span className="badge badge-safe text-[9px] py-0.5 px-2">v1.0.0</span>
            </h3>
            <p className="text-xs text-slate-400">
              Technical Specification & Protocol Architecture on BOT Chain (968)
            </p>
          </div>
        </div>

        {/* Scrollable Whitepaper Content */}
        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Hero Banner with Logo */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-800/60 to-cyan-950/40 border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">
                Autonomous Smart-Contract Security & Approval Defense
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                A non-custodial watchdog and gas-metered audit protocol designed to eliminate the systemic threat of infinite ERC-20 allowances on BOT Chain.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] mono text-slate-400">
                <span>Contract: <strong className="text-emerald-400">{DEFAULT_APPROVAL_GUARD_ADDRESS.slice(0, 10)}...</strong></span>
                <span>•</span>
                <span>Chain ID: <strong className="text-slate-200">968</strong></span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Executive Summary & Problem Landscape</span>
            </h4>
            <p>
              Under the ERC-20 token standard, dApps request permission to spend tokens via <code className="mono">approve(spender, amount)</code>. Early DeFi UX established the practice of requesting <strong className="text-rose-400">infinite allowances (2^256 - 1)</strong> to avoid repeated signing friction.
            </p>
            <p>
              However, once granted, these allowances remain dormant indefinitely. If a protocol contract is compromised, upgraded maliciously, or experiences a re-entrancy bug, attackers can execute <code className="mono">transferFrom</code> to drain user balances without requiring further authorization.
            </p>
          </div>

          {/* Section 2: Architecture */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-1">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>2. Protocol Architecture & ApprovalGuard.sol</span>
            </h4>
            <p>
              BOT Approval Guard couples a decentralized client watchdog with the on-chain registry contract <code className="mono">ApprovalGuard.sol</code> deployed on BOT Chain at <span className="mono text-emerald-400 font-semibold">{DEFAULT_APPROVAL_GUARD_ADDRESS}</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gas-Metered Audits</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  <code className="mono">executeAuditScan(targetWallet)</code> records an audit block event with a 0.0001 BOT protocol fee, creating an immutable on-chain audit trail.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Threshold Rules Registry</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  <code className="mono">configureTokenRule</code> allows wallet owners to enforce custom allowance caps and watchdogs directly on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Risk Scoring */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-1">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>3. Mathematical Risk Scoring Matrix</span>
            </h4>
            <p>
              The Wallet Guard Score evaluates total exposure on a 0 to 100% scale:
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 mono text-[11px] text-emerald-300">
              Score = max(10, 100 - (30 × Critical + 15 × Unlimited + 10 × Unverified))
            </div>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-400 pt-1">
              <li><strong className="text-emerald-400">Fortified (80-100%):</strong> Minimal or capped exposure to trusted protocols.</li>
              <li><strong className="text-amber-400">Moderate Risk (50-79%):</strong> Multiple unlimited allowances on verified DEXs.</li>
              <li><strong className="text-rose-400">Severe Risk (&lt; 50%):</strong> Active infinite permissions granted to unverified spenders.</li>
            </ul>
          </div>

          {/* Section 4: Non-Custodial Security */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-1">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>4. Non-Custodial Guarantees</span>
            </h4>
            <p>
              1. <strong className="text-white">Zero Asset Custody:</strong> BOT Approval Guard never touches, deposits, or proxies user ERC-20 tokens or native BOT funds.
            </p>
            <p>
              2. <strong className="text-white">Direct Standard Calls:</strong> Revocations execute via direct <code className="mono">approve(spender, 0)</code> transactions signed by the owner's private key.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
          <a
            href="https://scan.bohr.life/address/0xb8a58c3bbfeb9227ac2e6e3c0791a93b9970ff35"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
          >
            <span>Contract on Bohr Scan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="btn btn-primary text-xs py-2 px-5"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
