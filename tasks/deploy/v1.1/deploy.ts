import '@nomiclabs/hardhat-ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {PayableOverrides} from 'ethers';
import {getImplementationAddress} from '@openzeppelin/upgrades-core';
import {
  EthersExecutionManager,
  getDeployment,
  setDeployment,
  LOCK_DIR,
  log,
} from '../../utils';

const ensoulContractName = 'Ensoul_Upgradeable_v1_1';
const ensoulFactoryContractName = 'Ensoul_Factory_Upgradeable_v1_1';

task(`deploy:v1.1`, `Deploy contract v1.1`)
  .addOptionalParam('gasPrice', 'The gasPrice to transaction')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const chainId = Number(await hre.getChainId());
    const txConfig: PayableOverrides = {};
    txConfig.gasPrice = args['gasPrice']
      ? hre.ethers.utils.parseUnits(args['gasPrice'], 'gwei')
      : undefined;
    const ethersExecutionManager = new EthersExecutionManager(
      `${LOCK_DIR}/contract:deploy:v1.1.lock`
    );
    await ethersExecutionManager.load();
    const operator = (await hre.ethers.getSigners())[0];

    log.info(`deploy Beacon`);
    const ensoulContractFactory = await hre.ethers.getContractFactory(
      ensoulContractName
    );
    let deployResult = await ethersExecutionManager.transaction(
      hre.upgrades.deployBeacon,
      [ensoulContractFactory],
      ['contractAddress'],
      `deployBeacon`,
      txConfig
    );
    const beaconAddress = deployResult.contractAddress;

    const ensoulFactoryContractFactory = await hre.ethers.getContractFactory(
      ensoulFactoryContractName
    );
    deployResult = await ethersExecutionManager.transaction(
      hre.upgrades.deployProxy,
      [ensoulFactoryContractFactory, [beaconAddress], {kind: 'uups'}],
      ['contractAddress', 'blockNumber'],
      `deploy ensoulFactory`,
      txConfig
    );
    const ensoulFactoryProxyAddress = deployResult.contractAddress;
    const ensoulFactoryImplAddress = await getImplementationAddress(
      hre.ethers.provider,
      ensoulFactoryProxyAddress
    );
    const ensoulFactoryFromBlock = deployResult.blockNumber;
    const ensoulFactoryContract = ensoulFactoryContractFactory.attach(
      ensoulFactoryProxyAddress
    );
    const ensoulFactoryVersion = await ethersExecutionManager.call(
      ensoulFactoryContract.version,
      [],
      `ensoulFactoryContract version`
    );
    log.info(
      `ensoulFactoryContract deployed proxy at ${ensoulFactoryProxyAddress},impl at ${ensoulFactoryImplAddress},version ${ensoulFactoryVersion},fromBlock ${ensoulFactoryFromBlock}`
    );

    const deployment = await getDeployment(chainId);

    deployment[ensoulFactoryContractName] = {
      proxyAddress: ensoulFactoryProxyAddress,
      implAddress: ensoulFactoryImplAddress,
      version: ensoulFactoryVersion,
      contract: ensoulFactoryContractName,
      operator: operator.address,
      fromBlock: ensoulFactoryFromBlock,
    };

    await setDeployment(chainId, deployment);

    ethersExecutionManager.printGas();
    ethersExecutionManager.deleteLock();
  });
