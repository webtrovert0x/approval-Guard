import { useState, useEffect, useMemo, useCallback } from 'react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/chain';
import { KNOWN_TOKENS, KNOWN_SPENDERS } from './config/tokensAndSpenders';
import type { ApprovalRecord, TokenInfo, SecurityAlert } from './types';
import {
  scanWalletApprovals,
  playAlertChime,
  publicClient,
} from './services/approvalScanner';
import { StorageService } from './services/storage';

// Components
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ApprovalFilters } from './components/ApprovalFilters';
import { ApprovalTable } from './components/ApprovalTable';
import { LiveAlertBanner } from './components/LiveAlertBanner';
import { RevokeModal } from './components/RevokeModal';
import { EditAllowanceModal } from './components/EditAllowanceModal';
import { BatchRevokeModal } from './components/BatchRevokeModal';
import { AddTokenModal } from './components/AddTokenModal';
import { ApprovalHistoryModal } from './components/ApprovalHistoryModal';
import { GuardRegistryModal } from './components/GuardRegistryModal';
import { OnChainAuditModal } from './components/OnChainAuditModal';
import { WhitepaperModal } from './components/WhitepaperModal';

import {
  ExternalLink,
  Layers,
  Radio,
  Lock,
} from 'lucide-react';

const queryClient = new QueryClient();

export function ApprovalGuardApp() {
  const { address, isConnected } = useAccount();

  // Watchdog target address state (defaults to connected address)
  const [searchedAddress, setSearchedAddress] = useState<string>('');
  const [activeAccount, setActiveAccount] = useState<string>('');

  // Data states
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [rpcStatus, setRpcStatus] = useState<'online' | 'checking' | 'error'>('checking');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNLIMITED' | 'RISKY' | 'SAFE'>('ALL');
  const [sortBy, setSortBy] = useState<'RISK' | 'TOKEN' | 'ALLOWANCE'>('RISK');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [revokeRecord, setRevokeRecord] = useState<ApprovalRecord | null>(null);
  const [editRecord, setEditRecord] = useState<ApprovalRecord | null>(null);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isAddTokenOpen, setIsAddTokenOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState<boolean>(false);
  const [isOnChainAuditOpen, setIsOnChainAuditOpen] = useState<boolean>(false);
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState<boolean>(false);

  // Security Alert State
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Check RPC status on mount
  useEffect(() => {
    async function checkRpc() {
      try {
        const block = await publicClient.getBlockNumber();
        if (block > 0n) {
          setRpcStatus('online');
        }
      } catch (err) {
        console.error('RPC check error', err);
        setRpcStatus('error');
      }
    }
    checkRpc();
  }, []);

  // Load custom tokens, alerts & settings
  useEffect(() => {
    setCustomTokens(StorageService.getCustomTokens());
    setAlerts(StorageService.getAlerts());
    const settings = StorageService.getSettings();
    setSoundEnabled(settings.soundEnabled);
  }, []);

  // Audit states: zero free scans
  const [hasAuditedWallet, setHasAuditedWallet] = useState<boolean>(false);
  const [auditTxHash, setAuditTxHash] = useState<string | null>(null);

  // Update active account when wallet connects or address is searched
  useEffect(() => {
    if (searchedAddress.trim()) {
      setActiveAccount(searchedAddress.trim());
      setHasAuditedWallet(false);
      setAuditTxHash(null);
      setApprovals([]);
    } else if (isConnected && address) {
      setActiveAccount(address);
      setHasAuditedWallet(false);
      setAuditTxHash(null);
      setApprovals([]);
    } else {
      setActiveAccount('');
      setHasAuditedWallet(false);
      setAuditTxHash(null);
      setApprovals([]);
    }
  }, [isConnected, address, searchedAddress]);

  // Combined token list
  const allTokens = useMemo(() => {
    return [...KNOWN_TOKENS, ...customTokens];
  }, [customTokens]);

  // Execute on-chain fee-verified scan
  const performScan = useCallback(async (targetOverride?: string, forceScan?: boolean) => {
    const target = targetOverride || activeAccount;
    if (!target || !target.startsWith('0x') || target.length !== 42) {
      setApprovals([]);
      return;
    }

    if (!forceScan && !hasAuditedWallet) {
      // Must be audited with fee first
      return;
    }

    setIsScanning(true);
    try {
      // Query live on-chain allowances on BOT Chain
      const onChainApprovals = await scanWalletApprovals(
        target as `0x${string}`,
        allTokens,
        KNOWN_SPENDERS
      );

      setApprovals(onChainApprovals);
      const unlimitedCount = onChainApprovals.filter((a) => a.isUnlimited).length;
      if (unlimitedCount > 0 && soundEnabled) {
        playAlertChime('critical');
      }
    } catch (err) {
      console.error('Scan failed', err);
    } finally {
      setIsScanning(false);
    }
  }, [activeAccount, allTokens, hasAuditedWallet, soundEnabled]);

  // Multi-select helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredApprovals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApprovals.map((a) => a.id));
    }
  };

  // Revocation Success Handlers
  const handleRevokeSuccess = (recordId: string, txHash: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== recordId));
    setSelectedIds((prev) => prev.filter((id) => id !== recordId));

    // Add alert
    const newAlert = StorageService.addAlert({
      title: 'Approval Revoked',
      message: `Token spending permission revoked. Tx: ${txHash.slice(0, 8)}...`,
      severity: 'INFO',
      txHash,
    });
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleEditSuccess = (recordId: string, newAllowanceFormatted: string, txHash: string) => {
    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id === recordId) {
          return {
            ...a,
            isUnlimited: false,
            allowanceFormatted: newAllowanceFormatted,
            riskLevel: 'SAFE',
            riskReasons: ['Allowance manually capped to user threshold'],
          };
        }
        return a;
      })
    );

    const newAlert = StorageService.addAlert({
      title: 'Allowance Capped',
      message: `Allowance adjusted to ${newAllowanceFormatted}. Tx: ${txHash.slice(0, 8)}...`,
      severity: 'INFO',
      txHash,
    });
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleBatchComplete = (revokedIds: string[]) => {
    setApprovals((prev) => prev.filter((a) => !revokedIds.includes(a.id)));
    setSelectedIds([]);

    const newAlert = StorageService.addAlert({
      title: 'Batch Revoke Finished',
      message: `Successfully revoked ${revokedIds.length} permissions on BOT Chain.`,
      severity: 'INFO',
    });
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Add custom token
  const handleTokenAdded = (token: TokenInfo) => {
    setCustomTokens((prev) => [...prev, token]);
    performScan();
  };

  // Filtered & Sorted approvals
  const filteredApprovals = useMemo(() => {
    let list = [...approvals];

    // Filter category
    if (activeFilter === 'UNLIMITED') {
      list = list.filter((a) => a.isUnlimited);
    } else if (activeFilter === 'RISKY') {
      list = list.filter((a) => !a.spender.isVerified || a.riskLevel === 'CRITICAL');
    } else if (activeFilter === 'SAFE') {
      list = list.filter((a) => a.riskLevel === 'SAFE');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.token.symbol.toLowerCase().includes(q) ||
          a.token.name.toLowerCase().includes(q) ||
          a.spender.name.toLowerCase().includes(q) ||
          a.spender.address.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'RISK') {
        const priority: Record<string, number> = {
          CRITICAL: 4,
          ELEVATED: 3,
          MEDIUM: 2,
          SAFE: 1,
        };
        return priority[b.riskLevel] - priority[a.riskLevel];
      }
      if (sortBy === 'ALLOWANCE') {
        return (b.isUnlimited ? 1 : 0) - (a.isUnlimited ? 1 : 0);
      }
      if (sortBy === 'TOKEN') {
        return a.token.symbol.localeCompare(b.token.symbol);
      }
      return 0;
    });

    return list;
  }, [approvals, activeFilter, searchQuery, sortBy]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: approvals.length,
      unlimited: approvals.filter((a) => a.isUnlimited).length,
      risky: approvals.filter((a) => !a.spender.isVerified || a.riskLevel === 'CRITICAL').length,
      safe: approvals.filter((a) => a.riskLevel === 'SAFE').length,
    };
  }, [approvals]);

  // Top critical approval for live banner
  const topCriticalApproval = useMemo(() => {
    return approvals.find((a) => a.riskLevel === 'CRITICAL' && a.isUnlimited) || null;
  }, [approvals]);

  const selectedRecords = useMemo(() => {
    return approvals.filter((a) => selectedIds.includes(a.id));
  }, [approvals, selectedIds]);

  return (
    <div className="w-full min-h-screen bg-[var(--bg-primary)] text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        searchedAddress={searchedAddress}
        setSearchedAddress={setSearchedAddress}
        onSearch={(addr) => {
          if (addr) {
            setActiveAccount(addr);
          }
          setIsOnChainAuditOpen(true);
        }}
        alerts={alerts}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const updated = StorageService.saveSettings({ soundEnabled: !soundEnabled });
          setSoundEnabled(updated.soundEnabled);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenWhitepaper={() => setIsWhitepaperOpen(true)}
        onOpenAddToken={() => setIsAddTokenOpen(true)}
        onOnChainAudit={() => setIsOnChainAuditOpen(true)}
        onResetToConnected={() => {
          setSearchedAddress('');
          if (isConnected && address) {
            setActiveAccount(address);
          } else {
            setActiveAccount('');
          }
        }}
        rpcStatus={rpcStatus}
        isScanning={isScanning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* High Severity Live Alert Banner */}
        {!bannerDismissed && topCriticalApproval && (
          <LiveAlertBanner
            criticalApproval={topCriticalApproval}
            onFixApproval={(rec) => setRevokeRecord(rec)}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* Dashboard Statistics Overview */}
        <StatsOverview
          approvals={approvals}
          activeAccount={activeAccount}
        />

        {/* Filters, Search & Action Bar */}
        <ApprovalFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedCount={selectedIds.length}
          onOpenBatchRevoke={() => setIsBatchOpen(true)}
          onOpenAddToken={() => setIsAddTokenOpen(true)}
          onOnChainAudit={() => setIsOnChainAuditOpen(true)}
          isScanning={isScanning}
          counts={counts}
        />

        {/* Approval Table / Grid */}
        <ApprovalTable
          approvals={filteredApprovals}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onRevoke={(rec) => setRevokeRecord(rec)}
          onEditCap={(rec) => setEditRecord(rec)}
          activeAccount={activeAccount}
          hasAuditedWallet={hasAuditedWallet}
          onRequireAuditScan={() => setIsOnChainAuditOpen(true)}
          auditTxHash={auditTxHash}
        />

        {/* Informational Callout / Guard Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="glass-panel p-4 text-xs space-y-1.5 border-slate-800">
            <div className="font-bold text-slate-100 flex items-center gap-2 text-xs">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Token Safety</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Permissions stay active until you remove them. Disconnecting apps ensures
              old apps can never access your tokens without permission.
            </p>
          </div>

          <div className="glass-panel p-4 text-xs space-y-1.5 border-slate-800">
            <div className="font-bold text-slate-100 flex items-center gap-2 text-xs">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Live Alerts</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Approval Guard watches your wallet and warns you immediately whenever
              an app requests access to your tokens.
            </p>
          </div>

          <div className="glass-panel p-4 text-xs space-y-1.5 border-slate-800">
            <div className="font-bold text-slate-100 flex items-center gap-2 text-xs">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Security Rules</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Set spending limits for your tokens and keep a trusted list of safe apps
              directly on BOT Chain.
            </p>
          </div>
        </div>
      </main>

      {/* Ecosystem Showcase Section */}
      <section className="border-t border-slate-800/80 bg-slate-900/60 py-6 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* BOT Chain Branding & Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex-shrink-0 bg-black flex items-center justify-center">
              <img src="/botchain_logo.jpeg" alt="BOT Chain Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-wide">BOT Chain Ecosystem</span>
                <span className="badge badge-safe text-[10px] py-0.5 px-2">Mainnet 677</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official smart contract security & token approval protection protocol
              </p>
            </div>
          </div>

          {/* Links with BOT Chain logo in front */}
          <div className="flex items-center gap-3 flex-wrap justify-center text-xs">
            {/* BOT Chain Website Link */}
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 transition group shadow-sm"
            >
              <img
                src="/botchain_logo.jpeg"
                alt="BOT Chain Logo"
                className="w-4 h-4 rounded-full object-cover flex-shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="text-slate-400 font-normal">BOT Chain website:</span>
              <span className="font-semibold text-emerald-400 group-hover:text-emerald-300 underline underline-offset-2">
                https://botchain.ai
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
            </a>

            {/* BOT Chain Explorer Link */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 transition group shadow-sm"
            >
              <img
                src="/botchain_logo.jpeg"
                alt="BOT Chain Logo"
                className="w-4 h-4 rounded-full object-cover flex-shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="text-slate-400 font-normal">BOT Chain explorer:</span>
              <span className="font-semibold text-emerald-400 group-hover:text-emerald-300 underline underline-offset-2">
                https://scan.botchain.ai
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-xs text-slate-400">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/botchain_logo.jpeg"
              alt="BOT Chain"
              className="w-4 h-4 rounded-full object-cover inline-block border border-emerald-500/30"
            />
            <span className="font-bold text-white">BOT Approval Guard</span>
            <span>•</span>
            <span>Powered by BOT Chain</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 flex-wrap justify-center text-[11px]">
            <span>
              Chain ID: <strong className="text-slate-200 mono">677</strong>
            </span>
            <span>
              RPC: <strong className="text-slate-200 mono">https://rpc.botchain.ai</strong>
            </span>
            <span>
              Native Token: <strong className="text-emerald-400 mono">BOT</strong> (150M Supply)
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition"
              >
                <img src="/botchain_logo.jpeg" alt="BOT Chain" className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>BOT Chain</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition"
              >
                <img src="/botchain_logo.jpeg" alt="BOT Chain" className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>Explorer</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {revokeRecord && (
        <RevokeModal
          record={revokeRecord}
          onClose={() => setRevokeRecord(null)}
          onSuccess={(id, txHash) => {
            handleRevokeSuccess(id, txHash);
            setRevokeRecord(null);
          }}
        />
      )}

      {editRecord && (
        <EditAllowanceModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSuccess={(id, newAllowance, txHash) => {
            handleEditSuccess(id, newAllowance, txHash);
            setEditRecord(null);
          }}
        />
      )}

      {isBatchOpen && (
        <BatchRevokeModal
          records={selectedRecords}
          onClose={() => setIsBatchOpen(false)}
          onBatchComplete={(revokedIds) => {
            handleBatchComplete(revokedIds);
            setIsBatchOpen(false);
          }}
        />
      )}

      {isAddTokenOpen && (
        <AddTokenModal
          onClose={() => setIsAddTokenOpen(false)}
          onTokenAdded={handleTokenAdded}
        />
      )}

      {isHistoryOpen && (
        <ApprovalHistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}

      {isRegistryOpen && (
        <GuardRegistryModal
          onClose={() => setIsRegistryOpen(false)}
        />
      )}

      {isOnChainAuditOpen && (
        <OnChainAuditModal
          targetWallet={activeAccount}
          onClose={() => setIsOnChainAuditOpen(false)}
          onAuditConfirmed={(txHash) => {
            setHasAuditedWallet(true);
            setAuditTxHash(txHash);
            performScan(activeAccount, true);
            setIsOnChainAuditOpen(false);
          }}
        />
      )}

      {isWhitepaperOpen && (
        <WhitepaperModal onClose={() => setIsWhitepaperOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config as any}>
      <QueryClientProvider client={queryClient}>
        <ApprovalGuardApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
