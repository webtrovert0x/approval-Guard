const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// 1. Read .env.local
let privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/PRIVATE_KEY=([a-fA-F0-9x]+)/);
    if (match) {
      privateKey = match[1].trim();
    }
  }
}

if (!privateKey) {
  console.error('Error: No PRIVATE_KEY found in .env.local');
  process.exit(1);
}

if (!privateKey.startsWith('0x')) {
  privateKey = '0x' + privateKey;
}

const account = privateKeyToAccount(privateKey);
console.log('Deployer address:', account.address);

// BOT Chain config
const botChain = {
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
    public: { http: ['https://rpc.bohr.life'] },
  },
};

const publicClient = createPublicClient({
  chain: botChain,
  transport: http('https://rpc.bohr.life'),
});

const walletClient = createWalletClient({
  account,
  chain: botChain,
  transport: http('https://rpc.bohr.life'),
});

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Deployer balance:', (Number(balance) / 1e18).toFixed(4), 'BOT');

  if (balance === 0n) {
    console.error('Deployer account has 0 BOT balance. Please ensure it has testnet BOT for gas.');
    process.exit(1);
  }

  // Read compiled contract
  const contractJsonPath = path.resolve(__dirname, '../src/contracts/ApprovalGuard.json');
  if (!fs.existsSync(contractJsonPath)) {
    console.error('Compiled contract not found. Please run scripts/compile.cjs first.');
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(contractJsonPath, 'utf8'));

  console.log('Deploying ApprovalGuard.sol to BOT Chain (Chain ID: 968)...');
  const hash = await walletClient.deployContract({
    abi,
    bytecode: '0x' + bytecode.replace(/^0x/, ''),
    args: [],
  });

  console.log('Deployment transaction broadcasted! Tx Hash:', hash);
  console.log('Waiting for block confirmation on BOT Chain...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const deployedAddress = receipt.contractAddress;

  console.log('\n=========================================');
  console.log(' ApprovalGuard.sol Successfully Deployed! ');
  console.log('=========================================');
  console.log('Contract Address:', deployedAddress);
  console.log('Block Number:    ', receipt.blockNumber.toString());
  console.log('Gas Used:        ', receipt.gasUsed.toString());
  console.log('Bohr Scan URL:   ', `https://scan.bohr.life/address/${deployedAddress}`);
  console.log('Tx Receipt URL:  ', `https://scan.bohr.life/tx/${hash}\n`);

  // Update src/config/abi.ts with real deployed address
  const abiTsPath = path.resolve(__dirname, '../src/config/abi.ts');
  let abiTsContent = fs.readFileSync(abiTsPath, 'utf8');
  abiTsContent = abiTsContent.replace(
    /export const DEFAULT_APPROVAL_GUARD_ADDRESS = '0x[a-fA-F0-9]+' as `0x\$\{string\}`;/,
    `export const DEFAULT_APPROVAL_GUARD_ADDRESS = '${deployedAddress}' as \`0x\${string}\`;`
  );
  fs.writeFileSync(abiTsPath, abiTsContent);
  console.log('Updated src/config/abi.ts with the live deployed address.');

  // Save deployment artifact
  const deploymentRecord = {
    contract: 'ApprovalGuard',
    address: deployedAddress,
    deployer: account.address,
    network: 'BOT Chain Testnet',
    chainId: 968,
    txHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    timestamp: new Date().toISOString(),
    explorerUrl: `https://scan.bohr.life/address/${deployedAddress}`,
  };

  fs.writeFileSync(
    path.resolve(__dirname, '../src/contracts/deployment.json'),
    JSON.stringify(deploymentRecord, null, 2)
  );
  console.log('Deployment info saved to src/contracts/deployment.json');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
