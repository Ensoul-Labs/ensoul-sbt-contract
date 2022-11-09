import '@nomiclabs/hardhat-ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getImplementationAddress} from '@openzeppelin/upgrades-core';
import {PayableOverrides} from 'ethers';
import {
  EthersExecutionManager,
  getDeployment,
  setDeployment,
  LOCK_DIR,
  RETRY_NUMBER,
  log,
} from '../utils';

task(`beaconContract:deploy`, `Deploy beaconContract`)
  .addOptionalParam('contract', 'The contract name')
  .addOptionalParam('args', 'The contract args')
  .addOptionalParam('waitNum', 'The waitNum to transaction')
  .addOptionalParam('gasPrice', 'The gasPrice to transaction')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const chainId = Number(await hre.getChainId());
    const txConfig: PayableOverrides = {};
    if (chainId == 1) {
      txConfig.maxFeePerGas = args['gasPrice']
        ? hre.ethers.utils.parseUnits(args['gasPrice'], 'gwei')
        : undefined;
      txConfig.maxPriorityFeePerGas = hre.ethers.utils.parseUnits(
        '0.5',
        'gwei'
      );
    } else {
      txConfig.gasPrice = args['gasPrice']
        ? hre.ethers.utils.parseUnits(args['gasPrice'], 'gwei')
        : undefined;
    }
    const contractArgs = JSON.parse(args['args']);
    const waitNum = args['waitNum'] ? parseInt(args['waitNum']) : 1;
    const contract = args['contract'];
    const ethersExecutionManager = new EthersExecutionManager(
      `${LOCK_DIR}/contract:deploy ${contract}.lock`,
      RETRY_NUMBER,
      waitNum
    );
    await ethersExecutionManager.load();
    const operator = (await hre.ethers.getSigners())[0];

    log.info(`deploy ${contract}`);
    const Contract = await hre.ethers.getContractFactory(contract);

    const beacon = await hre.upgrades.deployBeacon(Contract);
    await beacon.deployed();
    console.log("Beacon deployed to:", beacon.address);
  
    const proxy = await (<any>hre).upgrades.deployBeaconProxy(beacon, Contract, contractArgs);
    const deployedProxy = await proxy.deployed();
    console.log(`${contract} deployed to:`, deployedProxy.address);

    // let deployResult = await ethersExecutionManager.transaction(
    //     (<any>hre).upgrades.deployBeacon,
    //     [Contract],
    //     ['contractAddress', 'blockNumber'],
    //     `deployBeacon`,
    //     txConfig
    //   );

    // console.log("Beacon deployed to:", deployResult.address);
  
    // deployResult = await ethersExecutionManager.transaction(
    //     (<any>hre).upgrades.deployBeaconProxy,
    //     [deployResult,Contract, contractArgs],
    //     ['contractAddress', 'blockNumber'],
    //     `deployBeaconProxy`,
    //     txConfig
    //   );
    // console.log(deployResult)
    const contractProxyAddress = deployedProxy.address;
    const contractImplAddress = beacon.address;
    const contractFromBlock = deployedProxy.blockNumber;
    const contractVersion = await deployedProxy.version();
    log.info(
      `${contract} deployed proxy at ${contractProxyAddress},impl at ${contractImplAddress},version ${contractVersion},fromBlock ${contractFromBlock}`
    );

    const deployment = await getDeployment(chainId);

    deployment[contract] = {
      proxyAddress: contractProxyAddress,
      implAddress: contractImplAddress,
      version: contractVersion,
      contract: contract,
      operator: operator.address,
      fromBlock: contractFromBlock,
    };

    await setDeployment(chainId, deployment);

    ethersExecutionManager.printGas();
    ethersExecutionManager.deleteLock();
  });
