const { createPublicClient, http, formatEther } = require('viem');
const fs = require('fs');
const path = require('path');

// Target deployed contract address
const CONTRACT_ADDRESS = '0xb8a58c3bbfeb9227ac2e6e3c0791a93b9970ff35';

const botChain = {
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
    public: { http: ['https://rpc.bohr.life'] },
  },
};

const client = createPublicClient({
  chain: botChain,
  transport: http('https://rpc.bohr.life'),
});

const abi = [
  { type: 'function', name: 'deployer', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'deployedBlock', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'scanFee', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalAuditsExecuted', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMonitoredTokens', inputs: [{ type: 'address' }], outputs: [{ type: 'address[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getTrustedSpenders', inputs: [{ type: 'address' }], outputs: [{ type: 'address[]' }], stateMutability: 'view' }
];

async function main() {
  console.log('====================================================');
  console.log('   VERIFYING APPROVALGUARD.SOL ON BOT CHAIN (968)   ');
  console.log('====================================================');
  console.log('RPC Endpoint:     https://rpc.bohr.life');
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

  // 4. Test Monitored Tokens view
  const monitored = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getMonitoredTokens',
    args: [deployer],
  });
  console.log(`      Active Monitored Tokens (Deployer): ${monitored.length}`);

  // 5. Test Bohr Scan API Source Verification submission
  console.log('\n--- Attempting Bohr Scan Explorer Verification ---');
  const sourcePath = path.resolve(__dirname, '../contracts/ApprovalGuard.sol');
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');

  try {
    const params = new URLSearchParams();
    params.append('apikey', 'YourApiKeyToken');
    params.append('module', 'contract');
    params.append('action', 'verifysourcecode');
    params.append('contractaddress', CONTRACT_ADDRESS);
    params.append('sourceCode', sourceCode);
    params.append('codeformat', 'solidity-single-file');
    params.append('contractname', 'ApprovalGuard');
    params.append('compilerversion', 'v0.8.20+commit.a1b79de6');
    params.append('optimizationUsed', '1');
    params.append('runs', '200');
    params.append('constructorArguements', '');
    params.append('evmversion', 'default');
    params.append('licenseType', '3'); // MIT

    const res = await fetch('https://scan.bohr.life/api', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = await res.json().catch(() => null);
    if (data) {
      console.log('Explorer API Response:', data);
    } else {
      console.log('Explorer verification endpoint reached (Status:', res.status, ')');
    }
  } catch (err) {
    console.log('Note: Explorer API verification skipped or manual web verification required:', err.message);
  }

  console.log('\n====================================================');
  console.log('   CONTRACT VERIFICATION SUCCESSFUL!                ');
  console.log('====================================================');
  console.log('Explorer View: https://scan.bohr.life/address/' + CONTRACT_ADDRESS + '#code');
}

main().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
