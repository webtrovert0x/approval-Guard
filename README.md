# 🛡️ BOT Approval Guard

> **Autonomous Smart-Contract Security & Approval Defense on BOT Chain**

![BOT Approval Guard Logo](/public/logo.png)

[![Network](https://img.shields.io/badge/Network-BOT%20Chain%20(677)-emerald)](https://scan.botchain.ai/)
[![Smart Contract](https://img.shields.io/badge/Contract-0x1308bc...cbf5-cyan)](https://scan.botchain.ai/address/0x1308bcc49fd9e4ef533c0915e6cb3a0a0d16cbf5)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Overview

**BOT Approval Guard** is a non-custodial wallet protection dashboard built natively for **BOT Chain Mainnet (Chain ID: 677)**. It monitors token permissions, identifies risky apps with unlimited access, and enables users to disconnect apps or set safe spending limits directly on-chain.

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
- **Deployed Address**: [`0x1308bcc49fd9e4ef533c0915e6cb3a0a0d16cbf5`](https://scan.botchain.ai/address/0x1308bcc49fd9e4ef533c0915e6cb3a0a0d16cbf5)
- **Network**: BOT Chain Mainnet
- **Chain ID**: `677`
- **RPC Endpoint**: `https://rpc.botchain.ai`
- **Official Website**: [https://botchain.ai](https://botchain.ai)
- **Block Explorer**: [https://scan.botchain.ai/](https://scan.botchain.ai/)
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
