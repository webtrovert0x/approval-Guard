import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';
import { http } from 'wagmi';

// 1. Define custom BOT Chain (Testnet 968)
export const botChain = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bohr Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

// 2. Reown AppKit Project ID
export const projectId =
  (import.meta.env.VITE_REOWN_PROJECT_ID as string) ||
  'b56e18d47c72ab683b10814fe9495694';

// 3. Set up Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [botChain],
  projectId,
  transports: {
    [botChain.id]: http('https://rpc.bohr.life'),
  },
});

export const config = wagmiAdapter.wagmiConfig;

// 4. Metadata for AppKit Modal
export const metadata = {
  name: 'BOT Approval Guard',
  description: 'Smart-Contract Approval Management & Security Tool on BOT Chain',
  url: 'https://approvalguard.bohr.life',
  icons: ['https://scan.bohr.life/favicon.ico'],
};

// 5. Initialize AppKit
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botChain],
  projectId,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10b981',
    '--w3m-color-mix': '#0b0f17',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '12px',
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
});
