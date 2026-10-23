const { createPublicClient, http, formatEther } = require('viem');
const fs = require('fs');
const path = require('path');

// Target deployed contract address
const CONTRACT_ADDRESS = '0x1308bcc49fd9e4ef533c0915e6cb3a0a0d16cbf5';

const botChain = {
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
    public: { http: ['https://rpc.botchain.ai'] },
  },
};

const client = createPublicClient({
  chain: botChain,
  transport: http('https://rpc.botchain.ai'),
});

const abi = [
  { type: 'function', name: 'deployer', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'deployedBlock', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'scanFee', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalAuditsExecuted', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'userLastAudit', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

async function main() {
  console.log('====================================================');
  console.log('   VERIFYING APPROVALGUARD.SOL ON BOT CHAIN (677)   ');
  console.log('====================================================');
  console.log('RPC Endpoint:     https://rpc.botchain.ai');
  console.log('Contract Address: ', CONTRACT_ADDRESS);
  console.log('Checking on-chain state...');

  // 1. Verify Bytecode
  const bytecode = await client.getBytecode({ address: CONTRACT_ADDRESS });
  if (!bytecode || bytecode === '0x') {
    console.error('❌ FAILED: No bytecode detected at target address on BOT Chain!');
    process.exit(1);
  }
  console.log(`[1/5] Bytecode status:       VALID (${bytecode.length} characters)`);

  // 2. Verify Current Block
  const currentBlock = await client.getBlockNumber();
  console.log(`[2/5] Current BOT Chain Block: ${currentBlock}`);

  // 3. Read State Variables
  const [deployer, deployedBlock, scanFee, totalAudits] = await Promise.all([
    client.readContract({ address: CONTRACT_ADDRESS, abi, functionName: 'deployer' }),
    client.readContract({ address: CONTRACT_ADDRESS, abi, functionName: 'deployedBlock' }),
    client.readContract({ address: CONTRACT_ADDRESS, abi, functionName: 'scanFee' }),
    client.readContract({ address: CONTRACT_ADDRESS, abi, functionName: 'totalAuditsExecuted' }),
  ]);

  console.log(`[3/5] Deployer Address:      ${deployer}`);
  console.log(`[4/5] Deployed at Block:     ${deployedBlock} (${Number(currentBlock - deployedBlock)} blocks ago)`);
  console.log(`[5/5] Audit Scan Fee:        ${formatEther(scanFee)} BOT`);
  console.log(`      Total Audits Executed: ${totalAudits}`);

  console.log('\n====================================================');
  console.log('   CONTRACT VERIFICATION SUCCESSFUL!                ');
  console.log('====================================================');
  console.log('Explorer View: https://scan.botchain.ai/address/' + CONTRACT_ADDRESS + '#code');
}

main().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
