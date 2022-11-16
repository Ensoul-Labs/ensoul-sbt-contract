import {HardhatUserConfig} from 'hardhat/config';
import {BigNumber} from 'ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import 'hardhat-contract-sizer';
import '@openzeppelin/hardhat-upgrades';
import '@typechain/hardhat';
import 'solidity-coverage';
import '@nomiclabs/hardhat-etherscan';
import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('./sdk/src/typechain')) {
  import('./tasks');
}

dotenv.config();
const gasPrice = process.env.GAS_PRICE || 1;

let accounts = [process.env.TEST_PRIVATE_KEY as string];
let apiKey = process.env.GOERLI_SCAN_APIKEY;

if (process.env.NETWORK_ID == '89') {
  accounts = [process.env.PRIVATE_KEY as string];
  apiKey = process.env.POLYGON_SCAN_APIKEY;
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: '100000000000000000000000000',
      },
      blockGasLimit: 60000000,
      initialBaseFeePerGas: 0,
    },
    localhost: {
      url: process.env.LOCALHOST_NETWORK!,
      timeout: 60000,
      blockGasLimit: 60000000,
      gasPrice: BigNumber.from(gasPrice)
        .mul(10 ** 9)
        .toNumber(),
    },
    5: {
      url: process.env.GOERLI_NETWORK!,
      accounts,
      timeout: 60000,
      gasPrice: BigNumber.from(gasPrice)
        .mul(10 ** 9)
        .toNumber(),
    },
    89: {
      url: process.env.POLYGON_NETWORK!,
      accounts,
      timeout: 60000,
      gasPrice: BigNumber.from(gasPrice)
        .mul(10 ** 9)
        .toNumber(),
    },
  },
  namedAccounts: {
    deployer: 0,
    accountA: 1,
    accountB: 2,
    accountC: 3,
  },
  // 让控制台更干净
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  typechain: {
    outDir: './sdk/src/typechain',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey,
  },
};
export default config;
