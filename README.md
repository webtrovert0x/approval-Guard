# 🛡️ BOT Approval Guard

> **Autonomous Smart-Contract Security & Approval Defense on BOT Chain**

![BOT Approval Guard Logo](/public/logo.png)

[![Network](https://img.shields.io/badge/Network-BOT%20Chain%20(968)-emerald)](https://scan.bohr.life/)
[![Smart Contract](https://img.shields.io/badge/Contract-0xb8a58c...ff35-cyan)](https://scan.bohr.life/address/0xb8a58c3bbfeb9227ac2e6e3c0791a93b9970ff35)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Overview

**BOT Approval Guard** is a non-custodial wallet protection dashboard built natively for **BOT Chain (Chain ID: 968)**. It monitors token permissions, identifies risky apps with unlimited access, and enables users to disconnect apps or set safe spending limits directly on-chain.

---

## ⚡ Key Features

- **Wallet Security Scan**: Verifies which apps have access to your tokens with zero free scans (0.0001 BOT scan fee recorded on-chain).
- **One-Click Disconnect**: Completely revoke token spending permissions for any connected app.
- **Set Spending Limits**: Replace dangerous unlimited allowances with capped, strict spending limits.
- **Batch Disconnect**: Remove access for multiple apps in a single streamlined workflow.
- **Real-Time Security Alerts**: Instant visual and audio warnings whenever an app requests unlimited token access.
- **Custom Token Watchlist**: Add any token on BOT Chain to your monitoring dashboard.
- **Institutional Whitepaper**: Comprehensive technical specification available in [WHITEPAPER.md](./WHITEPAPER.md) and inside the app.

---

## 🌐 Smart Contract Details

- **Contract Name**: `ApprovalGuard.sol`
- **Deployed Address**: [`0xb8a58c3bbfeb9227ac2e6e3c0791a93b9970ff35`](https://scan.bohr.life/address/0xb8a58c3bbfeb9227ac2e6e3c0791a93b9970ff35)
- **Network**: BOT Chain Testnet
- **Chain ID**: `968`
- **RPC Endpoint**: `https://rpc.bohr.life`
- **Block Explorer**: [https://scan.bohr.life/](https://scan.bohr.life/)
- **Native Currency**: BOT

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/webtrovert0x/approval-Guard.git
cd approval-Guard

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.
