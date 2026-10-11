import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  ShieldAlert,
  Search,
  Bell,
  Volume2,
  VolumeX,
  History,
  FileCode,
  ExternalLink,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  BookOpen,
  Github,
} from 'lucide-react';
import type { SecurityAlert } from '../types';

interface NavbarProps {
  searchedAddress: string;
  setSearchedAddress: (addr: string) => void;
  onSearch: (target?: string) => void;
  onOnChainAudit: () => void;
  alerts: SecurityAlert[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenRegistry: () => void;
  onOpenWhitepaper?: () => void;
  onOpenAddToken?: () => void;
  onResetToConnected: () => void;
  rpcStatus: 'online' | 'checking' | 'error';
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchedAddress,
  setSearchedAddress,
  onSearch,
  onOnChainAudit,
  alerts,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onOpenRegistry,
  onOpenWhitepaper,
  onResetToConnected,
  rpcStatus,
  isScanning,
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchedAddress.trim()) {
      onSearch(searchedAddress.trim());
    }
  };

  const isInspectingCustom =
    Boolean(searchedAddress) &&
    (!address || searchedAddress.toLowerCase() !== address.toLowerCase());

  return (
    <header className="border-b border-slate-800 bg-[#070b12]/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={onResetToConnected}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 glow-safe flex-shrink-0 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <img src="/logo.png" alt="BOT Approval Guard" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                BOT <span className="text-emerald-400">Approval Guard</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Wallet Protection</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">BOT Chain</span>
            </div>
          </div>
        </div>

        {/* Address Search Input */}
        <div className="w-full sm:w-auto flex-1 min-w-[240px] max-w-md my-1">
          <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              id="watchdog-address-input"
              value={searchedAddress}
              onChange={(e) => setSearchedAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="mono"
            />
            {isInspectingCustom && (
              <button
                type="button"
                onClick={onResetToConnected}
                className="px-2 py-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-950/60 rounded-md border border-amber-800 flex items-center gap-1 flex-shrink-0 mr-1"
                title="Reset to your connected wallet"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <button
              type="submit"
              id="btn-scan-wallet"
              className="px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 rounded-md border border-emerald-800 flex-shrink-0 flex items-center gap-1"
              title="Scan this wallet (0.0001 BOT fee)"
            >
              <Zap className="w-3 h-3 text-amber-300 fill-current" />
              <span>Scan</span>
            </button>
          </form>
        </div>

        {/* Action Controls & Wallet Connection */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Scan Wallet Button */}
          <button
            onClick={onOnChainAudit}
            disabled={isScanning}
            id="btn-onchain-gas-audit"
            title="Scan wallet security (0.0001 BOT fee)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition border border-emerald-400/40"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Scan Wallet (0.0001 BOT)</span>
          </button>

          {/* BOT Chain Explorer Link */}
          <a
            href="https://scan.bohr.life/"
            target="_blank"
            rel="noopener noreferrer"
            title="BOT Chain Network - View Explorer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                rpcStatus === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                  : rpcStatus === 'checking'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-slate-200">BOT Chain</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleSound}
            id="btn-toggle-sound"
            title={soundEnabled ? 'Alert sounds on' : 'Alert sounds muted'}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* History Modal Trigger */}
          <button
            onClick={onOpenHistory}
            id="btn-open-history"
            title="Activity History"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Security Rules Trigger */}
          <button
            onClick={onOpenRegistry}
            id="btn-open-registry"
            title="Security Rules"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <FileCode className="w-4 h-4" />
          </button>

          {/* Whitepaper Trigger */}
          {onOpenWhitepaper && (
            <button
              onClick={onOpenWhitepaper}
              id="btn-open-whitepaper"
              title="Whitepaper"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          {/* GitHub Repo */}
          <a
            href="https://github.com/webtrovert0x/approval-Guard"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertDropdown(!showAlertDropdown)}
              id="btn-alerts-toggle"
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              title="Security Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown */}
            {showAlertDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] glass-panel bg-slate-900/95 border border-slate-700 shadow-2xl p-4 z-50 rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold text-sm text-slate-100">
                      Security Alerts ({alerts.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Live protection</span>
                </div>
                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                      No alerts. Your wallet is safe.
                    </div>
                  ) : (
                    alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-xl border text-xs ${
                          alert.severity === 'HIGH'
                            ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                            : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {alert.title}
                          </span>
                          <span className="text-[10px] opacity-70 mono">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connect Wallet / AppKit Trigger */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => open()}
                id="btn-connected-account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-xs text-slate-200 transition mono"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </button>
              <button
                onClick={() => disconnect()}
                id="btn-disconnect-wallet"
                className="p-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition border border-transparent hover:border-rose-900/50"
                title="Disconnect wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              id="btn-connect-wallet"
              className="btn btn-primary text-xs py-2 px-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
