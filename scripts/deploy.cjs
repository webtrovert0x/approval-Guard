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

// BOT Chain Mainnet config
const botChainMainnet = {
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
    public: { http: ['https://rpc.botchain.ai'] },
  },
};

const publicClient = createPublicClient({
  chain: botChainMainnet,
  transport: http('https://rpc.botchain.ai'),
});

const walletClient = createWalletClient({
  account,
  chain: botChainMainnet,
  transport: http('https://rpc.botchain.ai'),
});

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Deployer balance:', (Number(balance) / 1e18).toFixed(6), 'BOT');

  if (balance === 0n) {
    console.error('Deployer account has 0 BOT balance. Please ensure it has BOT for gas.');
    process.exit(1);
  }

  // Read compiled contract
  const contractJsonPath = path.resolve(__dirname, '../src/contracts/ApprovalGuard.json');
  if (!fs.existsSync(contractJsonPath)) {
    console.error('Compiled contract not found. Please run scripts/compile.cjs first.');
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(contractJsonPath, 'utf8'));

  const formattedBytecode = '0x' + bytecode.replace(/^0x/, '');

  console.log('Estimating gas for deployment...');
  const estimatedGas = await publicClient.estimateGas({
    account: account.address,
    data: formattedBytecode,
  });
  console.log('Estimated Gas:', estimatedGas.toString());

  const gasPrice = await publicClient.getGasPrice();
  console.log('Current Gas Price:', gasPrice.toString(), 'wei (' + (Number(gasPrice) / 1e9) + ' gwei)');
  const totalCost = (Number(estimatedGas * gasPrice) / 1e18);
  console.log('Total Estimated Cost:', totalCost.toFixed(6), 'BOT');

  console.log('\nDeploying ApprovalGuard.sol to BOT Chain Mainnet (Chain ID: 677)...');
  const hash = await walletClient.deployContract({
    abi,
    bytecode: formattedBytecode,
    args: [],
    gas: estimatedGas + 50000n, // safe minimal buffer
    gasPrice,
  });

  console.log('Deployment transaction broadcasted! Tx Hash:', hash);
  console.log('Waiting for block confirmation on BOT Chain Mainnet...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const deployedAddress = receipt.contractAddress;

  console.log('\n=========================================');
  console.log(' ApprovalGuard.sol Successfully Deployed! ');
  console.log('=========================================');
  console.log('Contract Address:', deployedAddress);
  console.log('Block Number:    ', receipt.blockNumber.toString());
  console.log('Gas Used:        ', receipt.gasUsed.toString());
  console.log('Actual Cost:     ', (Number(receipt.gasUsed * (receipt.effectiveGasPrice || gasPrice)) / 1e18).toFixed(6), 'BOT');
  console.log('Explorer URL:    ', `https://scan.botchain.ai/address/${deployedAddress}`);
  console.log('Tx Receipt URL:  ', `https://scan.botchain.ai/tx/${hash}\n`);

  // Update src/config/abi.ts with real deployed address and new ABI
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
    network: 'BOT Chain Mainnet',
    chainId: 677,
    txHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    timestamp: new Date().toISOString(),
    explorerUrl: `https://scan.botchain.ai/address/${deployedAddress}`,
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
