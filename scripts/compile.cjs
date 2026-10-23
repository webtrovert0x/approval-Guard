const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts/ApprovalGuard.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'ApprovalGuard.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 1,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling ApprovalGuard.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  for (const error of output.errors) {
    console.error(error.formattedMessage);
    if (error.severity === 'error') {
      process.exit(1);
    }
  }
}

const contract = output.contracts['ApprovalGuard.sol']['ApprovalGuard'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

const outDir = path.resolve(__dirname, '../src/contracts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'ApprovalGuard.json'),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log('Compiled successfully to src/contracts/ApprovalGuard.json');
